"use server";

import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { getCurrentUser, newId } from "@/lib/auth";
import { getCart, writeRawCart } from "@/lib/cart";
import { shop } from "@/lib/config";
import { createOrder, findOrder, markOrderPaid, updateOrder, type Address } from "@/lib/db";
import { getI18n } from "@/lib/i18n/server";
import { stripe, stripeEnabled } from "@/lib/stripe";

export type CheckoutState = { error?: string; values?: Partial<Address> };

async function siteUrl() {
  const h = await headers();
  const host = h.get("x-forwarded-host") ?? h.get("host") ?? "localhost:3000";
  const proto = h.get("x-forwarded-proto") ?? (host.startsWith("localhost") ? "http" : "https");
  return `${proto}://${host}`;
}

export async function placeOrder(_: CheckoutState, form: FormData): Promise<CheckoutState> {
  const user = await getCurrentUser();
  if (!user) redirect("/signin?next=/checkout");

  const { lang, t } = await getI18n();
  const e = t.checkout.errors;
  const field = (k: string) => String(form.get(k) ?? "").trim();
  const address: Address = {
    fullName: field("fullName"),
    line1: field("line1"),
    line2: field("line2") || undefined,
    postalCode: field("postalCode"),
    city: field("city"),
    country: field("country"),
    phone: field("phone"),
  };
  const missing = (["fullName", "line1", "postalCode", "city", "country", "phone"] as const).filter((k) => !address[k]);
  if (missing.length) return { error: e.address, values: address };

  // Le total est recalculé côté serveur à partir du catalogue, jamais repris du navigateur.
  const cart = await getCart(lang);
  if (!cart.lines.length) redirect("/cart");
  if (cart.unavailable.length) return { error: e.unavailable, values: address };

  const order = await createOrder({
    id: newId("cmd"),
    userId: user.id,
    items: cart.lines.map((l) => ({
      productId: l.product.id,
      title: l.product.title,
      unitPrice: l.product.price,
      quantity: l.quantity,
      sellerId: l.product.sellerId,
      shipStatus: "a_preparer" as const,
    })),
    subtotal: cart.subtotal,
    shipping: cart.shipping,
    total: cart.total,
    address,
    status: "en_attente",
    paymentMode: stripeEnabled ? "stripe" : "demo",
    createdAt: new Date().toISOString(),
  });

  if (!stripeEnabled) redirect(`/checkout/demo-payment?order=${order.id}`);

  const base = await siteUrl();
  const currency = shop.currency.toLowerCase();
  let session;
  try {
    session = await stripe().checkout.sessions.create({
    mode: "payment",
    customer_email: user.email,
    client_reference_id: order.id,
    metadata: { orderId: order.id },
    line_items: [
      ...order.items.map((i) => ({
        quantity: i.quantity,
        price_data: { currency, unit_amount: Math.round(i.unitPrice * 100), product_data: { name: i.title } },
      })),
      ...(order.shipping
        ? [{ quantity: 1, price_data: { currency, unit_amount: Math.round(order.shipping * 100), product_data: { name: t.checkout.shippingLine } } }]
        : []),
    ],
    success_url: `${base}/checkout/confirmation?order=${order.id}&session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${base}/checkout?canceled=1`,
    });
  } catch (error) {
    console.error("Stripe:", error);
    await updateOrder(order.id, { status: "annulee" });
    return { error: e.stripe, values: address };
  }
  await updateOrder(order.id, { stripeSessionId: session.id });
  redirect(session.url!);
}

// Mode démo uniquement : simule un paiement accepté.
export async function payDemo(form: FormData) {
  const user = await getCurrentUser();
  const order = await findOrder(String(form.get("orderId")));
  if (stripeEnabled || !user || !order || order.userId !== user.id) redirect("/account");
  await markOrderPaid(order.id);
  await writeRawCart({});
  redirect(`/checkout/confirmation?order=${order.id}`);
}
