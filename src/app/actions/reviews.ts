"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { getCurrentUser, newId, requireUser } from "@/lib/auth";
import { getProduct } from "@/lib/catalog";
import { deleteReview, findReview, findUserReview, hasPurchased, toggleHelpful, upsertReview } from "@/lib/db";

export type ReviewFormState = { error?: string; values?: { rating?: string; title?: string; body?: string } };

export async function submitReview(_: ReviewFormState, form: FormData): Promise<ReviewFormState> {
  const productId = String(form.get("productId"));
  const user = await requireUser(`/produit/${productId}/avis`);
  const product = getProduct(productId);
  if (!product) redirect("/");
  if (user.shopId === product.sellerId) return { error: "Vous ne pouvez pas noter vos propres produits." };

  const rating = Number(form.get("rating"));
  const title = String(form.get("title") ?? "").trim();
  const body = String(form.get("body") ?? "").trim();
  const values = { rating: String(form.get("rating") ?? ""), title, body };
  if (!Number.isInteger(rating) || rating < 1 || rating > 5) return { error: "Choisissez une note de 1 à 5 étoiles.", values };
  if (title.length < 3 || title.length > 100) return { error: "Le titre doit faire entre 3 et 100 caractères.", values };
  if (body.length < 10 || body.length > 3000) return { error: "Votre avis doit faire entre 10 et 3000 caractères.", values };

  const existing = findUserReview(productId, user.id);
  await upsertReview({
    id: existing?.id ?? newId("avis"),
    productId,
    userId: user.id,
    userName: user.name,
    rating,
    title,
    body,
    verified: hasPurchased(user.id, productId),
  });
  revalidatePath("/", "layout");
  redirect(`/produit/${productId}?avis=merci#avis`);
}

export async function deleteReviewAction(form: FormData) {
  const user = await requireUser("/compte");
  const review = findReview(String(form.get("reviewId")));
  if (review) await deleteReview(review.id, user.id);
  revalidatePath("/", "layout");
  redirect(review ? `/produit/${review.productId}#avis` : "/compte");
}

export async function toggleHelpfulAction(form: FormData) {
  const review = findReview(String(form.get("reviewId")));
  if (!review) return;
  const user = await getCurrentUser();
  if (!user) redirect(`/connexion?suite=${encodeURIComponent(`/produit/${review.productId}#avis`)}`);
  await toggleHelpful(review.id, user.id);
  revalidatePath(`/produit/${review.productId}`);
}
