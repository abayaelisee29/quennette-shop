import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";
import { payDemo } from "@/app/actions/checkout";
import { SubmitButton } from "@/components/SubmitButton";
import { requireUser } from "@/lib/auth";
import { formatPrice } from "@/lib/config";
import { findOrder } from "@/lib/db";
import { stripeEnabled } from "@/lib/stripe";

export const metadata: Metadata = { title: "Paiement (démo)" };

export default async function DemoPaymentPage({ searchParams }: { searchParams: Promise<{ commande?: string }> }) {
  const { commande } = await searchParams;
  const user = await requireUser(`/commande/paiement-demo?commande=${commande ?? ""}`);
  const order = commande ? await findOrder(commande) : undefined;
  if (stripeEnabled || !order || order.userId !== user.id) notFound();
  if (order.status !== "en_attente") redirect(`/commande/confirmation?commande=${order.id}`);

  return (
    <div className="mx-auto max-w-md px-4 py-10">
      <div className="rounded-card border border-line bg-surface p-6">
        <p className="mb-4 rounded-card bg-brand-soft p-2 text-center text-xs font-bold text-ink">PAIEMENT SIMULÉ · aucun débit réel</p>
        <h1 className="text-xl font-bold">Payer {formatPrice(order.total)}</h1>
        <p className="text-sm text-muted">Commande {order.id.toUpperCase()}</p>
        <div className="mt-4 space-y-2 opacity-70">
          <div className="rounded-card border border-line bg-surface-2 px-3 py-2 font-mono text-sm">4242 4242 4242 4242</div>
          <div className="flex gap-2">
            <div className="flex-1 rounded-card border border-line bg-surface-2 px-3 py-2 font-mono text-sm">12 / 30</div>
            <div className="flex-1 rounded-card border border-line bg-surface-2 px-3 py-2 font-mono text-sm">123</div>
          </div>
        </div>
        <form action={payDemo} className="mt-5">
          <input type="hidden" name="orderId" value={order.id} />
          <SubmitButton pendingText="Paiement en cours…" className="w-full rounded-full bg-brand py-2.5 font-bold text-brand-ink">
            Valider le paiement
          </SubmitButton>
        </form>
      </div>
    </div>
  );
}
