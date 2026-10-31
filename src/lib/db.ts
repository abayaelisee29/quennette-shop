import "server-only";
import { existsSync, mkdirSync, readFileSync, renameSync, writeFileSync } from "fs";
import path from "path";
import type { Product } from "./products";
import { sampleProducts } from "./sample-data";

// Stockage simple dans un fichier JSON (data/db.json) pour développer sans base de données.
// Toutes les lectures/écritures passent par ce module : pour passer à Supabase/PostgreSQL,
// il suffira de réécrire ces fonctions sans toucher aux pages.

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

type Session = { token: string; userId: string; expiresAt: string };

type Data = { users: User[]; sessions: Session[]; orders: Order[]; shops: Shop[]; products: Product[]; reviews: Review[] };

export const HOUSE_SHOP_ID = "shop_queennette";

const FILE = path.join(process.cwd(), "data", "db.json");
let cache: Data | null = null;
let queue: Promise<unknown> = Promise.resolve();

// Lecture synchrone : le fichier n'est lu qu'une fois, ensuite tout est en mémoire.
function data(): Data {
  if (cache) return cache;
  let d: Partial<Data> = {};
  if (existsSync(FILE)) {
    try {
      d = JSON.parse(readFileSync(FILE, "utf8"));
    } catch {}
  }
  cache = { users: d.users ?? [], sessions: d.sessions ?? [], orders: d.orders ?? [], shops: d.shops ?? [], products: d.products ?? [], reviews: d.reviews ?? [] };
  // Premier lancement (ou base de l'étape 2) : on crée la boutique maison et on importe le catalogue d'exemple.
  if (!cache.shops.some((s) => s.id === HOUSE_SHOP_ID)) {
    cache.shops.push({
      id: HOUSE_SHOP_ID,
      slug: "queennette",
      name: "Queennette",
      description: "La sélection officielle Queennette.",
      ownerId: null,
      createdAt: new Date().toISOString(),
    });
  }
  if (!cache.products.length) cache.products = sampleProducts(HOUSE_SHOP_ID);
  for (const o of cache.orders) {
    for (const i of o.items) {
      i.sellerId ??= cache.products.find((p) => p.id === i.productId)?.sellerId ?? HOUSE_SHOP_ID;
      i.shipStatus ??= "a_preparer";
    }
  }
  save(cache);
  return cache;
}

function save(d: Data) {
  mkdirSync(path.dirname(FILE), { recursive: true });
  const tmp = FILE + ".tmp";
  writeFileSync(tmp, JSON.stringify(d, null, 2));
  renameSync(tmp, FILE);
}

// Les modifications passent une par une pour éviter d'écraser une écriture concurrente.
function mutate<T>(fn: (d: Data) => T): Promise<T> {
  const run = queue.then(() => {
    const d = data();
    const result = fn(d);
    save(d);
    return result;
  });
  queue = run.catch(() => {});
  return run;
}

// ---------- Utilisateurs ----------

export async function findUserByEmail(email: string) {
  return data().users.find((u) => u.email === email.toLowerCase());
}

export async function findUserById(id: string) {
  return data().users.find((u) => u.id === id);
}

export function createUser(u: Pick<User, "id" | "email" | "name" | "passwordHash">) {
  return mutate((d) => {
    const user: User = { ...u, email: u.email.toLowerCase(), createdAt: new Date().toISOString(), wishlist: [] };
    d.users.push(user);
    return user;
  });
}

export function toggleWishlist(userId: string, productId: string) {
  return mutate((d) => {
    const u = d.users.find((x) => x.id === userId);
    if (!u) return false;
    const has = u.wishlist.includes(productId);
    u.wishlist = has ? u.wishlist.filter((x) => x !== productId) : [productId, ...u.wishlist];
    return !has;
  });
}

// ---------- Sessions ----------

export function createSession(s: Session) {
  return mutate((d) => {
    const now = new Date().toISOString();
    d.sessions = d.sessions.filter((x) => x.expiresAt > now);
    d.sessions.push(s);
  });
}

export async function findSession(token: string) {
  const s = data().sessions.find((x) => x.token === token);
  return s && s.expiresAt > new Date().toISOString() ? s : undefined;
}

export function deleteSession(token: string) {
  return mutate((d) => {
    d.sessions = d.sessions.filter((x) => x.token !== token);
  });
}

// ---------- Boutiques ----------

export function findShop(id: string) {
  return data().shops.find((s) => s.id === id);
}

export function findShopBySlug(slug: string) {
  return data().shops.find((s) => s.slug === slug);
}

export function createShop(shop: Shop) {
  return mutate((d) => {
    if (d.shops.some((s) => s.slug === shop.slug)) throw new Error("slug déjà pris");
    d.shops.push(shop);
    const u = d.users.find((x) => x.id === shop.ownerId);
    if (u) u.shopId = shop.id;
    return shop;
  });
}

export function updateShop(id: string, changes: Pick<Shop, "name" | "description">) {
  return mutate((d) => {
    const s = d.shops.find((x) => x.id === id);
    if (s) Object.assign(s, changes);
    return s;
  });
}

// ---------- Produits ----------

export function listActiveProducts() {
  return data().products.filter((p) => p.status === "actif");
}

export function listShopProducts(shopId: string) {
  return data()
    .products.filter((p) => p.sellerId === shopId)
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt));
}

export function findProduct(id: string) {
  return data().products.find((p) => p.id === id);
}

export function saveProduct(p: Product) {
  return mutate((d) => {
    const i = d.products.findIndex((x) => x.id === p.id);
    if (i >= 0) d.products[i] = p;
    else d.products.push(p);
    return p;
  });
}

