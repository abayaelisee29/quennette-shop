import type { Metadata } from "next";
import Link from "next/link";
import { signOut } from "@/app/actions/auth";
import { requireUser } from "@/lib/auth";
import { getProduct } from "@/lib/catalog";
import { formatPrice } from "@/lib/config";
import { listOrders, type OrderStatus, type ShipStatus } from "@/lib/db";

export const metadata: Metadata = { title: "Votre compte" };

const shipLabel: Record<ShipStatus, string> = { a_preparer: "En préparation", expediee: "Expédié", livree: "Livré" };

const statusLabel: Record<OrderStatus, [string, string]> = {
  en_attente: ["En attente de paiement", "text-muted"],
  payee: ["Payée · en préparation", "text-ok"],
  annulee: ["Annulée", "text-deal"],
};

export default async function AccountPage() {
  const user = await requireUser("/compte");
  const orders = await listOrders(user.id);
  const paid = orders.filter((o) => o.status === "payee");

  return (
    <div className="mx-auto max-w-4xl px-4 py-8">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-medium">Votre compte</h1>
          <p className="text-muted">
            {user.name} · {user.email}
          </p>
        </div>
        <form action={signOut}>
          <button className="rounded-full border border-line bg-surface px-4 py-1.5 text-sm hover:bg-surface-2">Se déconnecter</button>
        </form>
      </div>

      <div className="mt-6 grid gap-4 sm:grid-cols-3">
        {[
          ["📦", "Vos commandes", `${paid.length} commande${paid.length > 1 ? "s" : ""}`, "#commandes"],
          ["♡", "Votre liste d'envies", `${user.wishlist.length} article${user.wishlist.length > 1 ? "s" : ""}`, "/envies"],
          ["🛒", "Votre panier", "Voir le panier", "/panier"],
        ].map(([icon, title, sub, href]) => (
          <Link key={title} href={href} className="flex gap-3 rounded-card border border-line bg-surface p-4 hover:bg-surface-2">
            <span className="text-3xl">{icon}</span>
            <span>
              <span className="block font-bold">{title}</span>
              <span className="text-sm text-muted">{sub}</span>
            </span>
          </Link>
        ))}
      </div>

      <h2 id="commandes" className="mt-10 mb-4 text-2xl font-medium">
        Vos commandes
      </h2>
      {paid.length === 0 ? (
        <p className="rounded-card border border-line bg-surface p-6 text-muted">
          Vous n&apos;avez pas encore passé de commande.{" "}
          <Link href="/" className="text-link hover:underline">
            Commencer vos achats
          </Link>
        </p>
      ) : (
        <div className="space-y-4">
          {paid.map((o) => {
            const [label, color] =
              o.status !== "payee"
                ? statusLabel[o.status]
                : o.items.every((i) => i.shipStatus === "livree")
                  ? ["Livrée", "text-ok"]
                  : o.items.some((i) => i.shipStatus !== "a_preparer")
                    ? ["Expédiée · en cours de livraison", "text-ok"]
                    : statusLabel.payee;
            return (
              <article key={o.id} className="overflow-hidden rounded-card border border-line bg-surface">
                <header className="flex flex-wrap gap-x-8 gap-y-1 bg-surface-2 px-4 py-3 text-xs text-muted">
                  <span>
                    COMMANDE EFFECTUÉE
                    <br />
                    <b className="text-ink">{new Date(o.createdAt).toLocaleDateString("fr-FR", { day: "numeric", month: "long", year: "numeric" })}</b>
                  </span>
                  <span>
                    TOTAL
                    <br />
                    <b className="text-ink">{formatPrice(o.total)}</b>
                  </span>
                  <span>
                    LIVRAISON À
                    <br />
                    <b className="text-ink">{o.address.fullName}</b>
                  </span>
                  <span className="ml-auto text-right">
                    N° {o.id.toUpperCase()}
                    <br />
                    {o.paymentMode === "demo" && <span>Paiement simulé</span>}
                  </span>
                </header>
                <div className="p-4">
                  <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
                    <p className={`font-bold ${color}`}>{label}</p>
                    <Link href={`/compte/commandes/${o.id}`} className="rounded-full bg-brand px-4 py-1.5 text-sm font-medium text-brand-ink">
                      Suivre la commande
                    </Link>
                  </div>
                  <ul className="space-y-2">
                    {o.items.map((i) => (
                      <li key={i.productId} className="flex items-center gap-3 text-sm">
                        <span className="text-2xl">{getProduct(i.productId)?.emoji ?? "📦"}</span>
                        <Link href={`/produit/${i.productId}`} className="flex-1 text-link hover:underline">
                          {i.title}
                        </Link>
                        <span className={`text-xs ${i.shipStatus === "a_preparer" ? "text-muted" : "text-ok"}`}>
                          {shipLabel[i.shipStatus ?? "a_preparer"]}
                          {i.trackingNumber ? ` · suivi ${i.trackingNumber}` : ""}
                        </span>
                        <span className="text-muted">× {i.quantity}</span>
                        <span className="w-20 text-right">{formatPrice(i.unitPrice * i.quantity)}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </article>
            );
          })}
        </div>
      )}
    </div>
  );
}
