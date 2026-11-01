import "server-only";
import { categoryDefs, getCategories, getCategory } from "./categories";
import { findProduct, listActiveProducts } from "./db";
import type { Lang } from "./i18n";
import { localizeProduct, type Product } from "./products";

export { getCategories, getCategory } from "./categories";
export { discountPercent, type Product } from "./products";

// Produits en vente (statut « actif »), toutes boutiques confondues, dans la langue demandée.
export function getProducts(lang: Lang): Product[] {
  return listActiveProducts().map((p) => localizeProduct(p, lang));
}

// Un produit visible publiquement (les brouillons sont exclus).
export function getProduct(id: string, lang: Lang) {
  const p = findProduct(id);
  return p && p.status === "actif" ? localizeProduct(p, lang) : undefined;
}

// ---------- Recherche et filtres ----------

export const SORTS = ["relevance", "price-asc", "price-desc", "rating", "reviews", "newest"] as const;
export type Sort = (typeof SORTS)[number];

export type SearchParams = {
  q?: string;
  cat?: string;
  shop?: string; // boutique (page vitrine), jamais lu depuis l'URL
  brand?: string[];
  min?: number;
  max?: number;
  rating?: number;
  fast?: boolean;
  deal?: boolean;
  stock?: boolean;
  sort?: Sort;
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
  const sort = one("sort");
  return {
    q: one("q")?.trim() || undefined,
    cat: one("cat") || undefined,
    brand: many("brand"),
    min: num("min"),
    max: num("max"),
    rating: num("rating"),
    fast: one("fast") === "1",
    deal: one("deal") === "1",
    stock: one("stock") === "1",
    sort: (SORTS as readonly string[]).includes(sort ?? "") ? (sort as Sort) : "relevance",
    page: Math.max(1, Math.floor(num("page") ?? 1)),
  };
}

export function searchProducts(params: SearchParams, lang: Lang) {
  const terms = params.q ? normalize(params.q).split(/\s+/).filter(Boolean) : [];
  const catNames = new Map(categoryDefs.map((c) => [c.slug, `${c.en.name} ${c.fr.name}`]));

  // Base : texte + catégorie. Les facettes (marques, fourchettes) sont calculées sur cette base.
  // La recherche porte sur l'anglais et le français, quelle que soit la langue affichée.
  const base = listActiveProducts()
    .map((raw) => {
      if (params.cat && raw.category !== params.cat) return null;
      if (params.shop && raw.sellerId !== params.shop) return null;
      const p = localizeProduct(raw, lang);
      if (!terms.length) return { p, score: 0 };
      const hay = normalize(
        [raw.title, raw.fr?.title, raw.brand, catNames.get(raw.category), raw.features.join(" "), raw.fr?.features.join(" ")].filter(Boolean).join(" ")
      );
      const title = normalize(`${raw.title} ${raw.fr?.title ?? ""}`);
      let score = 0;
      for (const t of terms) {
        if (!hay.includes(t)) return null;
        score += title.includes(t) ? 3 : 1;
      }
      return { p, score };
    })
    .filter((x): x is { p: Product; score: number } => x !== null);

  const brands = [...new Set(base.map((x) => x.p.brand))].sort((a, b) => a.localeCompare(b));
  const categoryCounts = getCategories(lang)
    .map((c) => ({ ...c, count: base.filter((x) => x.p.category === c.slug).length }))
    .filter((c) => c.count > 0);

  let results = base.filter(({ p }) => {
    if (params.brand?.length && !params.brand.includes(p.brand)) return false;
    if (params.min !== undefined && p.price < params.min) return false;
    if (params.max !== undefined && p.price > params.max) return false;
    if (params.rating !== undefined && p.rating < params.rating) return false;
    if (params.fast && !p.fastDelivery) return false;
    if (params.deal && !p.listPrice) return false;
    if (params.stock && p.stock === 0) return false;
    return true;
  });

  type Row = (typeof results)[0];
  const sorters: Record<Sort, (a: Row, b: Row) => number> = {
    relevance: (a, b) => b.score - a.score || b.p.reviewCount * b.p.rating - a.p.reviewCount * a.p.rating,
    "price-asc": (a, b) => a.p.price - b.p.price,
    "price-desc": (a, b) => b.p.price - a.p.price,
    rating: (a, b) => b.p.rating - a.p.rating || b.p.reviewCount - a.p.reviewCount,
    reviews: (a, b) => b.p.reviewCount - a.p.reviewCount,
    newest: (a, b) => b.p.createdAt.localeCompare(a.p.createdAt),
  };
  results = [...results].sort(sorters[params.sort ?? "relevance"]);

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
    category: params.cat ? getCategory(params.cat, lang) : undefined,
  };
}
