import "server-only";
import { existsSync, mkdirSync, readFileSync, renameSync, writeFileSync } from "fs";
import path from "path";
import { legacyCategorySlugs } from "./categories";
import { HOUSE_SHOP_ID, type Order, type Review, type Session, type Shop, type Store, type User } from "./db";
import type { Product } from "./products";
import { sampleProducts } from "./sample-data";

// Moteur « fichier » : tout est gardé dans data/db.json. Pratique pour essayer le site en local
// sans base de données. En production, c'est Supabase qui prend le relais (voir db-supabase.ts).

type Data = { users: User[]; sessions: Session[]; orders: Order[]; shops: Shop[]; products: Product[]; reviews: Review[] };

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
      description: "The official Queennette selection.",
      ownerId: null,
      createdAt: new Date().toISOString(),
    });
  }
  if (!cache.products.length) cache.products = sampleProducts(HOUSE_SHOP_ID);
  // Passage à l'anglais : catégories renommées, catalogue d'exemple en anglais avec traduction française.
  const samples = new Map(sampleProducts(HOUSE_SHOP_ID).map((p) => [p.id, p]));
  for (const p of cache.products) {
    p.category = legacyCategorySlugs[p.category] ?? p.category;
    const sample = samples.get(p.id);
    if (sample && p.sellerId === HOUSE_SHOP_ID && !p.fr) Object.assign(p, { title: sample.title, description: sample.description, features: sample.features, fr: sample.fr, category: sample.category });
  }
  const house = cache.shops.find((s) => s.id === HOUSE_SHOP_ID);
  if (house?.description === "La sélection officielle Queennette.") house.description = "The official Queennette selection.";
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

// Copie profonde : les pages ne doivent pas pouvoir modifier la base par erreur (comme avec Supabase).
const copy = <T>(x: T): T => (x === undefined ? x : structuredClone(x));
const byNewest = <T extends { createdAt: string }>(a: T, b: T) => b.createdAt.localeCompare(a.createdAt);

