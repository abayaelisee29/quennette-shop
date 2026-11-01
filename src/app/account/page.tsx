import type { Metadata } from "next";
import Link from "next/link";
import { signOut } from "@/app/actions/auth";
import { requireUser } from "@/lib/auth";
import { getProduct } from "@/lib/catalog";
import { fill, plural } from "@/lib/i18n";
import { getI18n } from "@/lib/i18n/server";
import { listOrders } from "@/lib/db";

export async function generateMetadata(): Promise<Metadata> {
  return { title: (await getI18n()).t.account.title };
}

export default async function AccountPage() {
  const user = await requireUser("/account");
  const { lang, t, fmt } = await getI18n();
  const a = t.account;
  const orders = await listOrders(user.id);
  const paid = orders.filter((o) => o.status === "payee");

  return (
    <div className="mx-auto max-w-4xl px-4 py-8">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-medium">{a.title}</h1>
          <p className="text-muted">
            {user.name} · {user.email}
          </p>
        </div>
        <form action={signOut}>
          <button className="rounded-full border border-line bg-surface px-4 py-1.5 text-sm hover:bg-surface-2">{a.signOut}</button>
        </form>
      </div>

      <div className="mt-6 grid gap-4 sm:grid-cols-3">
        {[
          ["📦", a.orders, plural(paid.length, a.ordersCount), "#orders"],
          ["♡", a.wishlist, plural(user.wishlist.length, a.itemsCount), "/wishlist"],
          ["🛒", a.cart, a.viewCart, "/cart"],
        ].map(([icon, title, sub, href]) => (
          <Link key={title} href={href} className="flex gap-3 rounded-card border border-line bg-surface p-4 hover:bg-surface-2">
            <span className="text-3xl">{icon}</span>
            <span>
              <span className="block font-bold">{title}</span>
              <span className="text-sm text-muted">{sub}</span>
            </span>
          </Link>
        ))}
      </div>

      <h2 id="orders" className="mt-10 mb-4 text-2xl font-medium">
        {a.orders}
      </h2>
      {paid.length === 0 ? (
        <p className="rounded-card border border-line bg-surface p-6 text-muted">
          {a.noOrders}{" "}
          <Link href="/" className="text-link hover:underline">
            {a.startShopping}
          </Link>
        </p>
      ) : (
        <div className="space-y-4">
          {paid.map((o) => {
            const [label, color] =
              o.status === "en_attente"
                ? [a.status.pending, "text-muted"]
                : o.status === "annulee"
                  ? [a.status.canceled, "text-deal"]
                  : o.items.every((i) => i.shipStatus === "livree")
                    ? [a.status.delivered, "text-ok"]
                    : o.items.some((i) => i.shipStatus !== "a_preparer")
                      ? [a.status.shipped, "text-ok"]
                      : [a.status.paid, "text-ok"];
            return (
              <article key={o.id} className="overflow-hidden rounded-card border border-line bg-surface">
                <header className="flex flex-wrap gap-x-8 gap-y-1 bg-surface-2 px-4 py-3 text-xs text-muted">
                  <span>
                    {a.placed}
                    <br />
                    <b className="text-ink">{fmt.date(o.createdAt)}</b>
                  </span>
                  <span>
                    {a.total}
                    <br />
                    <b className="text-ink">{fmt.price(o.total)}</b>
                  </span>
                  <span>
                    {a.shipTo}
                    <br />
                    <b className="text-ink">{o.address.fullName}</b>
                  </span>
                  <span className="ml-auto text-right">
                    {fill(a.orderNo, { id: o.id.toUpperCase() })}
                    <br />
                    {o.paymentMode === "demo" && <span>{a.simulated}</span>}
                  </span>
                </header>
                <div className="p-4">
                  <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
                    <p className={`font-bold ${color}`}>{label}</p>
                    <Link href={`/account/orders/${o.id}`} className="rounded-full bg-brand px-4 py-1.5 text-sm font-medium text-brand-ink">
                      {a.track}
                    </Link>
                  </div>
                  <ul className="space-y-2">
                    {o.items.map((i) => (
                      <li key={i.productId} className="flex items-center gap-3 text-sm">
                        <span className="text-2xl">{getProduct(i.productId, lang)?.emoji ?? "📦"}</span>
                        <Link href={`/product/${i.productId}`} className="flex-1 text-link hover:underline">
                          {i.title}
                        </Link>
                        <span className={`text-xs ${i.shipStatus === "a_preparer" ? "text-muted" : "text-ok"}`}>
                          {a.ship[i.shipStatus ?? "a_preparer"]}
                          {i.trackingNumber ? ` · ${fill(a.tracking, { n: i.trackingNumber })}` : ""}
                        </span>
                        <span className="text-muted">× {i.quantity}</span>
                        <span className="w-20 text-right">{fmt.price(i.unitPrice * i.quantity)}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </article>
            );
          })}
        </div>
      )}
    </div>
  );
}
