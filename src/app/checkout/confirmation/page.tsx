import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ClearCartOnMount } from "@/components/ClearCartOnMount";
import { OrderSummary } from "@/components/OrderSummary";
import { requireUser } from "@/lib/auth";
import { findOrder, markOrderPaid } from "@/lib/db";
import { fill } from "@/lib/i18n";
import { getI18n } from "@/lib/i18n/server";
import { stripe, stripeEnabled } from "@/lib/stripe";

export async function generateMetadata(): Promise<Metadata> {
  return { title: (await getI18n()).t.confirm.title };
}

export default async function ConfirmationPage({ searchParams }: { searchParams: Promise<{ order?: string; session_id?: string }> }) {
  const { order: orderId, session_id } = await searchParams;
  const { t, fmt } = await getI18n();
  const c = t.confirm;
  const user = await requireUser("/account");
  let order = orderId ? await findOrder(orderId) : undefined;
  if (!order || order.userId !== user.id) notFound();

  // Au retour de Stripe, on vérifie le paiement directement auprès de Stripe
  // (le webhook le fait aussi, mais il n'est pas forcément configuré en local).
  if (order.status === "en_attente" && stripeEnabled && session_id && session_id === order.stripeSessionId) {
    const session = await stripe().checkout.sessions.retrieve(session_id);
    if (session.payment_status === "paid") {
      order = (await markOrderPaid(order.id)) ?? order;
    }
  }
  const paid = order.status === "payee";
  const delivery = new Date(order.createdAt);
  delivery.setDate(delivery.getDate() + 3);
  const count = order.items.reduce((s, i) => s + i.quantity, 0);

  return (
    <div className="mx-auto max-w-3xl px-4 py-10">
      {paid && <ClearCartOnMount />}
      <div className="rounded-card border border-line bg-surface p-6">
        {paid ? (
          <>
            <p className="text-2xl font-bold text-ok">{c.thanks}</p>
            <p className="mt-2">{fill(c.emailNote, { email: user.email, date: fmt.date(delivery, { weekday: "long", day: "numeric", month: "long" }) })}</p>
          </>
        ) : (
          <>
            <p className="text-2xl font-bold">{c.pending}</p>
            <p className="mt-2 text-muted">{c.pendingText}</p>
          </>
        )}
        <p className="mt-4 text-sm text-muted">
          {fill(c.orderLine, { id: order.id.toUpperCase(), name: order.address.fullName, city: order.address.city })}
        </p>
        <div className="mt-6 flex flex-wrap gap-3">
          <Link href={`/account/orders/${order.id}`} className="rounded-full bg-brand px-5 py-2 font-medium text-brand-ink">
            {c.track}
          </Link>
          <Link href="/" className="rounded-full border border-line px-5 py-2 hover:bg-surface-2">
            {c.continue}
          </Link>
        </div>
      </div>
      <div className="mt-6">
        <OrderSummary subtotal={order.subtotal} shipping={order.shipping} total={order.total} count={count} />
      </div>
    </div>
  );
}
