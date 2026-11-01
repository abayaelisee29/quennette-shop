import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ProductForm } from "@/components/ProductForm";
import { getCategories } from "@/lib/categories";
import { getI18n } from "@/lib/i18n/server";
import { findProduct } from "@/lib/db";
import { requireSeller } from "@/lib/seller";

export async function generateMetadata(): Promise<Metadata> {
  return { title: (await getI18n()).t.seller.form.editTitle };
}

export default async function EditProductPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const { shop } = await requireSeller(`/seller/products/${id}`);
  const product = findProduct(id);
  if (!product || product.sellerId !== shop.id) notFound();
  const { lang, t } = await getI18n();
  const f = t.seller.form;
  return (
    <div>
      <Link href="/seller/products" className="text-sm text-link hover:underline">
        {f.back}
      </Link>
      <div className="mt-1 mb-4 flex flex-wrap items-baseline justify-between gap-2">
        <h1 className="text-2xl font-bold">{f.editTitle}</h1>
        {product.status === "actif" && (
          <Link href={`/product/${product.id}`} className="text-sm text-link hover:underline">
            {f.viewPublic}
          </Link>
        )}
      </div>
      <ProductForm product={product} categories={getCategories(lang)} />
    </div>
  );
}
