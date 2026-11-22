import "server-only";
import { HOUSE_SHOP_ID, type Order, type OrderItem, type Review, type Session, type Shop, type Store, type User } from "./db";
import type { Product } from "./products";
import { sampleProducts } from "./sample-data";
import { supabase } from "./supabase";

// Moteur Supabase (PostgreSQL). Le schéma est dans supabase/migrations/.
// Les noms de colonnes sont en snake_case dans la base, en camelCase dans le code.

type Row = Record<string, unknown>;
type Result<T> = { data: T; error: { message: string; code?: string } | null };

// Lève une erreur claire si Supabase répond une erreur.
function check<T>({ data, error }: Result<T>, what: string): T {
  if (error) throw new Error(`Supabase (${what}) : ${error.message}`);
  return data;
}

// Variante pour les listes : jamais null.
function list<T>(res: Result<T[] | null>, what: string): T[] {
  return check(res, what) ?? [];
}

const str = (v: unknown) => (v === null || v === undefined ? undefined : String(v));
const num = (v: unknown) => Number(v ?? 0);
const iso = (v: unknown) => (v ? new Date(String(v)).toISOString() : undefined);

// ---------- Conversion lignes <-> objets ----------

const toUser = (r: Row): User => ({
  id: String(r.id),
  email: String(r.email),
  name: String(r.name),
  passwordHash: String(r.password_hash),
  createdAt: iso(r.created_at)!,
  wishlist: (r.wishlist as string[]) ?? [],
  shopId: str(r.shop_id),
});

const toShop = (r: Row): Shop => ({
  id: String(r.id),
  slug: String(r.slug),
  name: String(r.name),
  description: String(r.description ?? ""),
  ownerId: str(r.owner_id) ?? null,
  createdAt: iso(r.created_at)!,
});

const toProduct = (r: Row): Product => ({
  id: String(r.id),
  title: String(r.title),
  brand: String(r.brand ?? ""),
  category: String(r.category),
  price: num(r.price),
  listPrice: r.list_price === null || r.list_price === undefined ? undefined : num(r.list_price),
  rating: num(r.rating),
  reviewCount: num(r.review_count),
  stock: num(r.stock),
  fastDelivery: Boolean(r.fast_delivery),
  emoji: String(r.emoji ?? "📦"),
  hue: num(r.hue),
  description: String(r.description ?? ""),
  features: (r.features as string[]) ?? [],
  createdAt: iso(r.created_at)!,
  sellerId: String(r.seller_id),
  status: r.status === "brouillon" ? "brouillon" : "actif",
  imageUrl: str(r.image_url),
  fr: (r.fr as Product["fr"]) ?? undefined,
});

const fromProduct = (p: Product): Row => ({
  id: p.id,
  seller_id: p.sellerId,
  title: p.title,
  brand: p.brand,
  category: p.category,
  price: p.price,
  list_price: p.listPrice ?? null,
  rating: p.rating,
  review_count: p.reviewCount,
  stock: p.stock,
  fast_delivery: p.fastDelivery,
  emoji: p.emoji,
  hue: p.hue,
  description: p.description,
  features: p.features,
  status: p.status,
  image_url: p.imageUrl ?? null,
  fr: p.fr ?? null,
  created_at: p.createdAt,
});

const toItem = (r: Row): OrderItem => ({
  productId: String(r.product_id),
  title: String(r.title),
  unitPrice: num(r.unit_price),
  quantity: num(r.quantity),
  sellerId: String(r.seller_id),
  shipStatus: (r.ship_status as OrderItem["shipStatus"]) ?? "a_preparer",
  trackingNumber: str(r.tracking_number),
  shippedAt: iso(r.shipped_at),
  deliveredAt: iso(r.delivered_at),
});

const ORDER_SELECT = "*, order_items(*)";
const toOrder = (r: Row): Order => ({
  id: String(r.id),
  userId: String(r.user_id),
  items: ((r.order_items as Row[]) ?? []).sort((a, b) => num(a.position) - num(b.position)).map(toItem),
  subtotal: num(r.subtotal),
  shipping: num(r.shipping),
  total: num(r.total),
  address: r.address as Order["address"],
  status: r.status as Order["status"],
  paymentMode: r.payment_mode as Order["paymentMode"],
  stripeSessionId: str(r.stripe_session_id),
  createdAt: iso(r.created_at)!,
  paidAt: iso(r.paid_at),
});

