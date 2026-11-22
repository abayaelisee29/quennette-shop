import "server-only";
import type { Product } from "./products";
import { supabaseConfigured } from "./supabase";

// Point d'entrée unique pour les données du site. Les pages n'appellent que ces fonctions.
// Deux moteurs au choix, avec exactement les mêmes fonctions :
//  - Supabase (PostgreSQL) dès que SUPABASE_URL et SUPABASE_SECRET_KEY sont définis (production) ;
//  - sinon un simple fichier data/db.json, pour essayer le site sans rien installer.

export type User = {
  id: string;
  email: string;
  name: string;
  passwordHash: string;
  createdAt: string;
  wishlist: string[]; // ids produits
  shopId?: string; // boutique si l'utilisateur est vendeur
};

export type Shop = {
  id: string;
  slug: string;
  name: string;
  description: string;
  ownerId: string | null; // null pour la boutique maison
  createdAt: string;
};

export type Address = {
  fullName: string;
  line1: string;
  line2?: string;
  postalCode: string;
  city: string;
  country: string;
  phone: string;
};

export type ShipStatus = "a_preparer" | "expediee" | "livree";

export type OrderItem = {
  productId: string;
  title: string;
  unitPrice: number;
  quantity: number;
  sellerId: string;
  shipStatus: ShipStatus;
  trackingNumber?: string;
  shippedAt?: string;
  deliveredAt?: string;
};

export type OrderStatus = "en_attente" | "payee" | "annulee";

export type Order = {
  id: string;
  userId: string;
  items: OrderItem[];
  subtotal: number;
  shipping: number;
  total: number;
  address: Address;
  status: OrderStatus;
  paymentMode: "stripe" | "demo";
  stripeSessionId?: string;
  createdAt: string;
  paidAt?: string;
};

export type Review = {
  id: string;
  productId: string;
  userId: string;
  userName: string;
  rating: number; // 1..5
  title: string;
  body: string;
  verified: boolean; // l'auteur a acheté et payé le produit
  helpful: string[]; // ids des utilisateurs qui ont trouvé l'avis utile
  createdAt: string;
  updatedAt?: string;
};

export type Session = { token: string; userId: string; expiresAt: string };

export type ReviewInput = Omit<Review, "helpful" | "createdAt" | "updatedAt">;

export const HOUSE_SHOP_ID = "shop_queennette";

// Ce que chaque moteur de stockage doit savoir faire.
export interface Store {
  findUserByEmail(email: string): Promise<User | undefined>;
  findUserById(id: string): Promise<User | undefined>;
  createUser(u: Pick<User, "id" | "email" | "name" | "passwordHash">): Promise<User>;
  toggleWishlist(userId: string, productId: string): Promise<boolean>;

  createSession(s: Session): Promise<void>;
  findSession(token: string): Promise<Session | undefined>;
  deleteSession(token: string): Promise<void>;

  findShop(id: string): Promise<Shop | undefined>;
  findShopBySlug(slug: string): Promise<Shop | undefined>;
  createShop(shop: Shop): Promise<Shop>;
  updateShop(id: string, changes: Pick<Shop, "name" | "description">): Promise<Shop | undefined>;

  listActiveProducts(): Promise<Product[]>;
  listShopProducts(shopId: string): Promise<Product[]>;
  findProduct(id: string): Promise<Product | undefined>;
  saveProduct(p: Product): Promise<Product>;
  deleteProduct(id: string, shopId: string): Promise<void>;
  setStock(id: string, shopId: string, stock: number): Promise<void>;

  createOrder(o: Order): Promise<Order>;
  findOrder(id: string): Promise<Order | undefined>;
  listOrders(userId: string): Promise<Order[]>;
  listShopOrders(shopId: string): Promise<Order[]>;
  updateOrder(id: string, changes: Partial<Pick<Order, "status" | "stripeSessionId">>): Promise<Order | undefined>;
  markOrderPaid(id: string): Promise<Order | undefined>;
  setShipStatus(orderId: string, shopId: string, status: ShipStatus, trackingNumber?: string): Promise<void>;

  listReviews(productId: string): Promise<Review[]>;
  findReview(id: string): Promise<Review | undefined>;
  findUserReview(productId: string, userId: string): Promise<Review | undefined>;
  listUserReviews(userId: string): Promise<Review[]>;
  hasPurchased(userId: string, productId: string): Promise<boolean>;
  upsertReview(r: ReviewInput): Promise<Review>;
  deleteReview(id: string, userId: string): Promise<void>;
  toggleHelpful(reviewId: string, userId: string): Promise<void>;

  coPurchaseCounts(productId: string): Promise<Map<string, number>>;
  purchasedProductIds(userId: string): Promise<string[]>;
}

let current: Promise<Store> | null = null;
function store(): Promise<Store> {
  current ??= supabaseConfigured()
    ? import("./db-supabase").then((m) => m.supabaseStore)
    : import("./db-json").then((m) => m.jsonStore);
  return current;
}

// Chaque fonction exportée appelle le moteur choisi.
function call<K extends keyof Store>(k: K): Store[K] {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return (async (...args: any[]) => ((await store())[k] as (...a: any[]) => unknown)(...args)) as unknown as Store[K];
}

export const findUserByEmail = call("findUserByEmail");
export const findUserById = call("findUserById");
export const createUser = call("createUser");
export const toggleWishlist = call("toggleWishlist");
export const createSession = call("createSession");
export const findSession = call("findSession");
export const deleteSession = call("deleteSession");
export const findShop = call("findShop");
export const findShopBySlug = call("findShopBySlug");
export const createShop = call("createShop");
export const updateShop = call("updateShop");
export const listActiveProducts = call("listActiveProducts");
export const listShopProducts = call("listShopProducts");
export const findProduct = call("findProduct");
export const saveProduct = call("saveProduct");
export const deleteProduct = call("deleteProduct");
export const setStock = call("setStock");
export const createOrder = call("createOrder");
export const findOrder = call("findOrder");
export const listOrders = call("listOrders");
export const listShopOrders = call("listShopOrders");
export const updateOrder = call("updateOrder");
export const markOrderPaid = call("markOrderPaid");
export const setShipStatus = call("setShipStatus");
export const listReviews = call("listReviews");
export const findReview = call("findReview");
export const findUserReview = call("findUserReview");
export const listUserReviews = call("listUserReviews");
export const hasPurchased = call("hasPurchased");
export const upsertReview = call("upsertReview");
export const deleteReview = call("deleteReview");
export const toggleHelpful = call("toggleHelpful");
export const coPurchaseCounts = call("coPurchaseCounts");
export const purchasedProductIds = call("purchasedProductIds");
