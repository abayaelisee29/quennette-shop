import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";
import { payDemo } from "@/app/actions/checkout";
import { SubmitButton } from "@/components/SubmitButton";
import { requireUser } from "@/lib/auth";
import { fill } from "@/lib/i18n";
import { getI18n } from "@/lib/i18n/server";
import { findOrder } from "@/lib/db";
import { stripeEnabled } from "@/lib/stripe";

export async function generateMetadata(): Promise<Metadata> {
  return { title: (await getI18n()).t.demoPay.title };
}

export default async function DemoPaymentPage({ searchParams }: { searchParams: Promise<{ order?: string }> }) {
  const { order: orderId } = await searchParams;
  const user = await requireUser(`/checkout/demo-payment?order=${orderId ?? ""}`);
  const order = orderId ? await findOrder(orderId) : undefined;
  if (stripeEnabled || !order || order.userId !== user.id) notFound();
  if (order.status !== "en_attente") redirect(`/checkout/confirmation?order=${order.id}`);

  const { t, fmt } = await getI18n();
  const d = t.demoPay;
  return (
    <div className="mx-auto max-w-md px-4 py-10">
      <div className="rounded-card border border-line bg-surface p-6">
        <p className="mb-4 rounded-card bg-brand-soft p-2 text-center text-xs font-bold text-ink">{d.banner}</p>
        <h1 className="text-xl font-bold">{fill(d.pay, { amount: fmt.price(order.total) })}</h1>
        <p className="text-sm text-muted">{fill(d.order, { id: order.id.toUpperCase() })}</p>
        <div className="mt-4 space-y-2 opacity-70">
          <div className="rounded-card border border-line bg-surface-2 px-3 py-2 font-mono text-sm">4242 4242 4242 4242</div>
          <div className="flex gap-2">
            <div className="flex-1 rounded-card border border-line bg-surface-2 px-3 py-2 font-mono text-sm">12 / 30</div>
            <div className="flex-1 rounded-card border border-line bg-surface-2 px-3 py-2 font-mono text-sm">123</div>
          </div>
        </div>
        <form action={payDemo} className="mt-5">
          <input type="hidden" name="orderId" value={order.id} />
          <SubmitButton pendingText={d.pending} className="w-full rounded-full bg-brand py-2.5 font-bold text-brand-ink">
            {d.submit}
          </SubmitButton>
        </form>
      </div>
    </div>
  );
}
