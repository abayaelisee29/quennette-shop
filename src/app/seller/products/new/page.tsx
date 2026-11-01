import type { Metadata } from "next";
import Link from "next/link";
import { ProductForm } from "@/components/ProductForm";
import { getCategories } from "@/lib/categories";
import { getI18n } from "@/lib/i18n/server";
import { requireSeller } from "@/lib/seller";

export async function generateMetadata(): Promise<Metadata> {
  return { title: (await getI18n()).t.seller.form.newTitle };
}

export default async function NewProductPage() {
  await requireSeller("/seller/products/new");
  const { lang, t } = await getI18n();
  const f = t.seller.form;
  return (
    <div>
      <Link href="/seller/products" className="text-sm text-link hover:underline">
        {f.back}
      </Link>
      <h1 className="mt-1 mb-4 text-2xl font-bold">{f.newTitle}</h1>
      <ProductForm categories={getCategories(lang)} />
    </div>
  );
}
