import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ProductImage } from "@/components/ProductImage";
import { ReviewForm } from "@/components/ReviewForm";
import { requireUser } from "@/lib/auth";
import { getProduct } from "@/lib/catalog";
import { findUserReview, hasPurchased } from "@/lib/db";
import { getI18n } from "@/lib/i18n/server";

export async function generateMetadata(): Promise<Metadata> {
  return { title: (await getI18n()).t.reviewForm.pageTitle };
}

export default async function WriteReviewPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const user = await requireUser(`/product/${id}/review`);
  const { lang, t } = await getI18n();
  const f = t.reviewForm;
  const product = getProduct(id, lang);
  if (!product) notFound();
  const existing = findUserReview(id, user.id);
  const bought = hasPurchased(user.id, id);
  const own = user.shopId === product.sellerId;

  return (
    <div className="mx-auto max-w-2xl px-4 py-8">
      <h1 className="text-2xl font-bold">{existing ? f.editTitle : f.createTitle}</h1>
      <div className="mt-4 flex items-center gap-3 border-b border-line pb-4">
        <div className="w-16 [container-type:inline-size]">
          <ProductImage product={product} />
        </div>
        <Link href={`/product/${id}`} className="hover:text-link">
          {product.title}
        </Link>
      </div>
      {own ? (
        <p className="mt-6 text-muted">{f.errors.own}</p>
      ) : (
        <div className="mt-6 rounded-card border border-line bg-surface p-6">
          <p className="mb-4 text-sm text-muted">
            {bought ? f.verifiedNote : f.unverifiedNote}
          </p>
          <ReviewForm productId={id} defaults={existing && { rating: existing.rating, title: existing.title, body: existing.body }} />
        </div>
      )}
    </div>
  );
}
