import type { Metadata } from "next";
import Link from "next/link";
import { updateShipmentAction } from "@/app/actions/seller";
import { formatPrice } from "@/lib/config";
import { listShopOrders, type ShipStatus } from "@/lib/db";
import { requireSeller } from "@/lib/seller";

export const metadata: Metadata = { title: "Commandes vendeur" };

const statusInfo: Record<ShipStatus, [string, string]> = {
  a_preparer: ["À préparer", "bg-brand-soft text-ink"],
  expediee: ["Expédiée", "bg-accent/15 text-accent"],
  livree: ["Livrée", "bg-ok/15 text-ok"],
};

export default async function SellerOrdersPage({ searchParams }: { searchParams: Promise<{ statut?: string }> }) {
  const { shop } = await requireSeller("/vendeur/commandes");
  const { statut = "tous" } = await searchParams;
  const orders = listShopOrders(shop.id).map((o) => {
    const items = o.items.filter((i) => i.sellerId === shop.id);
    return { ...o, mine: items, shipStatus: items[0].shipStatus, tracking: items[0].trackingNumber, amount: items.reduce((s, i) => s + i.unitPrice * i.quantity, 0) };
  });
  const shown = statut === "tous" ? orders : orders.filter((o) => o.shipStatus === statut);

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold">Commandes</h1>
      <div className="flex flex-wrap gap-2">
        {[["tous", "Toutes"], ...Object.entries(statusInfo).map(([k, [l]]) => [k, l])].map(([value, label]) => {
          const n = value === "tous" ? orders.length : orders.filter((o) => o.shipStatus === value).length;
          return (
            <Link
              key={value}
              href={`/vendeur/commandes?statut=${value}`}
              className={`rounded-full border px-3 py-1 text-sm ${statut === value ? "border-ink bg-surface font-bold" : "border-line hover:bg-surface"}`}
            >
              {label} ({n})
            </Link>
          );
        })}
      </div>

      {shown.length === 0 ? (
        <p className="rounded-card border border-line bg-surface p-8 text-center text-muted">
          {orders.length === 0 ? "Aucune commande pour le moment. Elles apparaîtront ici dès qu'un client achètera un de vos produits." : "Aucune commande avec ce statut."}
        </p>
      ) : (
        <div className="space-y-4">
          {shown.map((o) => {
            const [label, cls] = statusInfo[o.shipStatus];
            return (
              <article key={o.id} className="rounded-card border border-line bg-surface">
                <header className="flex flex-wrap items-center gap-x-6 gap-y-1 border-b border-line px-4 py-3 text-sm">
                  <b>{o.id.toUpperCase()}</b>
                  <span className="text-muted">{new Date(o.createdAt).toLocaleString("fr-FR", { dateStyle: "medium", timeStyle: "short" })}</span>
                  <span className={`rounded-full px-2 py-0.5 text-xs font-bold ${cls}`}>{label}</span>
                  <span className="ml-auto font-bold">{formatPrice(o.amount)}</span>
                </header>
                <div className="grid gap-4 p-4 md:grid-cols-[1fr_260px]">
                  <div>
                    <ul className="space-y-1 text-sm">
                      {o.mine.map((i) => (
                        <li key={i.productId} className="flex gap-2">
                          <span className="font-bold">{i.quantity} ×</span>
                          <span className="flex-1">{i.title}</span>
                          <span className="text-muted">{formatPrice(i.unitPrice)}</span>
                        </li>
                      ))}
                    </ul>
                    <p className="mt-3 text-sm">
                      <span className="text-muted">Livrer à :</span> {o.address.fullName}, {o.address.line1}
                      {o.address.line2 ? `, ${o.address.line2}` : ""}, {o.address.postalCode} {o.address.city}, {o.address.country} · {o.address.phone}
                    </p>
                  </div>
                  <form action={updateShipmentAction} className="space-y-2 text-sm">
                    <input type="hidden" name="orderId" value={o.id} />
                    {o.shipStatus === "a_preparer" ? (
                      <>
                        <input type="hidden" name="status" value="expediee" />
                        <input name="tracking" placeholder="N° de suivi (optionnel)" className="w-full rounded-card border border-line bg-surface px-3 py-1.5" />
                        <button className="w-full rounded-full bg-brand py-1.5 font-medium text-brand-ink">Marquer comme expédiée</button>
                      </>
                    ) : o.shipStatus === "expediee" ? (
                      <>
                        {o.tracking && <p className="text-muted">Suivi : {o.tracking}</p>}
                        <input type="hidden" name="status" value="livree" />
                        <button className="w-full rounded-full border border-line py-1.5 hover:bg-surface-2">Marquer comme livrée</button>
                      </>
                    ) : (
                      <p className="text-ok">✓ Livrée{o.tracking ? ` · suivi ${o.tracking}` : ""}</p>
                    )}
                  </form>
                </div>
              </article>
            );
          })}
        </div>
      )}
    </div>
  );
}
