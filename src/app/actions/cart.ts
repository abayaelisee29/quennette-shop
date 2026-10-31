"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { getCurrentUser, safeReturnPath } from "@/lib/auth";
import { MAX_QTY, readRawCart, writeRawCart } from "@/lib/cart";
import { getProduct } from "@/lib/catalog";
import { toggleWishlist } from "@/lib/db";

function qty(v: FormDataEntryValue | null, fallback = 1) {
  const n = Math.floor(Number(v ?? fallback));
  return Number.isFinite(n) ? Math.min(MAX_QTY, Math.max(0, n)) : fallback;
}

async function add(form: FormData) {
  const id = String(form.get("productId"));
  const product = getProduct(id);
  if (!product || product.stock === 0) return null;
  const cart = await readRawCart();
  cart[id] = Math.min(MAX_QTY, product.stock, (cart[id] ?? 0) + Math.max(1, qty(form.get("quantity"))));
  await writeRawCart(cart);
  return id;
}

export async function addToCart(form: FormData) {
  const id = await add(form);
  redirect(id ? `/panier?ajout=${id}` : "/panier");
}

export async function buyNow(form: FormData) {
  await add(form);
  redirect("/commande");
}

export async function updateCartQuantity(form: FormData) {
  const id = String(form.get("productId"));
  const cart = await readRawCart();
  const q = qty(form.get("quantity"));
  if (q === 0) delete cart[id];
  else cart[id] = q;
  await writeRawCart(cart);
  revalidatePath("/panier");
}

export async function removeFromCart(form: FormData) {
  const cart = await readRawCart();
  delete cart[String(form.get("productId"))];
  await writeRawCart(cart);
  revalidatePath("/panier");
}

export async function clearCart() {
  await writeRawCart({});
}

// Bascule un produit dans la liste d'envies (il faut être connecté).
export async function toggleWishlistAction(form: FormData) {
  const id = String(form.get("productId"));
  const back = safeReturnPath(form.get("back"), `/produit/${id}`);
  const user = await getCurrentUser();
  if (!user) redirect(`/connexion?suite=${encodeURIComponent(back)}`);
  if (getProduct(id)) await toggleWishlist(user.id, id);
  revalidatePath(back);
  revalidatePath("/envies");
}

// Déplace un article de la liste d'envies vers le panier.
export async function moveWishToCart(form: FormData) {
  const user = await getCurrentUser();
  if (!user) redirect("/connexion?suite=/envies");
  const id = await add(form);
  if (id && user.wishlist.includes(id)) await toggleWishlist(user.id, id);
  redirect(id ? `/panier?ajout=${id}` : "/envies");
}

// « Fréquemment achetés ensemble » : ajoute plusieurs produits d'un coup.
export async function addManyToCart(form: FormData) {
  const cart = await readRawCart();
  for (const id of form.getAll("productId").map(String)) {
    const product = getProduct(id);
    if (!product || product.stock === 0) continue;
    cart[id] = Math.min(MAX_QTY, product.stock, (cart[id] ?? 0) + 1);
  }
  await writeRawCart(cart);
  redirect("/panier");
}
