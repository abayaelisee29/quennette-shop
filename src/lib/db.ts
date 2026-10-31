import "server-only";
import { promises as fs } from "fs";
import path from "path";

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

export type OrderItem = { productId: string; title: string; unitPrice: number; quantity: number };

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

type Session = { token: string; userId: string; expiresAt: string };

type Data = { users: User[]; sessions: Session[]; orders: Order[] };

const FILE = path.join(process.cwd(), "data", "db.json");
let cache: Data | null = null;
let queue: Promise<unknown> = Promise.resolve();

async function load(): Promise<Data> {
  if (cache) return cache;
  try {
    cache = JSON.parse(await fs.readFile(FILE, "utf8")) as Data;
  } catch {
    cache = { users: [], sessions: [], orders: [] };
  }
  return cache;
}

async function save(data: Data) {
  await fs.mkdir(path.dirname(FILE), { recursive: true });
  const tmp = FILE + ".tmp";
  await fs.writeFile(tmp, JSON.stringify(data, null, 2));
  await fs.rename(tmp, FILE);
}

// Les modifications passent une par une pour éviter d'écraser une écriture concurrente.
function mutate<T>(fn: (d: Data) => T): Promise<T> {
  const run = queue.then(async () => {
    const d = await load();
    const result = fn(d);
    await save(d);
    return result;
  });
  queue = run.catch(() => {});
  return run;
}

// ---------- Utilisateurs ----------

export async function findUserByEmail(email: string) {
  return (await load()).users.find((u) => u.email === email.toLowerCase());
}

export async function findUserById(id: string) {
  return (await load()).users.find((u) => u.id === id);
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
  const s = (await load()).sessions.find((x) => x.token === token);
  return s && s.expiresAt > new Date().toISOString() ? s : undefined;
}

export function deleteSession(token: string) {
  return mutate((d) => {
    d.sessions = d.sessions.filter((x) => x.token !== token);
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
  return (await load()).orders.find((o) => o.id === id);
}

export async function listOrders(userId: string) {
  return (await load()).orders.filter((o) => o.userId === userId).sort((a, b) => b.createdAt.localeCompare(a.createdAt));
}

export function updateOrder(id: string, changes: Partial<Order>) {
  return mutate((d) => {
    const o = d.orders.find((x) => x.id === id);
    if (o) Object.assign(o, changes);
    return o;
  });
}