export const jsonStore: Store = {
  // ---------- Utilisateurs ----------
  async findUserByEmail(email) {
    return copy(data().users.find((u) => u.email === email.toLowerCase()));
  },
  async findUserById(id) {
    return copy(data().users.find((u) => u.id === id));
  },
  createUser(u) {
    return mutate((d) => {
      const user: User = { ...u, email: u.email.toLowerCase(), createdAt: new Date().toISOString(), wishlist: [] };
      d.users.push(user);
      return copy(user);
    });
  },
  toggleWishlist(userId, productId) {
    return mutate((d) => {
      const u = d.users.find((x) => x.id === userId);
      if (!u) return false;
      const has = u.wishlist.includes(productId);
      u.wishlist = has ? u.wishlist.filter((x) => x !== productId) : [productId, ...u.wishlist];
      return !has;
    });
  },

  // ---------- Sessions ----------
  createSession(s) {
    return mutate((d) => {
      const now = new Date().toISOString();
      d.sessions = d.sessions.filter((x) => x.expiresAt > now);
      d.sessions.push(s);
    });
  },
  async findSession(token) {
    const s = data().sessions.find((x) => x.token === token);
    return s && s.expiresAt > new Date().toISOString() ? copy(s) : undefined;
  },
  deleteSession(token) {
    return mutate((d) => {
      d.sessions = d.sessions.filter((x) => x.token !== token);
    });
  },

  // ---------- Boutiques ----------
  async findShop(id) {
    return copy(data().shops.find((s) => s.id === id));
  },
  async findShopBySlug(slug) {
    return copy(data().shops.find((s) => s.slug === slug));
  },
  createShop(shop) {
    return mutate((d) => {
      if (d.shops.some((s) => s.slug === shop.slug)) throw new Error("slug déjà pris");
      d.shops.push(shop);
      const u = d.users.find((x) => x.id === shop.ownerId);
      if (u) u.shopId = shop.id;
      return copy(shop);
    });
  },
  updateShop(id, changes) {
    return mutate((d) => {
      const s = d.shops.find((x) => x.id === id);
      if (s) Object.assign(s, changes);
      return copy(s);
    });
  },

  // ---------- Produits ----------
  async listActiveProducts() {
    return copy(data().products.filter((p) => p.status === "actif"));
  },
  async listShopProducts(shopId) {
    return copy(data().products.filter((p) => p.sellerId === shopId).sort(byNewest));
  },
  async findProduct(id) {
    return copy(data().products.find((p) => p.id === id));
  },
  saveProduct(p) {
    return mutate((d) => {
      const i = d.products.findIndex((x) => x.id === p.id);
      if (i >= 0) d.products[i] = copy(p);
      else d.products.push(copy(p));
      return p;
    });
  },
  deleteProduct(id, shopId) {
    return mutate((d) => {
      d.products = d.products.filter((p) => !(p.id === id && p.sellerId === shopId));
    });
  },
  setStock(id, shopId, stock) {
    return mutate((d) => {
      const p = d.products.find((x) => x.id === id && x.sellerId === shopId);
      if (p) p.stock = stock;
    });
  },

  // ---------- Commandes ----------
  createOrder(o) {
    return mutate((d) => {
      d.orders.push(copy(o));
      return o;
    });
  },
  async findOrder(id) {
    return copy(data().orders.find((o) => o.id === id));
  },
  async listOrders(userId) {
    return copy(data().orders.filter((o) => o.userId === userId).sort(byNewest));
  },
  // Commandes payées contenant au moins un article de la boutique.
  async listShopOrders(shopId) {
    return copy(data().orders.filter((o) => o.status === "payee" && o.items.some((i) => i.sellerId === shopId)).sort(byNewest));
  },
  updateOrder(id, changes) {
    return mutate((d) => {
      const o = d.orders.find((x) => x.id === id);
      if (o) Object.assign(o, changes);
      return copy(o);
    });
  },
  // Passe la commande en « payée » et retire les quantités du stock. Sans effet si déjà payée.
  markOrderPaid(id) {
    return mutate((d) => {
      const o = d.orders.find((x) => x.id === id);
      if (!o || o.status !== "en_attente") return copy(o);
      o.status = "payee";
      o.paidAt = new Date().toISOString();
      for (const i of o.items) {
        const p = d.products.find((x) => x.id === i.productId);
        if (p) p.stock = Math.max(0, p.stock - i.quantity);
      }
      return copy(o);
    });
  },
  // Le vendeur met à jour l'expédition de ses articles dans une commande.
  setShipStatus(orderId, shopId, status, trackingNumber) {
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
  },

  // ---------- Avis ----------
  async listReviews(productId) {
    return copy(data().reviews.filter((r) => r.productId === productId));
  },
  async findReview(id) {
    return copy(data().reviews.find((r) => r.id === id));
  },
  async findUserReview(productId, userId) {
    return copy(data().reviews.find((r) => r.productId === productId && r.userId === userId));
  },
  async listUserReviews(userId) {
    return copy(data().reviews.filter((r) => r.userId === userId));
  },
  // Vrai si l'utilisateur a une commande payée contenant ce produit.
  async hasPurchased(userId, productId) {
    return data().orders.some((o) => o.userId === userId && o.status === "payee" && o.items.some((i) => i.productId === productId));
  },
  // Crée ou remplace l'avis d'un utilisateur et met à jour la note moyenne du produit.
  upsertReview(r) {
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
        return copy(existing);
      }
      const review: Review = { ...r, helpful: [], createdAt: new Date().toISOString() };
      d.reviews.push(review);
      return copy(review);
    });
  },
  deleteReview(id, userId) {
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
  },
  toggleHelpful(reviewId, userId) {
    return mutate((d) => {
      const r = d.reviews.find((x) => x.id === reviewId);
      if (!r || r.userId === userId) return;
      r.helpful = r.helpful.includes(userId) ? r.helpful.filter((x) => x !== userId) : [...r.helpful, userId];
    });
  },

  // ---------- Données pour les recommandations ----------
  // Nombre de commandes payées où chaque produit a été acheté avec `productId`.
  async coPurchaseCounts(productId) {
    const counts = new Map<string, number>();
    for (const o of data().orders) {
      if (o.status !== "payee" || !o.items.some((i) => i.productId === productId)) continue;
      for (const i of o.items) if (i.productId !== productId) counts.set(i.productId, (counts.get(i.productId) ?? 0) + 1);
    }
    return counts;
  },
  async purchasedProductIds(userId) {
    return [...new Set(data().orders.filter((o) => o.userId === userId && o.status === "payee").flatMap((o) => o.items.map((i) => i.productId)))];
  },
};
