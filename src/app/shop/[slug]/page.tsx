import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { SearchResults } from "@/components/SearchResults";
import { parseSearchParams } from "@/lib/catalog";
import { findShopBySlug } from "@/lib/db";
import { fill } from "@/lib/i18n";
import { getI18n } from "@/lib/i18n/server";

type Props = {
  params: Promise<{ slug: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const shop = findShopBySlug((await params).slug);
  const { t } = await getI18n();
  return { title: shop ? fill(t.shopPage.title, { name: shop.name }) : t.shopPage.label };
}

export default async function ShopPage({ params, searchParams }: Props) {
  const { slug } = await params;
  const shop = findShopBySlug(slug);
  if (!shop) notFound();
  const { t, fmt } = await getI18n();
  return (
    <>
      <div className="bg-hero text-nav-ink">
        <div className="mx-auto flex max-w-[1500px] items-center gap-4 px-4 py-8">
          <span className="grid h-16 w-16 place-items-center rounded-full bg-brand font-display text-3xl font-bold text-brand-ink">{shop.name[0]?.toUpperCase()}</span>
          <div>
            <p className="text-xs uppercase opacity-80">{t.shopPage.label}</p>
            <h1 className="font-display text-3xl font-bold">{shop.name}</h1>
            {shop.description && <p className="max-w-2xl opacity-85">{shop.description}</p>}
            <p className="mt-1 text-xs opacity-70">{fill(t.shopPage.since, { date: fmt.date(shop.createdAt, { month: "long", year: "numeric" }) })}</p>
          </div>
        </div>
      </div>
      <SearchResults params={parseSearchParams(await searchParams)} basePath={`/shop/${slug}`} lockedShop={shop.id} />
    </>
  );
}
