import "server-only";
import { getCategory, categories } from "./categories";
import { listActiveProducts, findProduct } from "./db";
import type { Product } from "./products";

export { categories, getCategory } from "./categories";
export { discountPercent, type Product } from "./products";

// Produits en vente (statut « actif »), toutes boutiques confondues.
export function getProducts(): Product[] {
  return listActiveProducts();
}

// Un produit visible publiquement (les brouillons sont exclus).
export function getProduct(id: string) {
  const p = findProduct(id);
  return p && p.status === "actif" ? p : undefined;
}

// ---------- Recherche et filtres ----------

export const sortOptions = [
  { value: "pertinence", label: "Pertinence" },
  { value: "prix-asc", label: "Prix croissant" },
  { value: "prix-desc", label: "Prix décroissant" },
  { value: "note", label: "Meilleures notes" },
  { value: "avis", label: "Plus d'avis" },
  { value: "nouveautes", label: "Nouveautés" },
] as const;

export type SearchParams = {
  q?: string;
  cat?: string;
  shop?: string; // boutique (page vitrine), jamais lu depuis l'URL
  marque?: string[];
  min?: number;
  max?: number;
  note?: number;
  rapide?: boolean;
  promo?: boolean;
  stock?: boolean;
  tri?: string;
  page?: number;
};

export const PAGE_SIZE = 12;

function normalize(s: string) {
  return s.toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "");
}

export function parseSearchParams(raw: Record<string, string | string[] | undefined>): SearchParams {
  const one = (k: string) => (Array.isArray(raw[k]) ? raw[k]![0] : (raw[k] as string | undefined));
  const many = (k: string) => (raw[k] === undefined ? [] : Array.isArray(raw[k]) ? (raw[k] as string[]) : [raw[k] as string]);
  const num = (k: string) => {
    const v = one(k);
    const n = v ? Number(v) : NaN;
    return Number.isFinite(n) && n >= 0 ? n : undefined;
  };
  return {
    q: one("q")?.trim() || undefined,
    cat: one("cat") || undefined,
    marque: many("marque"),
    min: num("min"),
    max: num("max"),
    note: num("note"),
    rapide: one("rapide") === "1",
    promo: one("promo") === "1",
    stock: one("stock") === "1",
    tri: one("tri") || "pertinence",
    page: Math.max(1, Math.floor(num("page") ?? 1)),
  };
}

export function searchProducts(params: SearchParams) {
  const terms = params.q ? normalize(params.q).split(/\s+/).filter(Boolean) : [];

  // Base : texte + catégorie. Les facettes (marques, fourchettes) sont calculées sur cette base.
  const base = getProducts()
    .map((p) => {
      if (params.cat && p.category !== params.cat) return null;
      if (params.shop && p.sellerId !== params.shop) return null;
      if (!terms.length) return { p, score: 0 };
      const hay = normalize(`${p.title} ${p.brand} ${getCategory(p.category)?.name} ${p.features.join(" ")}`);
      const title = normalize(p.title);
      let score = 0;
      for (const t of terms) {
        if (!hay.includes(t)) return null;
        score += title.includes(t) ? 3 : 1;
      }
      return { p, score };
    })
    .filter((x): x is { p: Product; score: number } => x !== null);

  const brands = [...new Set(base.map((x) => x.p.brand))].sort((a, b) => a.localeCompare(b));
  const categoryCounts = categories
    .map((c) => ({ ...c, count: base.filter((x) => x.p.category === c.slug).length }))
    .filter((c) => c.count > 0);

  let results = base.filter(({ p }) => {
    if (params.marque?.length && !params.marque.includes(p.brand)) return false;
    if (params.min !== undefined && p.price < params.min) return false;
    if (params.max !== undefined && p.price > params.max) return false;
    if (params.note !== undefined && p.rating < params.note) return false;
    if (params.rapide && !p.fastDelivery) return false;
    if (params.promo && !p.listPrice) return false;
    if (params.stock && p.stock === 0) return false;
    return true;
  });

  const sorters: Record<string, (a: (typeof results)[0], b: (typeof results)[0]) => number> = {
    pertinence: (a, b) => b.score - a.score || b.p.reviewCount * b.p.rating - a.p.reviewCount * a.p.rating,
    "prix-asc": (a, b) => a.p.price - b.p.price,
    "prix-desc": (a, b) => b.p.price - a.p.price,
    note: (a, b) => b.p.rating - a.p.rating || b.p.reviewCount - a.p.reviewCount,
    avis: (a, b) => b.p.reviewCount - a.p.reviewCount,
    nouveautes: (a, b) => b.p.createdAt.localeCompare(a.p.createdAt),
  };
  results = [...results].sort(sorters[params.tri ?? "pertinence"] ?? sorters.pertinence);

  const total = results.length;
  const pageCount = Math.max(1, Math.ceil(total / PAGE_SIZE));
  const page = Math.min(params.page ?? 1, pageCount);
  return {
    items: results.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE).map((x) => x.p),
    total,
    page,
    pageCount,
    brands,
    categoryCounts,
  };
}
