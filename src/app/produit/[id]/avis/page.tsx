import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ProductImage } from "@/components/ProductImage";
import { ReviewForm } from "@/components/ReviewForm";
import { requireUser } from "@/lib/auth";
import { getProduct } from "@/lib/catalog";
import { findUserReview, hasPurchased } from "@/lib/db";

export const metadata: Metadata = { title: "Écrire un commentaire" };

export default async function WriteReviewPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const user = await requireUser(`/produit/${id}/avis`);
  const product = getProduct(id);
  if (!product) notFound();
  const existing = findUserReview(id, user.id);
  const bought = hasPurchased(user.id, id);
  const own = user.shopId === product.sellerId;

  return (
    <div className="mx-auto max-w-2xl px-4 py-8">
      <h1 className="text-2xl font-bold">{existing ? "Modifier votre commentaire" : "Créer un commentaire"}</h1>
      <div className="mt-4 flex items-center gap-3 border-b border-line pb-4">
        <div className="w-16 [container-type:inline-size]">
          <ProductImage product={product} />
        </div>
        <Link href={`/produit/${id}`} className="hover:text-link">
          {product.title}
        </Link>
      </div>
      {own ? (
        <p className="mt-6 text-muted">Vous ne pouvez pas évaluer vos propres produits.</p>
      ) : (
        <div className="mt-6 rounded-card border border-line bg-surface p-6">
          <p className="mb-4 text-sm text-muted">
            {bought
              ? "Vous avez acheté ce produit : votre commentaire portera la mention « Achat vérifié »."
              : "Vous n'avez pas acheté ce produit sur Queennette : votre commentaire sera publié sans la mention « Achat vérifié »."}
          </p>
          <ReviewForm productId={id} defaults={existing && { rating: existing.rating, title: existing.title, body: existing.body }} />
        </div>
      )}
    </div>
  );
}
