"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { clearCart } from "@/app/actions/cart";

// Vide le panier une fois la commande confirmée (après le retour de Stripe).
export function ClearCartOnMount() {
  const router = useRouter();
  useEffect(() => {
    clearCart().then(() => router.refresh());
  }, [router]);
  return null;
}
