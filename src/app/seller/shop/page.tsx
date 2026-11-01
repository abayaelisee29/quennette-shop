import type { Metadata } from "next";
import { ShopForm } from "@/components/ShopForm";
import { fill } from "@/lib/i18n";
import { getI18n } from "@/lib/i18n/server";
import { requireSeller } from "@/lib/seller";

export async function generateMetadata(): Promise<Metadata> {
  return { title: (await getI18n()).t.seller.shopForm.title };
}

export default async function ShopSettingsPage() {
  const { shop } = await requireSeller("/seller/shop");
  const { t } = await getI18n();
  return (
    <div className="max-w-xl">
      <h1 className="mb-4 text-2xl font-bold">{t.seller.shopForm.title}</h1>
      <div className="rounded-card border border-line bg-surface p-6">
        <ShopForm mode="edit" defaults={{ name: shop.name, description: shop.description }} />
        <p className="mt-4 text-xs text-muted">{fill(t.seller.shopForm.address, { path: `/shop/${shop.slug}` })}</p>
      </div>
    </div>
  );
}
