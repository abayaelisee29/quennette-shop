import type { Metadata } from "next";
import Link from "next/link";
import { ShopForm } from "@/components/ShopForm";
import { requireUser } from "@/lib/auth";
import { formatPrice } from "@/lib/config";
import { findShop, listShopOrders, listShopProducts } from "@/lib/db";

export const metadata: Metadata = { title: "Espace vendeur" };

const LOW_STOCK = 5;

export default async function SellerHome({ searchParams }: { searchParams: Promise<{ bienvenue?: string }> }) {
  const user = await requireUser("/vendeur");
  const shop = user.shopId ? findShop(user.shopId) : undefined;

  if (!shop) {
    return (
      <div className="grid gap-8 md:grid-cols-2">
        <div>
          <h1 className="font-display text-3xl font-bold">Vendez sur Queennette</h1>
          <p className="mt-3 text-muted">Ouvrez votre boutique en une minute et proposez vos produits à tous nos clients.</p>
          <ul className="mt-6 space-y-3">
            {[
              ["🛍️", "Mettez vos produits en ligne", "Photos, prix, prix barré, stock, livraison express."],
              ["📦", "Suivez vos commandes", "Voyez ce qu'il faut expédier et indiquez le numéro de suivi."],
              ["📈", "Pilotez vos ventes", "Chiffre d'affaires, stock bas et commandes en attente en un coup d'œil."],
            ].map(([icon, title, text]) => (
              <li key={title} className="flex gap-3">
                <span className="text-2xl">{icon}</span>
                <span>
                  <b className="block">{title}</b>
                  <span className="text-sm text-muted">{text}</span>
                </span>
              </li>
            ))}
          </ul>
        </div>
        <div className="rounded-card border border-line bg-surface p-6">
          <h2 className="mb-4 text-xl font-bold">Créer ma boutique</h2>
          <ShopForm mode="create" />
        </div>
      </div>
    );
  }

  const { bienvenue } = await searchParams;
  const products = listShopProducts(shop.id);
  const orders = listShopOrders(shop.id);
  const myItems = orders.flatMap((o) => o.items.filter((i) => i.sellerId === shop.id).map((i) => ({ ...i, order: o })));
  const revenue = myItems.reduce((s, i) => s + i.unitPrice * i.quantity, 0);
  const sold = myItems.reduce((s, i) => s + i.quantity, 0);
  const toShip = orders.filter((o) => o.items.some((i) => i.sellerId === shop.id && i.shipStatus === "a_preparer"));
  const lowStock = products.filter((p) => p.status === "actif" && p.stock <= LOW_STOCK).sort((a, b) => a.stock - b.stock);
  const active = products.filter((p) => p.status === "actif").length;

  return (
    <div className="space-y-6">
      {bienvenue && (
        <div className="rounded-card border border-ok/40 bg-surface p-4">
          <b className="text-ok">🎉 Votre boutique « {shop.name} » est ouverte.</b> Ajoutez votre premier produit pour commencer à vendre.
        </div>
      )}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-2xl font-bold">Tableau de bord</h1>
        <Link href="/vendeur/produits/nouveau" className="rounded-full bg-brand px-5 py-2 font-medium text-brand-ink">
          + Ajouter un produit
        </Link>
      </div>

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        {[
          ["Chiffre d'affaires", formatPrice(revenue), `${sold} article${sold > 1 ? "s" : ""} vendu${sold > 1 ? "s" : ""}`],
          ["Commandes", String(orders.length), "payées"],
          ["À expédier", String(toShip.length), toShip.length ? "à traiter" : "rien en attente"],
          ["Produits en vente", String(active), `${products.length - active} brouillon${products.length - active > 1 ? "s" : ""}`],
        ].map(([label, value, sub]) => (
          <div key={label} className="rounded-card border border-line bg-surface p-4">
            <p className="text-sm text-muted">{label}</p>
            <p className="mt-1 text-2xl font-bold">{value}</p>
            <p className="text-xs text-muted">{sub}</p>
          </div>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <section className="rounded-card border border-line bg-surface p-5">
          <div className="mb-3 flex items-baseline justify-between">
            <h2 className="font-bold">Commandes à expédier</h2>
            <Link href="/vendeur/commandes" className="text-sm text-link hover:underline">
              Tout voir
            </Link>
          </div>
          {toShip.length === 0 ? (
            <p className="text-sm text-muted">Aucune commande en attente d&apos;expédition.</p>
          ) : (
            <ul className="divide-y divide-line text-sm">
              {toShip.slice(0, 5).map((o) => (
                <li key={o.id} className="flex justify-between gap-2 py-2">
                  <span>
                    <b>{o.id.toUpperCase()}</b> · {o.address.fullName}, {o.address.city}
                  </span>
                  <span className="text-muted">{new Date(o.createdAt).toLocaleDateString("fr-FR")}</span>
                </li>
              ))}
            </ul>
          )}
        </section>
        <section className="rounded-card border border-line bg-surface p-5">
          <div className="mb-3 flex items-baseline justify-between">
            <h2 className="font-bold">Stock bas (≤ {LOW_STOCK})</h2>
            <Link href="/vendeur/produits?filtre=stock" className="text-sm text-link hover:underline">
              Gérer le stock
            </Link>
          </div>
          {lowStock.length === 0 ? (
            <p className="text-sm text-muted">Tous vos produits ont du stock.</p>
          ) : (
            <ul className="divide-y divide-line text-sm">
              {lowStock.slice(0, 6).map((p) => (
                <li key={p.id} className="flex justify-between gap-2 py-2">
                  <Link href={`/vendeur/produits/${p.id}`} className="line-clamp-1 hover:text-link">
                    {p.emoji} {p.title}
                  </Link>
                  <span className={p.stock === 0 ? "font-bold text-deal" : "text-ink"}>{p.stock === 0 ? "Épuisé" : `${p.stock} restant${p.stock > 1 ? "s" : ""}`}</span>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>
    </div>
  );
}
