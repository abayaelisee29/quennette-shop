"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { newId, requireUser } from "@/lib/auth";
import { getCategory } from "@/lib/categories";
import { createShop, deleteProduct, findProduct, findShopBySlug, saveProduct, setShipStatus, setStock, updateShop, type ShipStatus } from "@/lib/db";
import type { Product } from "@/lib/products";
import { requireSeller, slugify } from "@/lib/seller";
import { saveImage } from "@/lib/uploads";

export type SellerFormState = { error?: string; values?: Record<string, string> };

const text = (f: FormData, k: string) => String(f.get(k) ?? "").trim();

// ---------- Boutique ----------

export async function createShopAction(_: SellerFormState, form: FormData): Promise<SellerFormState> {
  const user = await requireUser("/vendeur");
  if (user.shopId) redirect("/vendeur");
  const name = text(form, "name");
  const description = text(form, "description");
  const values = { name, description };
  if (name.length < 2 || name.length > 40) return { error: "Le nom de la boutique doit faire entre 2 et 40 caractères.", values };
  const base = slugify(name) || "boutique";
  let slug = base;
  for (let n = 2; findShopBySlug(slug); n++) slug = `${base}-${n}`;
  await createShop({ id: newId("shop"), slug, name, description, ownerId: user.id, createdAt: new Date().toISOString() });
  redirect("/vendeur?bienvenue=1");
}

export async function updateShopAction(_: SellerFormState, form: FormData): Promise<SellerFormState> {
  const { shop } = await requireSeller("/vendeur/boutique");
  const name = text(form, "name");
  const description = text(form, "description");
  if (name.length < 2 || name.length > 40) return { error: "Le nom de la boutique doit faire entre 2 et 40 caractères.", values: { name, description } };
  await updateShop(shop.id, { name, description });
  revalidatePath("/vendeur", "layout");
  return { values: { name, description, saved: "1" } };
}

// ---------- Produits ----------

export async function saveProductAction(_: SellerFormState, form: FormData): Promise<SellerFormState> {
  const { shop } = await requireSeller("/vendeur/produits");
  const id = text(form, "id");
  const existing = id ? findProduct(id) : undefined;
  if (id && (!existing || existing.sellerId !== shop.id)) redirect("/vendeur/produits");

  const values: Record<string, string> = {};
  for (const k of ["title", "brand", "category", "price", "listPrice", "stock", "emoji", "description", "features", "status"]) values[k] = text(form, k);
  values.fastDelivery = form.get("fastDelivery") ? "1" : "";

  const price = Number(values.price.replace(",", "."));
  const listPrice = values.listPrice ? Number(values.listPrice.replace(",", ".")) : undefined;
  const stock = Number(values.stock);
  const err = (error: string) => ({ error, values });

  if (values.title.length < 3) return err("Le titre doit contenir au moins 3 caractères.");
  if (!values.brand) return err("Indiquez la marque.");
  if (!getCategory(values.category)) return err("Choisissez une catégorie.");
  if (!Number.isFinite(price) || price <= 0) return err("Le prix doit être un nombre positif.");
  if (listPrice !== undefined && (!Number.isFinite(listPrice) || listPrice <= price)) return err("Le prix barré doit être supérieur au prix de vente (ou laissé vide).");
  if (!Number.isInteger(stock) || stock < 0) return err("Le stock doit être un nombre entier positif ou nul.");

  let imageUrl = existing?.imageUrl;
  const file = form.get("image");
  if (file instanceof File && file.size > 0) {
    try {
      imageUrl = await saveImage(file);
    } catch (e) {
      return err((e as Error).message);
    }
  }
  if (form.get("removeImage")) imageUrl = undefined;

  const product: Product = {
    id: existing?.id ?? newId("prd"),
    title: values.title,
    brand: values.brand,
    category: values.category,
    price: Math.round(price * 100) / 100,
    listPrice: listPrice !== undefined ? Math.round(listPrice * 100) / 100 : undefined,
    rating: existing?.rating ?? 0,
    reviewCount: existing?.reviewCount ?? 0,
    stock,
    fastDelivery: !!values.fastDelivery,
    emoji: values.emoji || getCategory(values.category)!.emoji,
    hue: existing?.hue ?? Math.floor(Math.random() * 360),
    description: values.description,
    features: values.features
      .split("\n")
      .map((s) => s.trim())
      .filter(Boolean)
      .slice(0, 10),
    createdAt: existing?.createdAt ?? new Date().toISOString(),
    sellerId: shop.id,
    status: values.status === "brouillon" ? "brouillon" : "actif",
    imageUrl,
  };
  await saveProduct(product);
  revalidatePath("/", "layout");
  redirect(`/vendeur/produits?enregistre=${product.id}`);
}

export async function deleteProductAction(form: FormData) {
  const { shop } = await requireSeller("/vendeur/produits");
  await deleteProduct(String(form.get("id")), shop.id);
  revalidatePath("/", "layout");
  redirect("/vendeur/produits");
}

export async function updateStockAction(form: FormData) {
  const { shop } = await requireSeller("/vendeur/produits");
  const stock = Math.floor(Number(form.get("stock")));
  if (Number.isFinite(stock) && stock >= 0) await setStock(String(form.get("id")), shop.id, stock);
  revalidatePath("/vendeur", "layout");
}

// ---------- Commandes ----------

export async function updateShipmentAction(form: FormData) {
  const { shop } = await requireSeller("/vendeur/commandes");
  const status = String(form.get("status")) as ShipStatus;
  if (!["a_preparer", "expediee", "livree"].includes(status)) return;
  const tracking = form.has("tracking") ? text(form, "tracking") : undefined;
  await setShipStatus(String(form.get("orderId")), shop.id, status, tracking);
  revalidatePath("/vendeur", "layout");
  revalidatePath("/compte");
}
