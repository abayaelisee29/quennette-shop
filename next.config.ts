import type { NextConfig } from "next";
import { legacyCategorySlugs } from "./src/lib/categories";

// Anciennes adresses françaises → nouvelles adresses anglaises (les liens déjà partagés continuent de marcher).
const legacyPaths: [string, string][] = [
  ["/recherche", "/search"],
  ["/panier", "/cart"],
  ["/envies", "/wishlist"],
  ["/connexion", "/signin"],
  ["/inscription", "/signup"],
  ["/commande", "/checkout"],
  ["/compte/commandes/:id", "/account/orders/:id"],
  ["/compte", "/account"],
  ["/produit/:id/avis", "/product/:id/review"],
  ["/produit/:id", "/product/:id"],
  ["/boutique/:slug", "/shop/:slug"],
  ["/vendeur/produits/nouveau", "/seller/products/new"],
  ["/vendeur/produits/:id", "/seller/products/:id"],
  ["/vendeur/produits", "/seller/products"],
  ["/vendeur/commandes", "/seller/orders"],
  ["/vendeur/boutique", "/seller/shop"],
  ["/vendeur", "/seller"],
];

const nextConfig: NextConfig = {
  // Autorise l'envoi de photos produits (3 Mo max, voir src/lib/uploads.ts).
  experimental: { serverActions: { bodySizeLimit: "4mb" } },
  async redirects() {
    return [
      ...legacyPaths.map(([source, destination]) => ({ source, destination, permanent: true })),
      ...Object.entries(legacyCategorySlugs).flatMap(([fr, en]) => [
        { source: `/categorie/${fr}`, destination: `/category/${en}`, permanent: true },
        { source: `/category/${fr}`, destination: `/category/${en}`, permanent: true },
      ]),
    ];
  },
};

export default nextConfig;
