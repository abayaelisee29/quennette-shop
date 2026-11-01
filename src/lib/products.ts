// Type produit et petites fonctions utilisables partout (serveur et navigateur).

export type ProductStatus = "actif" | "brouillon";

export type Product = {
  id: string;
  title: string;
  brand: string;
  category: string; // slug de la catégorie
  price: number;
  listPrice?: number; // prix barré si promo
  rating: number; // 0..5
  reviewCount: number;
  stock: number;
  fastDelivery: boolean;
  emoji: string;
  hue: number; // couleur du visuel de remplacement
  description: string;
  features: string[];
  createdAt: string;
  sellerId: string; // boutique qui vend le produit
  status: ProductStatus;
  imageUrl?: string; // photo envoyée par le vendeur (sinon visuel emoji)
  // Traduction française (catalogue d'exemple). Les textes de base sont en anglais,
  // ou dans la langue choisie par le vendeur pour ses propres produits.
  fr?: { title: string; description: string; features: string[] };
};

export function discountPercent(p: Pick<Product, "price" | "listPrice">) {
  return p.listPrice && p.listPrice > p.price ? Math.round((1 - p.price / p.listPrice) * 100) : 0;
}

// Textes du produit dans la langue demandée (repli sur les textes de base).
export function localizeProduct(p: Product, lang: "en" | "fr"): Product {
  return lang === "fr" && p.fr ? { ...p, title: p.fr.title, description: p.fr.description, features: p.fr.features } : p;
}
