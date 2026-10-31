import { NextResponse } from "next/server";
import { findOrder, markOrderPaid } from "@/lib/db";
import { stripe, stripeEnabled } from "@/lib/stripe";

// Stripe appelle cette adresse quand un paiement est confirmé.
// En local : stripe listen --forward-to localhost:3000/api/stripe/webhook
export async function POST(req: Request) {
  const secret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!stripeEnabled || !secret) return NextResponse.json({ error: "Webhook non configuré" }, { status: 400 });

  const signature = req.headers.get("stripe-signature") ?? "";
  let event;
  try {
    event = stripe().webhooks.constructEvent(await req.text(), signature, secret);
  } catch {
    return NextResponse.json({ error: "Signature invalide" }, { status: 400 });
  }

  if (event.type === "checkout.session.completed" || event.type === "checkout.session.async_payment_succeeded") {
    const session = event.data.object;
    const orderId = session.metadata?.orderId;
    const order = orderId ? await findOrder(orderId) : undefined;
    if (order && order.status === "en_attente" && session.payment_status === "paid") {
      await markOrderPaid(order.id);
    }
  }
  return NextResponse.json({ received: true });
}
