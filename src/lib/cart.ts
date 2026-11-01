import "server-only";
import { cookies } from "next/headers";
import { getProduct, type Product } from "./catalog";
import { shop } from "./config";
import { DEFAULT_LANG, type Lang } from "./i18n";

// Le panier est gardé dans un cookie : il marche sans compte et survit à la fermeture du navigateur.
// Les prix ne sont jamais lus depuis le cookie, toujours depuis le catalogue.
export const CART_COOKIE = "qs_cart";
export const MAX_QTY = 10;

export type CartLine = { product: Product; quantity: number; lineTotal: number };

type Raw = Record<string, number>;

export async function readRawCart(): Promise<Raw> {
  try {
    const raw = JSON.parse((await cookies()).get(CART_COOKIE)?.value ?? "{}");
    return raw && typeof raw === "object" && !Array.isArray(raw) ? raw : {};
  } catch {
    return {};
  }
}

export async function writeRawCart(raw: Raw) {
  const jar = await cookies();
  if (Object.keys(raw).length === 0) jar.delete(CART_COOKIE);
  else jar.set(CART_COOKIE, JSON.stringify(raw), { path: "/", sameSite: "lax", maxAge: 60 * 60 * 24 * 60 });
}

export function shippingFor(subtotal: number) {
  return subtotal === 0 || subtotal >= shop.freeShippingFrom ? 0 : shop.shippingFee;
}

export async function getCart(lang: Lang = DEFAULT_LANG) {
  const raw = await readRawCart();
  const lines: CartLine[] = [];
  for (const [id, q] of Object.entries(raw)) {
    const product = getProduct(id, lang);
    const quantity = Math.min(MAX_QTY, Math.max(0, Math.floor(Number(q))));
    if (!product || !quantity) continue;
    lines.push({ product, quantity, lineTotal: Math.round(product.price * quantity * 100) / 100 });
  }
  const subtotal = Math.round(lines.reduce((s, l) => s + l.lineTotal, 0) * 100) / 100;
  const shipping = shippingFor(subtotal);
  const count = lines.reduce((s, l) => s + l.quantity, 0);
  const unavailable = lines.filter((l) => l.product.stock < l.quantity);
  return { lines, subtotal, shipping, total: Math.round((subtotal + shipping) * 100) / 100, count, unavailable };
}
