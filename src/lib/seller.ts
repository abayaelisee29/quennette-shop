import "server-only";
import { redirect } from "next/navigation";
import { requireUser } from "./auth";
import { findShop } from "./db";

// Utilisateur connecté qui possède une boutique ; sinon redirige vers la création de boutique.
export async function requireSeller(returnTo: string) {
  const user = await requireUser(returnTo);
  const shop = user.shopId ? findShop(user.shopId) : undefined;
  if (!shop) redirect("/seller");
  return { user, shop };
}

export function slugify(s: string) {
  return s
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 40);
}
