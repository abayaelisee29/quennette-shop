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
};

export function discountPercent(p: Pick<Product, "price" | "listPrice">) {
  return p.listPrice && p.listPrice > p.price ? Math.round((1 - p.price / p.listPrice) * 100) : 0;
}