const toReview = (r: Row): Review => ({
  id: String(r.id),
  productId: String(r.product_id),
  userId: String(r.user_id),
  userName: String(r.user_name),
  rating: num(r.rating),
  title: String(r.title),
  body: String(r.body),
  verified: Boolean(r.verified),
  helpful: (r.helpful as string[]) ?? [],
  createdAt: iso(r.created_at)!,
  updatedAt: iso(r.updated_at),
});

// ---------- Premier lancement : boutique maison + catalogue d'exemple ----------

let seeded: Promise<void> | null = null;
function ready() {
  seeded ??= (async () => {
    const db = supabase();
    const house = check(await db.from("shops").select("id").eq("id", HOUSE_SHOP_ID).maybeSingle(), "boutique maison");
    if (house) return;
    check(
      await db.from("shops").upsert(
        { id: HOUSE_SHOP_ID, slug: "queennette", name: "Queennette", description: "The official Queennette selection.", owner_id: null },
        { onConflict: "id", ignoreDuplicates: true }
      ),
      "création de la boutique maison"
    );
    check(
      await db.from("products").upsert(sampleProducts(HOUSE_SHOP_ID).map(fromProduct), { onConflict: "id", ignoreDuplicates: true }),
      "import du catalogue d'exemple"
    );
  })().catch((e) => {
    seeded = null; // on réessaiera à la prochaine requête
    throw e;
  });
  return seeded;
}

// Toutes les opérations attendent que la base soit prête.
async function db() {
  await ready();
  return supabase();
}

// Commandes payées qui contiennent ce produit (ou de cet utilisateur).
async function paidOrderIdsWithProduct(productId: string) {
  const rows = list(
    await (await db()).from("order_items").select("order_id, orders!inner(status)").eq("product_id", productId).eq("orders.status", "payee"),
    "achats du produit"
  ) as Row[];
  return [...new Set(rows.map((r) => String(r.order_id)))];
}