export function deleteProduct(id: string, shopId: string) {
  return mutate((d) => {
    d.products = d.products.filter((p) => !(p.id === id && p.sellerId === shopId));
  });
}

export function setStock(id: string, shopId: string, stock: number) {
  return mutate((d) => {
    const p = d.products.find((x) => x.id === id && x.sellerId === shopId);
    if (p) p.stock = stock;
  });
}

// ---------- Commandes ----------

export function createOrder(o: Order) {
  return mutate((d) => {
    d.orders.push(o);
    return o;
  });
}

export async function findOrder(id: string) {
  return data().orders.find((o) => o.id === id);
}

export async function listOrders(userId: string) {
  return data()
    .orders.filter((o) => o.userId === userId)
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt));
}

// Commandes payées contenant au moins un article de la boutique.
export function listShopOrders(shopId: string) {
  return data()
    .orders.filter((o) => o.status === "payee" && o.items.some((i) => i.sellerId === shopId))
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt));
}

export function updateOrder(id: string, changes: Partial<Order>) {
  return mutate((d) => {
    const o = d.orders.find((x) => x.id === id);
    if (o) Object.assign(o, changes);
    return o;
  });
}

// Passe la commande en « payée » et retire les quantités du stock. Sans effet si déjà payée.
export function markOrderPaid(id: string) {
  return mutate((d) => {
    const o = d.orders.find((x) => x.id === id);
    if (!o || o.status !== "en_attente") return o;
    o.status = "payee";
    o.paidAt = new Date().toISOString();
    for (const i of o.items) {
      const p = d.products.find((x) => x.id === i.productId);
      if (p) p.stock = Math.max(0, p.stock - i.quantity);
    }
    return o;
  });
}

// Le vendeur met à jour l'expédition de ses articles dans une commande.
export function setShipStatus(orderId: string, shopId: string, status: ShipStatus, trackingNumber?: string) {
  return mutate((d) => {
    const o = d.orders.find((x) => x.id === orderId);
    if (!o) return;
    for (const i of o.items) {
      if (i.sellerId !== shopId) continue;
      i.shipStatus = status;
      if (trackingNumber !== undefined) i.trackingNumber = trackingNumber || undefined;
      if (status !== "a_preparer" && !i.shippedAt) i.shippedAt = new Date().toISOString();
      if (status === "livree" && !i.deliveredAt) i.deliveredAt = new Date().toISOString();
    }
  });
}

// ---------- Avis ----------

export function listReviews(productId: string) {
  return data().reviews.filter((r) => r.productId === productId);
}

export function findReview(id: string) {
  return data().reviews.find((r) => r.id === id);
}

export function findUserReview(productId: string, userId: string) {
  return data().reviews.find((r) => r.productId === productId && r.userId === userId);
}

export function listUserReviews(userId: string) {
  return data().reviews.filter((r) => r.userId === userId);
}

// Vrai si l'utilisateur a une commande payée contenant ce produit.
export function hasPurchased(userId: string, productId: string) {
  return data().orders.some((o) => o.userId === userId && o.status === "payee" && o.items.some((i) => i.productId === productId));
}

// Crée ou remplace l'avis d'un utilisateur et met à jour la note moyenne du produit.
export function upsertReview(r: Omit<Review, "id" | "helpful" | "createdAt"> & { id: string }) {
  return mutate((d) => {
    const p = d.products.find((x) => x.id === r.productId);
    const existing = d.reviews.find((x) => x.productId === r.productId && x.userId === r.userId);
    if (p) {
      const total = p.rating * p.reviewCount - (existing?.rating ?? 0) + r.rating;
      if (!existing) p.reviewCount += 1;
      p.rating = Math.round((total / p.reviewCount) * 10) / 10;
    }
    if (existing) {
      Object.assign(existing, { rating: r.rating, title: r.title, body: r.body, verified: r.verified, userName: r.userName, updatedAt: new Date().toISOString() });
      return existing;
    }
    const review: Review = { ...r, helpful: [], createdAt: new Date().toISOString() };
    d.reviews.push(review);
    return review;
  });
}

export function deleteReview(id: string, userId: string) {
  return mutate((d) => {
    const r = d.reviews.find((x) => x.id === id && x.userId === userId);
    if (!r) return;
    const p = d.products.find((x) => x.id === r.productId);
    if (p) {
      const total = p.rating * p.reviewCount - r.rating;
      p.reviewCount = Math.max(0, p.reviewCount - 1);
      p.rating = p.reviewCount ? Math.round((total / p.reviewCount) * 10) / 10 : 0;
    }
    d.reviews = d.reviews.filter((x) => x !== r);
  });
}

export function toggleHelpful(reviewId: string, userId: string) {
  return mutate((d) => {
    const r = d.reviews.find((x) => x.id === reviewId);
    if (!r || r.userId === userId) return;
    r.helpful = r.helpful.includes(userId) ? r.helpful.filter((x) => x !== userId) : [...r.helpful, userId];
  });
}

// ---------- Données pour les recommandations ----------

// Nombre de commandes payées où chaque produit a été acheté avec `productId`.
export function coPurchaseCounts(productId: string) {
  const counts = new Map<string, number>();
  for (const o of data().orders) {
    if (o.status !== "payee" || !o.items.some((i) => i.productId === productId)) continue;
    for (const i of o.items) if (i.productId !== productId) counts.set(i.productId, (counts.get(i.productId) ?? 0) + 1);
  }
  return counts;
}

export function purchasedProductIds(userId: string) {
  return [...new Set(data().orders.filter((o) => o.userId === userId && o.status === "payee").flatMap((o) => o.items.map((i) => i.productId)))];
}
