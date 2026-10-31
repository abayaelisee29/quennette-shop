import type { Metadata } from "next";
import Link from "next/link";
import { ProductForm } from "@/components/ProductForm";
import { categories } from "@/lib/categories";
import { requireSeller } from "@/lib/seller";

export const metadata: Metadata = { title: "Nouveau produit" };

export default async function NewProductPage() {
  await requireSeller("/vendeur/produits/nouveau");
  return (
    <div>
      <Link href="/vendeur/produits" className="text-sm text-link hover:underline">
        ‹ Mes produits
      </Link>
      <h1 className="mt-1 mb-4 text-2xl font-bold">Ajouter un produit</h1>
      <ProductForm categories={categories} />
    </div>
  );
}
