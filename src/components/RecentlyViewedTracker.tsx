"use client";

import { useEffect } from "react";

// Mémorise les derniers produits consultés dans un cookie (lu par le serveur pour les recommandations).
export function RecentlyViewedTracker({ productId }: { productId: string }) {
  useEffect(() => {
    try {
      const m = document.cookie.match(/(?:^|; )qs_vus=([^;]*)/);
      const ids = m ? decodeURIComponent(m[1]).split(",").filter(Boolean) : [];
      const next = [productId, ...ids.filter((id) => id !== productId)].slice(0, 20);
      document.cookie = `qs_vus=${encodeURIComponent(next.join(","))}; path=/; max-age=${60 * 60 * 24 * 90}; samesite=lax`;
    } catch {}
  }, [productId]);
  return null;
}
