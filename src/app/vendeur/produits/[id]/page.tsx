import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ProductForm } from "@/components/ProductForm";
import { categories } from "@/lib/categories";
import { findProduct } from "@/lib/db";
import { requireSeller } from "@/lib/seller";

export const metadata: Metadata = { title: "Modifier le produit" };

export default async function EditProductPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const { shop } = await requireSeller(`/vendeur/produits/${id}`);
  const product = findProduct(id);
  if (!product || product.sellerId !== shop.id) notFound();
  return (
    <div>
      <Link href="/vendeur/produits" className="text-sm text-link hover:underline">
        ‹ Mes produits
      </Link>
      <div className="mt-1 mb-4 flex flex-wrap items-baseline justify-between gap-2">
        <h1 className="text-2xl font-bold">Modifier le produit</h1>
        {product.status === "actif" && (
          <Link href={`/produit/${product.id}`} className="text-sm text-link hover:underline">
            Voir la fiche publique ↗
          </Link>
        )}
      </div>
      <ProductForm product={product} categories={categories} />
    </div>
  );
}