export const supabaseStore: Store = {
  // ---------- Utilisateurs ----------
  async findUserByEmail(email) {
    const r = check(await (await db()).from("users").select("*").eq("email", email.toLowerCase()).maybeSingle(), "utilisateur");
    return r ? toUser(r) : undefined;
  },
  async findUserById(id) {
    const r = check(await (await db()).from("users").select("*").eq("id", id).maybeSingle(), "utilisateur");
    return r ? toUser(r) : undefined;
  },
  async createUser(u) {
    const r = check(
      await (await db()).from("users").insert({ id: u.id, email: u.email.toLowerCase(), name: u.name, password_hash: u.passwordHash }).select().single(),
      "création du compte"
    );
    return toUser(r);
  },
  async toggleWishlist(userId, productId) {
    return Boolean(check(await (await db()).rpc("toggle_wishlist", { p_user_id: userId, p_product_id: productId }), "liste d'envies"));
  },

  // ---------- Sessions ----------
  async createSession(s: Session) {
    const c = await db();
    check(await c.from("sessions").delete().lt("expires_at", new Date().toISOString()), "nettoyage des sessions");
    check(await c.from("sessions").insert({ token: s.token, user_id: s.userId, expires_at: s.expiresAt }), "session");
  },
  async findSession(token) {
    const r = check(
      await (await db()).from("sessions").select("*").eq("token", token).gt("expires_at", new Date().toISOString()).maybeSingle(),
      "session"
    );
    return r ? { token: r.token, userId: r.user_id, expiresAt: iso(r.expires_at)! } : undefined;
  },
  async deleteSession(token) {
    check(await (await db()).from("sessions").delete().eq("token", token), "déconnexion");
  },

  // ---------- Boutiques ----------
  async findShop(id) {
    const r = check(await (await db()).from("shops").select("*").eq("id", id).maybeSingle(), "boutique");
    return r ? toShop(r) : undefined;
  },
  async findShopBySlug(slug) {
    const r = check(await (await db()).from("shops").select("*").eq("slug", slug).maybeSingle(), "boutique");
    return r ? toShop(r) : undefined;
  },
  async createShop(shop) {
    const res = await (await db()).rpc("create_shop", {
      p_id: shop.id,
      p_slug: shop.slug,
      p_name: shop.name,
      p_description: shop.description,
      p_owner_id: shop.ownerId,
      p_created_at: shop.createdAt,
    });
    if (res.error?.code === "23505") throw new Error("slug déjà pris");
    check(res, "création de la boutique");
    return shop;
  },
  async updateShop(id, changes) {
    const r = check(
      await (await db()).from("shops").update({ name: changes.name, description: changes.description }).eq("id", id).select().maybeSingle(),
      "boutique"
    );
    return r ? toShop(r) : undefined;
  },

  // ---------- Produits ----------
  async listActiveProducts() {
    // Supabase renvoie 1 000 lignes au maximum par requête : on lit par pages.
    const c = await db();
    const all: Product[] = [];
    for (let from = 0; ; from += 1000) {
      const rows = list(await c.from("products").select("*").eq("status", "actif").order("id").range(from, from + 999), "produits");
      all.push(...rows.map(toProduct));
      if (rows.length < 1000) return all;
    }
  },
  async listShopProducts(shopId) {
    const rows = list(await (await db()).from("products").select("*").eq("seller_id", shopId).order("created_at", { ascending: false }), "produits");
    return rows.map(toProduct);
  },
  async findProduct(id) {
    const r = check(await (await db()).from("products").select("*").eq("id", id).maybeSingle(), "produit");
    return r ? toProduct(r) : undefined;
  },
  async saveProduct(p) {
    check(await (await db()).from("products").upsert(fromProduct(p), { onConflict: "id" }), "enregistrement du produit");
    return p;
  },
  async deleteProduct(id, shopId) {
    check(await (await db()).from("products").delete().eq("id", id).eq("seller_id", shopId), "suppression du produit");
  },
  async setStock(id, shopId, stock) {
    check(await (await db()).from("products").update({ stock }).eq("id", id).eq("seller_id", shopId), "stock");
  },

  // ---------- Commandes ----------
  async createOrder(o) {
    check(
      await (await db()).rpc("create_order", {
        p_order: {
          id: o.id,
          user_id: o.userId,
          subtotal: o.subtotal,
          shipping: o.shipping,
          total: o.total,
          address: o.address,
          status: o.status,
          payment_mode: o.paymentMode,
          stripe_session_id: o.stripeSessionId ?? null,
          created_at: o.createdAt,
          paid_at: o.paidAt ?? null,
        },
        p_items: o.items.map((i, position) => ({
          order_id: o.id,
          position,
          product_id: i.productId,
          title: i.title,
          unit_price: i.unitPrice,
          quantity: i.quantity,
          seller_id: i.sellerId,
          ship_status: i.shipStatus,
          tracking_number: i.trackingNumber ?? null,
          shipped_at: i.shippedAt ?? null,
          delivered_at: i.deliveredAt ?? null,
        })),
      }),
      "création de la commande"
    );
    return o;
  },
  async findOrder(id) {
    const r = check(await (await db()).from("orders").select(ORDER_SELECT).eq("id", id).maybeSingle(), "commande");
    return r ? toOrder(r) : undefined;
  },
  async listOrders(userId) {
    const rows = list(await (await db()).from("orders").select(ORDER_SELECT).eq("user_id", userId).order("created_at", { ascending: false }), "commandes");
    return rows.map(toOrder);
  },
  // Commandes payées contenant au moins un article de la boutique (avec tous leurs articles).
  async listShopOrders(shopId) {
    const c = await db();
    const ids = check(await c.from("order_items").select("order_id").eq("seller_id", shopId), "commandes de la boutique") as Row[];
    const unique = [...new Set(ids.map((r) => String(r.order_id)))];
    if (!unique.length) return [];
    const rows = list(
      await c.from("orders").select(ORDER_SELECT).in("id", unique).eq("status", "payee").order("created_at", { ascending: false }),
      "commandes de la boutique"
    );
    return rows.map(toOrder);
  },
  async updateOrder(id, changes) {
    const patch: Row = {};
    if (changes.status !== undefined) patch.status = changes.status;
    if (changes.stripeSessionId !== undefined) patch.stripe_session_id = changes.stripeSessionId;
    check(await (await db()).from("orders").update(patch).eq("id", id), "commande");
    return supabaseStore.findOrder(id);
  },
  // Passe la commande en « payée » et retire le stock, en une seule transaction (fonction SQL).
  async markOrderPaid(id) {
    check(await (await db()).rpc("mark_order_paid", { p_order_id: id }), "paiement de la commande");
    return supabaseStore.findOrder(id);
  },
  async setShipStatus(orderId, shopId, status, trackingNumber) {
    const c = await db();
    const now = new Date().toISOString();
    const base = c.from("order_items");
    const patch: Row = { ship_status: status };
    if (trackingNumber !== undefined) patch.tracking_number = trackingNumber || null;
    check(await base.update(patch).eq("order_id", orderId).eq("seller_id", shopId), "expédition");
    // Les dates d'expédition et de livraison ne sont posées qu'une fois.
    if (status !== "a_preparer")
      check(await c.from("order_items").update({ shipped_at: now }).eq("order_id", orderId).eq("seller_id", shopId).is("shipped_at", null), "expédition");
    if (status === "livree")
      check(await c.from("order_items").update({ delivered_at: now }).eq("order_id", orderId).eq("seller_id", shopId).is("delivered_at", null), "livraison");
  },

  // ---------- Avis ----------
  async listReviews(productId) {
    const rows = list(await (await db()).from("reviews").select("*").eq("product_id", productId), "avis");
    return rows.map(toReview);
  },
  async findReview(id) {
    const r = check(await (await db()).from("reviews").select("*").eq("id", id).maybeSingle(), "avis");
    return r ? toReview(r) : undefined;
  },
  async findUserReview(productId, userId) {
    const r = check(await (await db()).from("reviews").select("*").eq("product_id", productId).eq("user_id", userId).maybeSingle(), "avis");
    return r ? toReview(r) : undefined;
  },
  async listUserReviews(userId) {
    const rows = list(await (await db()).from("reviews").select("*").eq("user_id", userId), "avis");
    return rows.map(toReview);
  },
  async hasPurchased(userId, productId) {
    const rows = list(
      await (await db())
        .from("order_items")
        .select("order_id, orders!inner(user_id, status)")
        .eq("product_id", productId)
        .eq("orders.user_id", userId)
        .eq("orders.status", "payee")
        .limit(1),
      "achat vérifié"
    );
    return rows.length > 0;
  },
  async upsertReview(r) {
    const rows = list(
      await (await db()).rpc("upsert_review", {
        p_id: r.id,
        p_product_id: r.productId,
        p_user_id: r.userId,
        p_user_name: r.userName,
        p_rating: r.rating,
        p_title: r.title,
        p_body: r.body,
        p_verified: r.verified,
      }),
      "enregistrement de l'avis"
    ) as Row[];
    return toReview(rows[0]);
  },
  async deleteReview(id, userId) {
    check(await (await db()).rpc("delete_review", { p_id: id, p_user_id: userId }), "suppression de l'avis");
  },
  async toggleHelpful(reviewId, userId) {
    check(await (await db()).rpc("toggle_helpful", { p_review_id: reviewId, p_user_id: userId }), "avis utile");
  },

  // ---------- Données pour les recommandations ----------
  async coPurchaseCounts(productId) {
    const counts = new Map<string, number>();
    const orderIds = await paidOrderIdsWithProduct(productId);
    if (!orderIds.length) return counts;
    const rows = list(await (await db()).from("order_items").select("order_id, product_id").in("order_id", orderIds).neq("product_id", productId), "achats communs") as Row[];
    // Un produit compte une fois par commande, comme dans la version fichier.
    const seen = new Set<string>();
    for (const r of rows) {
      const key = `${r.order_id}|${r.product_id}`;
      if (seen.has(key)) continue;
      seen.add(key);
      counts.set(String(r.product_id), (counts.get(String(r.product_id)) ?? 0) + 1);
    }
    return counts;
  },
  async purchasedProductIds(userId) {
    const rows = list(
      await (await db()).from("order_items").select("product_id, orders!inner(user_id, status)").eq("orders.user_id", userId).eq("orders.status", "payee"),
      "achats"
    ) as Row[];
    return [...new Set(rows.map((r) => String(r.product_id)))];
  },
};
