import type { Metadata } from "next";
import Link from "next/link";
import { deleteProductAction, updateStockAction } from "@/app/actions/seller";
import { ProductImage } from "@/components/ProductImage";
import { getCategory } from "@/lib/categories";
import { formatPrice } from "@/lib/config";
import { listShopProducts } from "@/lib/db";
import { requireSeller } from "@/lib/seller";

export const metadata: Metadata = { title: "Mes produits" };

const filters = [
  ["tous", "Tous"],
  ["actif", "En vente"],
  ["brouillon", "Brouillons"],
  ["stock", "Stock bas"],
] as const;

export default async function SellerProductsPage({ searchParams }: { searchParams: Promise<{ filtre?: string; q?: string; enregistre?: string }> }) {
  const { shop } = await requireSeller("/vendeur/produits");
  const { filtre = "tous", q = "", enregistre } = await searchParams;
  const all = listShopProducts(shop.id);
  const needle = q.trim().toLowerCase();
  const items = all.filter(
    (p) =>
      (filtre === "tous" || (filtre === "stock" ? p.stock <= 5 : p.status === filtre)) &&
      (!needle || p.title.toLowerCase().includes(needle) || p.brand.toLowerCase().includes(needle))
  );
  const saved = enregistre ? all.find((p) => p.id === enregistre) : undefined;

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-2xl font-bold">Mes produits ({all.length})</h1>
        <Link href="/vendeur/produits/nouveau" className="rounded-full bg-brand px-5 py-2 font-medium text-brand-ink">
          + Ajouter un produit
        </Link>
      </div>
      {saved && (
        <p className="rounded-card border border-ok/40 bg-surface p-3 text-sm">
          <b className="text-ok">✓ « {saved.title} » enregistré.</b>{" "}
          {saved.status === "actif" ? (
            <Link href={`/produit/${saved.id}`} className="text-link hover:underline">
              Voir la fiche produit
            </Link>
          ) : (
            <span className="text-muted">Brouillon : non visible par les clients.</span>
          )}
        </p>
      )}

      <div className="flex flex-wrap items-center gap-2">
        {filters.map(([value, label]) => (
          <Link
            key={value}
            href={`/vendeur/produits?filtre=${value}${q ? `&q=${encodeURIComponent(q)}` : ""}`}
            className={`rounded-full border px-3 py-1 text-sm ${filtre === value ? "border-ink bg-surface font-bold" : "border-line hover:bg-surface"}`}
          >
            {label}
          </Link>
        ))}
        <form className="ml-auto">
          <input type="hidden" name="filtre" value={filtre} />
          <input name="q" defaultValue={q} placeholder="Rechercher dans mes produits" className="rounded-full border border-line bg-surface px-3 py-1 text-sm" />
        </form>
      </div>

      {all.length === 0 ? (
        <div className="rounded-card border border-dashed border-line bg-surface p-10 text-center">
          <p className="text-4xl">🛍️</p>
          <p className="mt-2 font-bold">Vous n&apos;avez pas encore de produit.</p>
          <Link href="/vendeur/produits/nouveau" className="mt-4 inline-block rounded-full bg-brand px-5 py-2 font-medium text-brand-ink">
            Ajouter mon premier produit
          </Link>
        </div>
      ) : (
        <div className="overflow-x-auto rounded-card border border-line bg-surface">
          <table className="w-full min-w-[720px] text-sm">
            <thead className="bg-surface-2 text-left text-xs text-muted uppercase">
              <tr>
                <th className="p-3">Produit</th>
                <th className="p-3">Statut</th>
                <th className="p-3 text-right">Prix</th>
                <th className="p-3">Stock</th>
                <th className="p-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-line">
              {items.map((p) => (
                <tr key={p.id}>
                  <td className="p-3">
                    <div className="flex items-center gap-3">
                      <div className="w-12 shrink-0 [container-type:inline-size]">
                        <ProductImage product={p} />
                      </div>
                      <div className="min-w-0">
                        <Link href={`/vendeur/produits/${p.id}`} className="line-clamp-1 font-medium hover:text-link">
                          {p.title}
                        </Link>
                        <p className="text-xs text-muted">
                          {p.brand} · {getCategory(p.category)?.name}
                        </p>
                      </div>
                    </div>
                  </td>
                  <td className="p-3">
                    <span className={`rounded-full px-2 py-0.5 text-xs font-bold ${p.status === "actif" ? "bg-ok/15 text-ok" : "bg-surface-2 text-muted"}`}>
                      {p.status === "actif" ? "En vente" : "Brouillon"}
                    </span>
                  </td>
                  <td className="p-3 text-right">
                    {formatPrice(p.price)}
                    {p.listPrice && <s className="block text-xs text-muted">{formatPrice(p.listPrice)}</s>}
                  </td>
                  <td className="p-3">
                    <form action={updateStockAction} className="flex items-center gap-1">
                      <input type="hidden" name="id" value={p.id} />
                      <input
                        name="stock"
                        type="number"
                        min={0}
                        defaultValue={p.stock}
                        key={p.stock}
                        aria-label={`Stock de ${p.title}`}
                        className={`w-20 rounded border px-2 py-1 ${p.stock === 0 ? "border-deal text-deal" : p.stock <= 5 ? "border-brand" : "border-line"} bg-surface`}
                      />
                      <button className="rounded border border-line px-2 py-1 hover:bg-surface-2">OK</button>
                    </form>
                  </td>
                  <td className="p-3">
                    <div className="flex items-center justify-end gap-3">
                      <Link href={`/vendeur/produits/${p.id}`} className="text-link hover:underline">
                        Modifier
                      </Link>
                      <form action={deleteProductAction}>
                        <input type="hidden" name="id" value={p.id} />
                        <button className="text-deal hover:underline">Supprimer</button>
                      </form>
                    </div>
                  </td>
                </tr>
              ))}
              {items.length === 0 && (
                <tr>
                  <td colSpan={5} className="p-6 text-center text-muted">
                    Aucun produit ne correspond.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
