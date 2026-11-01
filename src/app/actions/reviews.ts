"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { getCurrentUser, newId, requireUser } from "@/lib/auth";
import { getProduct } from "@/lib/catalog";
import { getI18n } from "@/lib/i18n/server";
import { deleteReview, findReview, findUserReview, hasPurchased, toggleHelpful, upsertReview } from "@/lib/db";

export type ReviewFormState = { error?: string; values?: { rating?: string; title?: string; body?: string } };

export async function submitReview(_: ReviewFormState, form: FormData): Promise<ReviewFormState> {
  const productId = String(form.get("productId"));
  const user = await requireUser(`/product/${productId}/review`);
  const { lang, t } = await getI18n();
  const e = t.reviewForm.errors;
  const product = getProduct(productId, lang);
  if (!product) redirect("/");
  if (user.shopId === product.sellerId) return { error: e.own };

  const rating = Number(form.get("rating"));
  const title = String(form.get("title") ?? "").trim();
  const body = String(form.get("body") ?? "").trim();
  const values = { rating: String(form.get("rating") ?? ""), title, body };
  if (!Number.isInteger(rating) || rating < 1 || rating > 5) return { error: e.rating, values };
  if (title.length < 3 || title.length > 100) return { error: e.headline, values };
  if (body.length < 10 || body.length > 3000) return { error: e.body, values };

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
  redirect(`/product/${productId}?review=thanks#reviews`);
}

export async function deleteReviewAction(form: FormData) {
  const user = await requireUser("/account");
  const review = findReview(String(form.get("reviewId")));
  if (review) await deleteReview(review.id, user.id);
  revalidatePath("/", "layout");
  redirect(review ? `/product/${review.productId}#reviews` : "/account");
}

export async function toggleHelpfulAction(form: FormData) {
  const review = findReview(String(form.get("reviewId")));
  if (!review) return;
  const user = await getCurrentUser();
  if (!user) redirect(`/signin?next=${encodeURIComponent(`/product/${review.productId}#reviews`)}`);
  await toggleHelpful(review.id, user.id);
  revalidatePath(`/product/${review.productId}`);
}
