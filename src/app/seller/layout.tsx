import Link from "next/link";
import { getCurrentUser } from "@/lib/auth";
import { findShop } from "@/lib/db";
import { getI18n } from "@/lib/i18n/server";

export default async function SellerLayout({ children }: { children: React.ReactNode }) {
  const { t } = await getI18n();
  const nav = t.seller.nav;
  const user = await getCurrentUser();
  const shop = user?.shopId ? findShop(user.shopId) : undefined;
  return (
    <div className="min-h-[70vh] bg-page">
      <div className="border-b border-line bg-surface">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center gap-x-6 gap-y-2 px-4 py-3">
          <Link href="/seller" className="font-display text-lg font-bold">
            {t.seller.area}
            {shop && <span className="ml-2 font-sans text-sm font-normal text-muted">· {shop.name}</span>}
          </Link>
          {shop && (
            <nav className="flex flex-wrap gap-1 text-sm">
              {[
                ["/seller", nav.dashboard],
                ["/seller/products", nav.products],
                ["/seller/orders", nav.orders],
                ["/seller/shop", nav.shop],
                [`/shop/${shop.slug}`, nav.storefront],
              ].map(([href, label]) => (
                <Link key={href} href={href} className="rounded-full px-3 py-1 hover:bg-surface-2">
                  {label}
                </Link>
              ))}
            </nav>
          )}
        </div>
      </div>
      <div className="mx-auto max-w-6xl px-4 py-6">{children}</div>
    </div>
  );
}
