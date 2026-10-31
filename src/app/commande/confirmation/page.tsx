import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ClearCartOnMount } from "@/components/ClearCartOnMount";
import { OrderSummary } from "@/components/OrderSummary";
import { requireUser } from "@/lib/auth";
import { findOrder, updateOrder } from "@/lib/db";
import { stripe, stripeEnabled } from "@/lib/stripe";

export const metadata: Metadata = { title: "Commande confirmée" };

export default async function ConfirmationPage({ searchParams }: { searchParams: Promise<{ commande?: string; session_id?: string }> }) {
  const { commande, session_id } = await searchParams;
  const user = await requireUser("/compte");
  let order = commande ? await findOrder(commande) : undefined;
  if (!order || order.userId !== user.id) notFound();

  // Au retour de Stripe, on vérifie le paiement directement auprès de Stripe
  // (le webhook le fait aussi, mais il n'est pas forcément configuré en local).
  if (order.status === "en_attente" && stripeEnabled && session_id && session_id === order.stripeSessionId) {
    const session = await stripe().checkout.sessions.retrieve(session_id);
    if (session.payment_status === "paid") {
      order = (await updateOrder(order.id, { status: "payee", paidAt: new Date().toISOString() })) ?? order;
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
            <p className="text-2xl font-bold text-ok">✓ Merci, votre commande est confirmée.</p>
            <p className="mt-2">
              Un récapitulatif sera envoyé à <b>{user.email}</b>. Livraison estimée le{" "}
              <b>{delivery.toLocaleDateString("fr-FR", { weekday: "long", day: "numeric", month: "long" })}</b>.
            </p>
          </>
        ) : (
          <>
            <p className="text-2xl font-bold">Paiement en cours de vérification…</p>
            <p className="mt-2 text-muted">Rechargez la page dans quelques instants. Si le paiement n&apos;aboutit pas, votre panier est conservé.</p>
          </>
        )}
        <p className="mt-4 text-sm text-muted">
          Commande n° {order.id.toUpperCase()} · livrée à {order.address.fullName}, {order.address.city}
        </p>
        <div className="mt-6 flex flex-wrap gap-3">
          <Link href="/compte#commandes" className="rounded-full bg-brand px-5 py-2 font-medium text-brand-ink">
            Voir mes commandes
          </Link>
          <Link href="/" className="rounded-full border border-line px-5 py-2 hover:bg-surface-2">
            Continuer mes achats
          </Link>
        </div>
      </div>
      <div className="mt-6">
        <OrderSummary subtotal={order.subtotal} shipping={order.shipping} total={order.total} count={count} />
      </div>
    </div>
  );
}
