import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { CheckoutForm } from "@/components/CheckoutForm";
import { OrderSummary } from "@/components/OrderSummary";
import { requireUser } from "@/lib/auth";
import { getCart } from "@/lib/cart";
import { formatPrice } from "@/lib/config";
import { listOrders } from "@/lib/db";
import { isTestKey, stripeEnabled } from "@/lib/stripe";

export const metadata: Metadata = { title: "Passer la commande" };

export default async function CheckoutPage({ searchParams }: { searchParams: Promise<{ annule?: string }> }) {
  const user = await requireUser("/commande");
  const cart = await getCart();
  if (!cart.lines.length) redirect("/panier");
  const { annule } = await searchParams;
  // Pré-remplit avec l'adresse de la dernière commande.
  const last = (await listOrders(user.id))[0];

  return (
    <div className="mx-auto max-w-5xl px-4 py-8">
      <h1 className="mb-6 text-3xl font-medium">Passer la commande</h1>
      {annule && <p className="mb-4 rounded-card border border-line bg-surface p-3 text-sm">Le paiement a été annulé. Votre panier est intact, vous pouvez réessayer.</p>}
      <div className="grid gap-6 lg:grid-cols-[1fr_320px]">
        <CheckoutForm defaults={last?.address ?? { fullName: user.name }} payLabel={`Payer ${formatPrice(cart.total)}`}>
          {stripeEnabled ? (
            <p className="text-sm text-muted">
              Vous allez être redirigé vers la page de paiement sécurisée Stripe.
              {isTestKey && (
                <>
                  {" "}
                  <b className="text-ink">Mode test :</b> utilisez la carte <code className="rounded bg-surface-2 px-1">4242 4242 4242 4242</code>, une date future et
                  n&apos;importe quel code.
                </>
              )}
            </p>
          ) : (
            <p className="rounded-card border border-dashed border-brand bg-brand-soft p-3 text-sm text-ink">
              <b>Mode démo :</b> aucune clé Stripe n&apos;est configurée, le paiement sera simulé. Ajoutez votre clé de test dans <code>.env.local</code> pour
              utiliser Stripe.
            </p>
          )}
        </CheckoutForm>
        <aside className="space-y-4">
          <OrderSummary subtotal={cart.subtotal} shipping={cart.shipping} total={cart.total} count={cart.count} />
          <div className="rounded-card border border-line bg-surface p-5 text-sm">
            <div className="mb-2 flex items-center justify-between">
              <h2 className="font-bold">Articles</h2>
              <Link href="/panier" className="text-link hover:underline">
                Modifier
              </Link>
            </div>
            <ul className="space-y-1">
              {cart.lines.map((l) => (
                <li key={l.product.id} className="flex gap-2">
                  <span>{l.product.emoji}</span>
                  <span className="line-clamp-1 flex-1">{l.product.title}</span>
                  <span className="text-muted">×{l.quantity}</span>
                </li>
              ))}
            </ul>
          </div>
        </aside>
      </div>
    </div>
  );
}
