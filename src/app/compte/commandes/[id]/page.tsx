import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { addManyToCart } from "@/app/actions/cart";
import { OrderSummary } from "@/components/OrderSummary";
import { ProductImage } from "@/components/ProductImage";
import { requireUser } from "@/lib/auth";
import { getProduct } from "@/lib/catalog";
import { formatPrice } from "@/lib/config";
import { findOrder, findShop, findUserReview, type OrderItem } from "@/lib/db";

export const metadata: Metadata = { title: "Suivi de commande" };

const fmtDay = (iso: string) => new Date(iso).toLocaleDateString("fr-FR", { weekday: "long", day: "numeric", month: "long" });
const fmtTime = (iso: string) => new Date(iso).toLocaleString("fr-FR", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" });

function Timeline({ steps }: { steps: { label: string; date?: string; done: boolean }[] }) {
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
          {s.date && <span className="text-[11px] text-muted">{fmtTime(s.date)}</span>}
        </li>
      ))}
    </ol>
  );
}

export default async function OrderTrackingPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const user = await requireUser(`/compte/commandes/${id}`);
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
        <Link href="/compte" className="hover:underline">
          Votre compte
        </Link>{" "}
        ›{" "}
        <Link href="/compte#commandes" className="hover:underline">
          Vos commandes
        </Link>{" "}
        › <span className="text-ink">Suivi</span>
      </nav>
      <div className="flex flex-wrap items-end justify-between gap-2">
        <h1 className="text-3xl font-medium">Suivi de la commande</h1>
        <p className="text-sm text-muted">
          N° {order.id.toUpperCase()} · passée le {new Date(order.createdAt).toLocaleDateString("fr-FR", { day: "numeric", month: "long", year: "numeric" })}
        </p>
      </div>

      {!paid && (
        <p className="mt-4 rounded-card border border-line bg-surface p-4 text-sm">
          {order.status === "annulee" ? "Cette commande a été annulée." : "Cette commande attend la confirmation du paiement."}
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
                  {delivered ? `Livré le ${fmtDay(first.deliveredAt ?? first.shippedAt ?? order.createdAt)}` : shipped ? `Arrive ${fmtDay(eta.toISOString())}` : paid ? `Livraison prévue ${fmtDay(eta.toISOString())}` : "En attente"}
                </h2>
                <span className="text-sm text-muted">
                  Colis {n + 1}/{parcels.size}
                  {shop && <> · expédié par {shop.ownerId ? <Link href={`/boutique/${shop.slug}`} className="text-link hover:underline">{shop.name}</Link> : shop.name}</>}
                </span>
              </div>
              {paid && (
                <Timeline
                  steps={[
                    { label: "Commandée", date: order.createdAt, done: true },
                    { label: "Paiement confirmé", date: order.paidAt, done: true },
                    { label: "Expédiée", date: first.shippedAt, done: shipped },
                    { label: "Livrée", date: first.deliveredAt, done: delivered },
                  ]}
                />
              )}
              {first.trackingNumber && (
                <p className="mb-3 rounded-card bg-surface-2 px-3 py-2 text-sm">
                  Numéro de suivi transporteur : <b className="font-mono">{first.trackingNumber}</b>
                </p>
              )}
              <ul className="divide-y divide-line">
                {items.map((i) => {
                  const p = getProduct(i.productId);
                  const reviewed = findUserReview(i.productId, user.id);
                  return (
                    <li key={i.productId} className="flex gap-4 py-3">
                      <div className="w-20 shrink-0 [container-type:inline-size]">
                        {p ? <ProductImage product={p} /> : <div className="grid aspect-square place-items-center rounded-card bg-surface-2 text-3xl">📦</div>}
                      </div>
                      <div className="min-w-0 flex-1 text-sm">
                        {p ? (
                          <Link href={`/produit/${p.id}`} className="line-clamp-2 text-link hover:underline">
                            {i.title}
                          </Link>
                        ) : (
                          <span>{i.title}</span>
                        )}
                        <p className="text-muted">
                          Quantité : {i.quantity} · {formatPrice(i.unitPrice)}
                        </p>
                        <div className="mt-2 flex flex-wrap gap-2">
                          {p && p.stock > 0 && (
                            <form action={addManyToCart}>
                              <input type="hidden" name="productId" value={p.id} />
                              <button className="rounded-full bg-brand px-3 py-1 text-xs font-medium text-brand-ink">Acheter à nouveau</button>
                            </form>
                          )}
                          {p && paid && (
                            <Link href={`/produit/${p.id}/avis`} className="rounded-full border border-line px-3 py-1 text-xs hover:bg-surface-2">
                              {reviewed ? "Modifier mon commentaire" : "Écrire un commentaire"}
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
            <h2 className="mb-2 text-lg font-bold">Adresse de livraison</h2>
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
            <p className="mt-3 text-muted">Paiement : {order.paymentMode === "demo" ? "simulé (mode démo)" : "carte bancaire via Stripe"}</p>
          </section>
          <OrderSummary subtotal={order.subtotal} shipping={order.shipping} total={order.total} count={count} />
        </div>
      </div>
    </div>
  );
}
