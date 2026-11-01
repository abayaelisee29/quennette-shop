import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { CheckoutForm } from "@/components/CheckoutForm";
import { OrderSummary } from "@/components/OrderSummary";
import { requireUser } from "@/lib/auth";
import { getCart } from "@/lib/cart";
import { fill } from "@/lib/i18n";
import { getI18n } from "@/lib/i18n/server";
import { listOrders } from "@/lib/db";
import { isTestKey, stripeEnabled } from "@/lib/stripe";

export async function generateMetadata(): Promise<Metadata> {
  return { title: (await getI18n()).t.checkout.title };
}

export default async function CheckoutPage({ searchParams }: { searchParams: Promise<{ canceled?: string }> }) {
  const user = await requireUser("/checkout");
  const { lang, t, fmt } = await getI18n();
  const c = t.checkout;
  const cart = await getCart(lang);
  if (!cart.lines.length) redirect("/cart");
  const { canceled } = await searchParams;
  // Pré-remplit avec l'adresse de la dernière commande.
  const last = (await listOrders(user.id))[0];

  return (
    <div className="mx-auto max-w-5xl px-4 py-8">
      <h1 className="mb-6 text-3xl font-medium">{c.title}</h1>
      {canceled && <p className="mb-4 rounded-card border border-line bg-surface p-3 text-sm">{c.canceled}</p>}
      <div className="grid gap-6 lg:grid-cols-[1fr_320px]">
        <CheckoutForm defaults={last?.address ?? { fullName: user.name }} payLabel={fill(c.pay, { amount: fmt.price(cart.total) })}>
          {stripeEnabled ? (
            <p className="text-sm text-muted">
              {c.stripeNote}
              {isTestKey && (
                <>
                  {" "}
                  <b className="text-ink">{c.testMode}</b> {fill(c.testCard, { card: "4242 4242 4242 4242" })}
                </>
              )}
            </p>
          ) : (
            <p className="rounded-card border border-dashed border-brand bg-brand-soft p-3 text-sm text-ink">
              <b>{c.demoMode}</b> {c.demoNote}
            </p>
          )}
        </CheckoutForm>
        <aside className="space-y-4">
          <OrderSummary subtotal={cart.subtotal} shipping={cart.shipping} total={cart.total} count={cart.count} />
          <div className="rounded-card border border-line bg-surface p-5 text-sm">
            <div className="mb-2 flex items-center justify-between">
              <h2 className="font-bold">{c.items}</h2>
              <Link href="/cart" className="text-link hover:underline">
                {c.edit}
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
