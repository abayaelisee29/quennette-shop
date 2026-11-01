import type { Metadata } from "next";
import Link from "next/link";
import { moveWishToCart, toggleWishlistAction } from "@/app/actions/cart";
import { Price } from "@/components/Price";
import { ProductImage } from "@/components/ProductImage";
import { Stars } from "@/components/Stars";
import { requireUser } from "@/lib/auth";
import { getProduct } from "@/lib/catalog";
import { plural } from "@/lib/i18n";
import { getI18n } from "@/lib/i18n/server";

export async function generateMetadata(): Promise<Metadata> {
  return { title: (await getI18n()).t.wishlist.pageTitle };
}

export default async function WishlistPage() {
  const user = await requireUser("/wishlist");
  const { lang, t } = await getI18n();
  const w = t.wishlist;
  const items = user.wishlist.map((id) => getProduct(id, lang)).filter((p) => p !== undefined);

  return (
    <div className="mx-auto max-w-4xl px-4 py-8">
      <h1 className="text-3xl font-medium">{w.title}</h1>
      <p className="text-muted">
        {plural(items.length, w.count)}
      </p>
      {items.length === 0 ? (
        <p className="mt-6 rounded-card border border-line bg-surface p-6 text-muted">
          {w.empty}{" "}
          <Link href="/" className="text-link hover:underline">
            {w.discover}
          </Link>
        </p>
      ) : (
        <ul className="mt-6 divide-y divide-line rounded-card border border-line bg-surface">
          {items.map((p) => (
            <li key={p.id} className="flex gap-4 p-4">
              <Link href={`/product/${p.id}`} className="w-24 shrink-0 [container-type:inline-size] sm:w-32">
                <ProductImage product={p} />
              </Link>
              <div className="min-w-0 flex-1 space-y-1">
                <Link href={`/product/${p.id}`} className="line-clamp-2 text-lg hover:text-link">
                  {p.title}
                </Link>
                <p className="text-xs text-muted">{p.brand}</p>
                <Stars rating={p.rating} count={p.reviewCount} />
                <Price product={p} />
              </div>
              <div className="flex w-40 shrink-0 flex-col gap-2">
                <form action={moveWishToCart}>
                  <input type="hidden" name="productId" value={p.id} />
                  <button disabled={p.stock === 0} className="w-full rounded-full bg-brand py-1.5 text-sm font-medium text-brand-ink disabled:opacity-50">
                    {p.stock === 0 ? w.unavailable : w.addToCart}
                  </button>
                </form>
                <form action={toggleWishlistAction}>
                  <input type="hidden" name="productId" value={p.id} />
                  <input type="hidden" name="back" value="/wishlist" />
                  <button className="w-full rounded-full border border-line py-1.5 text-sm hover:bg-surface-2">{w.remove}</button>
                </form>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
