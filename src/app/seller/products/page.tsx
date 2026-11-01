import type { Metadata } from "next";
import Link from "next/link";
import { deleteProductAction, updateStockAction } from "@/app/actions/seller";
import { ProductImage } from "@/components/ProductImage";
import { getCategory } from "@/lib/categories";
import { fill } from "@/lib/i18n";
import { getI18n } from "@/lib/i18n/server";
import { listShopProducts } from "@/lib/db";
import { requireSeller } from "@/lib/seller";

export async function generateMetadata(): Promise<Metadata> {
  return { title: (await getI18n()).t.seller.products.pageTitle };
}

const filters = ["all", "actif", "brouillon", "stock"] as const;

export default async function SellerProductsPage({ searchParams }: { searchParams: Promise<{ filter?: string; q?: string; saved?: string }> }) {
  const { shop } = await requireSeller("/seller/products");
  const { lang, t, fmt } = await getI18n();
  const sp = t.seller.products;
  const { filter = "all", q = "", saved: savedId } = await searchParams;
  const all = listShopProducts(shop.id);
  const needle = q.trim().toLowerCase();
  const items = all.filter(
    (p) =>
      (filter === "all" || (filter === "stock" ? p.stock <= 5 : p.status === filter)) &&
      (!needle || p.title.toLowerCase().includes(needle) || p.brand.toLowerCase().includes(needle))
  );
  const saved = savedId ? all.find((p) => p.id === savedId) : undefined;

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-2xl font-bold">{fill(sp.title, { n: all.length })}</h1>
        <Link href="/seller/products/new" className="rounded-full bg-brand px-5 py-2 font-medium text-brand-ink">
          {t.seller.dashboard.addProduct}
        </Link>
      </div>
      {saved && (
        <p className="rounded-card border border-ok/40 bg-surface p-3 text-sm">
          <b className="text-ok">{fill(sp.saved, { title: saved.title })}</b>{" "}
          {saved.status === "actif" ? (
            <Link href={`/product/${saved.id}`} className="text-link hover:underline">
              {sp.viewPage}
            </Link>
          ) : (
            <span className="text-muted">{sp.draftNote}</span>
          )}
        </p>
      )}

      <div className="flex flex-wrap items-center gap-2">
        {filters.map((value) => (
          <Link
            key={value}
            href={`/seller/products?filter=${value}${q ? `&q=${encodeURIComponent(q)}` : ""}`}
            className={`rounded-full border px-3 py-1 text-sm ${filter === value ? "border-ink bg-surface font-bold" : "border-line hover:bg-surface"}`}
          >
            {sp.filters[value]}
          </Link>
        ))}
        <form className="ml-auto">
          <input type="hidden" name="filter" value={filter} />
          <input name="q" defaultValue={q} placeholder={sp.searchPh} className="rounded-full border border-line bg-surface px-3 py-1 text-sm" />
        </form>
      </div>

      {all.length === 0 ? (
        <div className="rounded-card border border-dashed border-line bg-surface p-10 text-center">
          <p className="text-4xl">🛍️</p>
          <p className="mt-2 font-bold">{sp.emptyTitle}</p>
          <Link href="/seller/products/new" className="mt-4 inline-block rounded-full bg-brand px-5 py-2 font-medium text-brand-ink">
            {sp.addFirst}
          </Link>
        </div>
      ) : (
        <div className="overflow-x-auto rounded-card border border-line bg-surface">
          <table className="w-full min-w-[720px] text-sm">
            <thead className="bg-surface-2 text-left text-xs text-muted uppercase">
              <tr>
                <th className="p-3">{sp.th.product}</th>
                <th className="p-3">{sp.th.status}</th>
                <th className="p-3 text-right">{sp.th.price}</th>
                <th className="p-3">{sp.th.stock}</th>
                <th className="p-3 text-right">{sp.th.actions}</th>
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
                        <Link href={`/seller/products/${p.id}`} className="line-clamp-1 font-medium hover:text-link">
                          {p.title}
                        </Link>
                        <p className="text-xs text-muted">
                          {p.brand} · {getCategory(p.category, lang)?.name}
                        </p>
                      </div>
                    </div>
                  </td>
                  <td className="p-3">
                    <span className={`rounded-full px-2 py-0.5 text-xs font-bold ${p.status === "actif" ? "bg-ok/15 text-ok" : "bg-surface-2 text-muted"}`}>
                      {p.status === "actif" ? sp.forSale : sp.draft}
                    </span>
                  </td>
                  <td className="p-3 text-right">
                    {fmt.price(p.price)}
                    {p.listPrice && <s className="block text-xs text-muted">{fmt.price(p.listPrice)}</s>}
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
                        aria-label={fill(sp.stockOf, { title: p.title })}
                        className={`w-20 rounded border px-2 py-1 ${p.stock === 0 ? "border-deal text-deal" : p.stock <= 5 ? "border-brand" : "border-line"} bg-surface`}
                      />
                      <button className="rounded border border-line px-2 py-1 hover:bg-surface-2">{sp.ok}</button>
                    </form>
                  </td>
                  <td className="p-3">
                    <div className="flex items-center justify-end gap-3">
                      <Link href={`/seller/products/${p.id}`} className="text-link hover:underline">
                        {sp.edit}
                      </Link>
                      <form action={deleteProductAction}>
                        <input type="hidden" name="id" value={p.id} />
                        <button className="text-deal hover:underline">{sp.delete}</button>
                      </form>
                    </div>
                  </td>
                </tr>
              ))}
              {items.length === 0 && (
                <tr>
                  <td colSpan={5} className="p-6 text-center text-muted">
                    {sp.noMatch}
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
