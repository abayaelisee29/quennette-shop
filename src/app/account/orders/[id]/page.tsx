import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { addManyToCart } from "@/app/actions/cart";
import { OrderSummary } from "@/components/OrderSummary";
import { ProductImage } from "@/components/ProductImage";
import { requireUser } from "@/lib/auth";
import { getProduct } from "@/lib/catalog";
import { fill } from "@/lib/i18n";
import { getI18n, type Formatters } from "@/lib/i18n/server";
import { findOrder, findShop, findUserReview, type OrderItem } from "@/lib/db";

export async function generateMetadata(): Promise<Metadata> {
  return { title: (await getI18n()).t.tracking.pageTitle };
}

function Timeline({ steps, fmt }: { steps: { label: string; date?: string; done: boolean }[]; fmt: Formatters }) {
  const current = steps.filter((s) => s.done).length - 1;
  return (
    <ol className="relative my-4 grid grid-cols-4">
      <div className="absolute top-3 right-[12.5%] left-[12.5%] h-1 rounded bg-line" />
      <div className="absolute top-3 left-[12.5%] h-1 rounded bg-ok transition-all" style={{ width: `${(Math.max(0, current) / (steps.length - 1)) * 75}%` }} />
      {steps.map((s, i) => (
        <li key={s.label} className="relative flex flex-col items-center text-center">
          <span className={`z-10 grid h-7 w-7 place-items-center rounded-full border-2 text-xs font-bold ${s.done ? "border-ok bg-ok text-white" : "border-line bg-surface text-muted"} ${i === current ? "ring-4 ring-ok/25" : ""}`}>
            {s.done ? "✓" : i + 1}
          </span>
          <span className={`mt-2 text-xs sm:text-sm ${s.done ? "font-bold" : "text-muted"}`}>{s.label}</span>
          {s.date && <span className="text-[11px] text-muted">{fmt.dateTime(s.date, { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" })}</span>}
        </li>
      ))}
    </ol>
  );
}

export default async function OrderTrackingPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const user = await requireUser(`/account/orders/${id}`);
  const { lang, t, fmt } = await getI18n();
  const tr = t.tracking;
  const fmtDay = (iso: string) => fmt.date(iso, { weekday: "long", day: "numeric", month: "long" });
  const order = await findOrder(id);
  if (!order || order.userId !== user.id) notFound();

  // Un colis par vendeur : chaque boutique expédie ses propres articles.
  const parcels = new Map<string, OrderItem[]>();
  for (const i of order.items) parcels.set(i.sellerId, [...(parcels.get(i.sellerId) ?? []), i]);
  const eta = new Date(order.paidAt ?? order.createdAt);
  eta.setDate(eta.getDate() + 3);
  const count = order.items.reduce((s, i) => s + i.quantity, 0);
  const paid = order.status === "payee";

  return (
    <div className="mx-auto max-w-4xl px-4 py-8">
      <nav className="mb-2 text-sm text-muted">
        <Link href="/account" className="hover:underline">
          {tr.crumbAccount}
        </Link>{" "}
        ›{" "}
        <Link href="/account#orders" className="hover:underline">
          {tr.crumbOrders}
        </Link>{" "}
        › <span className="text-ink">{tr.crumbTrack}</span>
      </nav>
      <div className="flex flex-wrap items-end justify-between gap-2">
        <h1 className="text-3xl font-medium">{tr.title}</h1>
        <p className="text-sm text-muted">
          {fill(tr.meta, { id: order.id.toUpperCase(), date: fmt.date(order.createdAt) })}
        </p>
      </div>

      {!paid && (
        <p className="mt-4 rounded-card border border-line bg-surface p-4 text-sm">
          {order.status === "annulee" ? tr.canceled : tr.awaiting}
        </p>
      )}

      <div className="mt-6 space-y-5">
        {[...parcels.entries()].map(([sellerId, items], n) => {
          const delivered = items.every((i) => i.shipStatus === "livree");
          const shipped = items.every((i) => i.shipStatus !== "a_preparer");
          const first = items[0];
          const shop = findShop(sellerId);
          return (
            <section key={sellerId} className="rounded-card border border-line bg-surface p-5">
              <div className="flex flex-wrap items-baseline justify-between gap-2">
                <h2 className="text-xl font-bold text-ok">
                  {delivered
                    ? fill(tr.deliveredOn, { date: fmtDay(first.deliveredAt ?? first.shippedAt ?? order.createdAt) })
                    : shipped
                      ? fill(tr.arriving, { date: fmtDay(eta.toISOString()) })
                      : paid
                        ? fill(tr.expected, { date: fmtDay(eta.toISOString()) })
                        : tr.pending}
                </h2>
                <span className="text-sm text-muted">
                  {fill(tr.parcel, { i: n + 1, n: parcels.size })}
                  {shop && <> · {tr.shippedBy} {shop.ownerId ? <Link href={`/shop/${shop.slug}`} className="text-link hover:underline">{shop.name}</Link> : shop.name}</>}
                </span>
              </div>
              {paid && (
                <Timeline
                  fmt={fmt}
                  steps={[
                    { label: tr.steps.ordered, date: order.createdAt, done: true },
                    { label: tr.steps.paid, date: order.paidAt, done: true },
                    { label: tr.steps.shipped, date: first.shippedAt, done: shipped },
                    { label: tr.steps.delivered, date: first.deliveredAt, done: delivered },
                  ]}
                />
              )}
              {first.trackingNumber && (
                <p className="mb-3 rounded-card bg-surface-2 px-3 py-2 text-sm">
                  {tr.trackingNo} <b className="font-mono">{first.trackingNumber}</b>
                </p>
              )}
              <ul className="divide-y divide-line">
                {items.map((i) => {
                  const p = getProduct(i.productId, lang);
                  const reviewed = findUserReview(i.productId, user.id);
                  return (
                    <li key={i.productId} className="flex gap-4 py-3">
                      <div className="w-20 shrink-0 [container-type:inline-size]">
                        {p ? <ProductImage product={p} /> : <div className="grid aspect-square place-items-center rounded-card bg-surface-2 text-3xl">📦</div>}
                      </div>
                      <div className="min-w-0 flex-1 text-sm">
                        {p ? (
                          <Link href={`/product/${p.id}`} className="line-clamp-2 text-link hover:underline">
                            {i.title}
                          </Link>
                        ) : (
                          <span>{i.title}</span>
                        )}
                        <p className="text-muted">{fill(tr.qty, { n: i.quantity, price: fmt.price(i.unitPrice) })}</p>
                        <div className="mt-2 flex flex-wrap gap-2">
                          {p && p.stock > 0 && (
                            <form action={addManyToCart}>
                              <input type="hidden" name="productId" value={p.id} />
                              <button className="rounded-full bg-brand px-3 py-1 text-xs font-medium text-brand-ink">{tr.buyAgain}</button>
                            </form>
                          )}
                          {p && paid && (
                            <Link href={`/product/${p.id}/review`} className="rounded-full border border-line px-3 py-1 text-xs hover:bg-surface-2">
                              {reviewed ? tr.editReview : tr.writeReview}
                            </Link>
                          )}
                        </div>
                      </div>
                    </li>
                  );
                })}
              </ul>
            </section>
          );
        })}

        <div className="grid gap-5 md:grid-cols-2">
          <section className="rounded-card border border-line bg-surface p-5 text-sm">
            <h2 className="mb-2 text-lg font-bold">{tr.shippingAddress}</h2>
            <p>
              {order.address.fullName}
              <br />
              {order.address.line1}
              {order.address.line2 && (
                <>
                  <br />
                  {order.address.line2}
                </>
              )}
              <br />
              {order.address.postalCode} {order.address.city}
              <br />
              {order.address.country}
              <br />
              {order.address.phone}
            </p>
            <p className="mt-3 text-muted">{tr.payment} {order.paymentMode === "demo" ? tr.paymentDemo : tr.paymentStripe}</p>
          </section>
          <OrderSummary subtotal={order.subtotal} shipping={order.shipping} total={order.total} count={count} />
        </div>
      </div>
    </div>
  );
}
