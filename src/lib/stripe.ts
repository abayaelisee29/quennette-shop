import "server-only";
import Stripe from "stripe";

// Sans clé dans .env.local, la boutique passe en « mode démo » : le paiement est simulé.
export const stripeEnabled = !!process.env.STRIPE_SECRET_KEY;

let client: Stripe | null = null;
export function stripe() {
  if (!process.env.STRIPE_SECRET_KEY) throw new Error("STRIPE_SECRET_KEY manquante");
  client ??= new Stripe(process.env.STRIPE_SECRET_KEY);
  return client;
}

export const isTestKey = process.env.STRIPE_SECRET_KEY?.startsWith("sk_test_") ?? false;
