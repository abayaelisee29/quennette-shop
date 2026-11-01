import type { Metadata } from "next";
import Link from "next/link";
import { ShopForm } from "@/components/ShopForm";
import { requireUser } from "@/lib/auth";
import { shop as site } from "@/lib/config";
import { fill, plural } from "@/lib/i18n";
import { getI18n } from "@/lib/i18n/server";
import { findShop, listShopOrders, listShopProducts } from "@/lib/db";

export async function generateMetadata(): Promise<Metadata> {
  return { title: (await getI18n()).t.seller.area };
}

const LOW_STOCK = 5;

export default async function SellerHome({ searchParams }: { searchParams: Promise<{ welcome?: string }> }) {
  const user = await requireUser("/seller");
  const { t, fmt } = await getI18n();
  const ob = t.seller.onboarding;
  const d = t.seller.dashboard;
  const shop = user.shopId ? findShop(user.shopId) : undefined;

  if (!shop) {
    return (
      <div className="grid gap-8 md:grid-cols-2">
        <div>
          <h1 className="font-display text-3xl font-bold">{fill(ob.title, { shop: site.name })}</h1>
          <p className="mt-3 text-muted">{ob.intro}</p>
          <ul className="mt-6 space-y-3">
            {ob.perks.map(([icon, title, text]) => (
              <li key={title} className="flex gap-3">
                <span className="text-2xl">{icon}</span>
                <span>
                  <b className="block">{title}</b>
                  <span className="text-sm text-muted">{text}</span>
                </span>
              </li>
            ))}
          </ul>
        </div>
        <div className="rounded-card border border-line bg-surface p-6">
          <h2 className="mb-4 text-xl font-bold">{ob.create}</h2>
          <ShopForm mode="create" />
        </div>
      </div>
    );
  }

  const { welcome } = await searchParams;
  const products = listShopProducts(shop.id);
  const orders = listShopOrders(shop.id);
  const myItems = orders.flatMap((o) => o.items.filter((i) => i.sellerId === shop.id).map((i) => ({ ...i, order: o })));
  const revenue = myItems.reduce((s, i) => s + i.unitPrice * i.quantity, 0);
  const sold = myItems.reduce((s, i) => s + i.quantity, 0);
  const toShip = orders.filter((o) => o.items.some((i) => i.sellerId === shop.id && i.shipStatus === "a_preparer"));
  const lowStock = products.filter((p) => p.status === "actif" && p.stock <= LOW_STOCK).sort((a, b) => a.stock - b.stock);
  const active = products.filter((p) => p.status === "actif").length;

  return (
    <div className="space-y-6">
      {welcome && (
        <div className="rounded-card border border-ok/40 bg-surface p-4">
          <b className="text-ok">{fill(d.welcome, { name: shop.name })}</b> {d.welcomeText}
        </div>
      )}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-2xl font-bold">{d.title}</h1>
        <Link href="/seller/products/new" className="rounded-full bg-brand px-5 py-2 font-medium text-brand-ink">
          {d.addProduct}
        </Link>
      </div>

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        {[
          [d.revenue, fmt.price(revenue), plural(sold, d.sold)],
          [d.orders, String(orders.length), d.paid],
          [d.toShip, String(toShip.length), toShip.length ? d.toHandle : d.nothingPending],
          [d.active, String(active), plural(products.length - active, d.drafts)],
        ].map(([label, value, sub]) => (
          <div key={label} className="rounded-card border border-line bg-surface p-4">
            <p className="text-sm text-muted">{label}</p>
            <p className="mt-1 text-2xl font-bold">{value}</p>
            <p className="text-xs text-muted">{sub}</p>
          </div>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <section className="rounded-card border border-line bg-surface p-5">
          <div className="mb-3 flex items-baseline justify-between">
            <h2 className="font-bold">{d.toShipTitle}</h2>
            <Link href="/seller/orders" className="text-sm text-link hover:underline">
              {d.seeAll}
            </Link>
          </div>
          {toShip.length === 0 ? (
            <p className="text-sm text-muted">{d.noneToShip}</p>
          ) : (
            <ul className="divide-y divide-line text-sm">
              {toShip.slice(0, 5).map((o) => (
                <li key={o.id} className="flex justify-between gap-2 py-2">
                  <span>
                    <b>{o.id.toUpperCase()}</b> · {o.address.fullName}, {o.address.city}
                  </span>
                  <span className="text-muted">{fmt.date(o.createdAt, { dateStyle: "short" })}</span>
                </li>
              ))}
            </ul>
          )}
        </section>
        <section className="rounded-card border border-line bg-surface p-5">
          <div className="mb-3 flex items-baseline justify-between">
            <h2 className="font-bold">{fill(d.lowStock, { n: LOW_STOCK })}</h2>
            <Link href="/seller/products?filter=stock" className="text-sm text-link hover:underline">
              {d.manageStock}
            </Link>
          </div>
          {lowStock.length === 0 ? (
            <p className="text-sm text-muted">{d.allStocked}</p>
          ) : (
            <ul className="divide-y divide-line text-sm">
              {lowStock.slice(0, 6).map((p) => (
                <li key={p.id} className="flex justify-between gap-2 py-2">
                  <Link href={`/seller/products/${p.id}`} className="line-clamp-1 hover:text-link">
                    {p.emoji} {p.title}
                  </Link>
                  <span className={p.stock === 0 ? "font-bold text-deal" : "text-ink"}>{p.stock === 0 ? d.soldOut : plural(p.stock, d.left)}</span>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>
    </div>
  );
}
