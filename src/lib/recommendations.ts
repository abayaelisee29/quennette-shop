import "server-only";
import { cookies } from "next/headers";
import { getProduct, getProducts, type Product } from "./catalog";
import { coPurchaseCounts, purchasedProductIds, type User } from "./db";

export const RECENT_COOKIE = "qs_vus";
const popularity = (p: Product) => p.reviewCount * p.rating;

// Ids des produits consultés récemment (cookie écrit par le navigateur, voir RecentlyViewedTracker).
export async function recentlyViewedIds() {
  const raw = (await cookies()).get(RECENT_COOKIE)?.value ?? "";
  return decodeURIComponent(raw)
    .split(",")
    .filter((id) => /^[a-z]{3}-\d{3}$|^prd_[a-f0-9]{16}$/.test(id))
    .slice(0, 20);
}

export async function recentlyViewed(excludeId?: string) {
  return (await recentlyViewedIds())
    .filter((id) => id !== excludeId)
    .map(getProduct)
    .filter((p): p is Product => !!p);
}

// « Les clients ayant acheté cet article ont également acheté » :
// d'abord les vrais achats communs, puis complété par les meilleurs produits de la même catégorie.
export function alsoBought(product: Product, limit = 14) {
  const co = coPurchaseCounts(product.id);
  const bought = [...co.entries()]
    .sort((a, b) => b[1] - a[1])
    .map(([id]) => getProduct(id))
    .filter((p): p is Product => !!p);
  const seen = new Set([product.id, ...bought.map((p) => p.id)]);
  const fill = getProducts()
    .filter((p) => !seen.has(p.id) && p.category === product.category)
    .sort((a, b) => popularity(b) - popularity(a));
  return [...bought, ...fill].slice(0, limit);
}

// « Fréquemment achetés ensemble » : 2 articles complémentaires, en stock, d'une autre gamme de prix si possible.
export function boughtTogether(product: Product) {
  const co = coPurchaseCounts(product.id);
  const candidates = getProducts().filter((p) => p.id !== product.id && p.stock > 0);
  const score = (p: Product) =>
    (co.get(p.id) ?? 0) * 1000 + (p.category === product.category ? 50 : 0) + (p.brand === product.brand ? 20 : 0) + (p.price < product.price ? 10 : 0) + popularity(p) / 10000;
  return candidates.sort((a, b) => score(b) - score(a)).slice(0, 2);
}

// « Recommandé pour vous » : catégories et marques des articles consultés, achetés ou en liste d'envies.
export async function forYou(user?: User, limit = 14) {
  const recent = await recentlyViewed();
  const signals = [...recent, ...(user?.wishlist ?? []).map(getProduct), ...(user ? purchasedProductIds(user.id).map(getProduct) : [])].filter(
    (p): p is Product => !!p
  );
  if (!signals.length) return [];
  const catWeight = new Map<string, number>();
  const brandWeight = new Map<string, number>();
  signals.forEach((p, i) => {
    const w = 1 / (1 + i * 0.2); // les signaux récents comptent plus
    catWeight.set(p.category, (catWeight.get(p.category) ?? 0) + w);
    brandWeight.set(p.brand, (brandWeight.get(p.brand) ?? 0) + w);
  });
  const exclude = new Set([...signals.map((p) => p.id), ...(user ? purchasedProductIds(user.id) : [])]);
  const score = (p: Product) => (catWeight.get(p.category) ?? 0) * 3 + (brandWeight.get(p.brand) ?? 0) * 2 + p.rating / 5 + Math.log10(1 + p.reviewCount) / 4;
  return getProducts()
    .filter((p) => !exclude.has(p.id) && p.stock > 0)
    .sort((a, b) => score(b) - score(a))
    .slice(0, limit);
}
