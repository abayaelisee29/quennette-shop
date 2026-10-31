import type { Metadata } from "next";
import { ShopForm } from "@/components/ShopForm";
import { requireSeller } from "@/lib/seller";

export const metadata: Metadata = { title: "Ma boutique" };

export default async function ShopSettingsPage() {
  const { shop } = await requireSeller("/vendeur/boutique");
  return (
    <div className="max-w-xl">
      <h1 className="mb-4 text-2xl font-bold">Ma boutique</h1>
      <div className="rounded-card border border-line bg-surface p-6">
        <ShopForm mode="edit" defaults={{ name: shop.name, description: shop.description }} />
        <p className="mt-4 text-xs text-muted">Adresse de votre vitrine : /boutique/{shop.slug}</p>
      </div>
    </div>
  );
}
