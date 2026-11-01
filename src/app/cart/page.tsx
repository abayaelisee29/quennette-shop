import type { Metadata } from "next";
import Link from "next/link";
import { removeFromCart, toggleWishlistAction, updateCartQuantity } from "@/app/actions/cart";
import { AutoSubmitSelect } from "@/components/AutoSubmitSelect";
import { ProductImage } from "@/components/ProductImage";
import { ProductRow } from "@/components/ProductRow";
import { getCurrentUser } from "@/lib/auth";
import { MAX_QTY, getCart } from "@/lib/cart";
import { getProduct, getProducts } from "@/lib/catalog";
import { shop } from "@/lib/config";
import { fill, plural } from "@/lib/i18n";
import { getI18n } from "@/lib/i18n/server";

export async function generateMetadata(): Promise<Metadata> {
  return { title: (await getI18n()).t.cart.pageTitle };
}

export default async function CartPage({ searchParams }: { searchParams: Promise<{ added?: string }> }) {
  const { added: addedId } = await searchParams;
  const { lang, t, fmt } = await getI18n();
  const c = t.cart;
  const [cart, user] = await Promise.all([getCart(lang), getCurrentUser()]);
  const added = addedId ? getProduct(addedId, lang) : undefined;
  const missing = shop.freeShippingFrom - cart.subtotal;
  const inCart = new Set(cart.lines.map((l) => l.product.id));
  const suggestions = getProducts(lang)
    .filter((p) => !inCart.has(p.id) && (cart.lines.some((l) => l.product.category === p.category) || !cart.lines.length))
    .sort((a, b) => b.reviewCount - a.reviewCount)
    .slice(0, 12);

  return (
    <div className="mx-auto max-w-[1500px] space-y-5 px-3 py-5">
      {added && cart.lines.some((l) => l.product.id === added.id) && (
        <div className="flex items-center gap-3 rounded-card border border-ok/40 bg-surface p-4">
          <span className="grid h-8 w-8 place-items-center rounded-full bg-ok text-white">✓</span>
          <div className="w-12 [container-type:inline-size]">
            <ProductImage product={added} />
          </div>
          <p className="font-bold text-ok">{c.added}</p>
          <Link href={`/product/${added.id}`} className="ml-auto hidden text-sm text-link hover:underline sm:block">
            {c.backToProduct}
          </Link>
        </div>
      )}

      <div className="grid gap-5 lg:grid-cols-[1fr_300px]">
        <section className="rounded-card bg-surface p-5">
          <h1 className="text-3xl font-medium">{c.title}</h1>
          {cart.lines.length === 0 ? (
            <div className="py-8">
              <p className="text-lg">{c.empty}</p>
              <p className="mt-1 text-muted">
                {c.emptyBrowse}{" "}
                <Link href="/search?deal=1" className="text-link hover:underline">
                  {c.emptyDeals}
                </Link>{" "}
                {c.emptyOr}{" "}
                <Link href="/wishlist" className="text-link hover:underline">
                  {c.emptyWishlist}
                </Link>
                .
              </p>
            </div>
          ) : (
            <>
              <p className="mt-1 border-b border-line pb-2 text-right text-sm text-muted">{c.price}</p>
              <ul>
                {cart.lines.map(({ product: p, quantity, lineTotal }) => (
                  <li key={p.id} className="flex gap-4 border-b border-line py-4">
                    <Link href={`/product/${p.id}`} className="w-24 shrink-0 [container-type:inline-size] sm:w-36">
                      <ProductImage product={p} />
                    </Link>
                    <div className="min-w-0 flex-1">
                      <Link href={`/product/${p.id}`} className="line-clamp-2 text-lg hover:text-link">
                        {p.title}
                      </Link>
                      <p className={`text-sm ${p.stock >= quantity ? "text-ok" : "text-deal"}`}>
                        {p.stock === 0 ? c.noLonger : p.stock < quantity ? fill(c.onlyLeft, { n: p.stock }) : c.inStock}
                      </p>
                      {p.fastDelivery && <p className="text-xs text-ok">{c.express}</p>}
                      <div className="mt-2 flex flex-wrap items-center gap-3 text-sm">
                        <form action={updateCartQuantity} className="flex items-center gap-1">
                          <input type="hidden" name="productId" value={p.id} />
                          <label className="flex items-center gap-1 rounded-card border border-line bg-surface-2 px-2 py-1 shadow-sm">
                            {c.qty}
                            <AutoSubmitSelect name="quantity" defaultValue={quantity} key={quantity} className="bg-transparent outline-none">
                              {Array.from({ length: MAX_QTY + 1 }, (_, i) => (
                                <option key={i} value={i}>
                                  {i === 0 ? c.deleteOption : i}
                                </option>
                              ))}
                            </AutoSubmitSelect>
                          </label>
                          <noscript>
                            <button className="text-link">OK</button>
                          </noscript>
                        </form>
                        <span className="text-line">|</span>
                        <form action={removeFromCart}>
                          <input type="hidden" name="productId" value={p.id} />
                          <button className="text-link hover:underline">{c.delete}</button>
                        </form>
                        <span className="text-line">|</span>
                        <form action={toggleWishlistAction}>
                          <input type="hidden" name="productId" value={p.id} />
                          <input type="hidden" name="back" value="/cart" />
                          <button className="text-link hover:underline">{user?.wishlist.includes(p.id) ? c.inWish : c.saveWish}</button>
                        </form>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-lg font-bold">{fmt.price(lineTotal)}</p>
                      {quantity > 1 && <p className="text-xs text-muted">{fill(c.each, { price: fmt.price(p.price) })}</p>}
                    </div>
                  </li>
                ))}
              </ul>
              <p className="pt-3 text-right text-lg">
                {plural(cart.count, c.subtotal)} <b>{fmt.price(cart.subtotal)}</b>
              </p>
            </>
          )}
        </section>

        {cart.lines.length > 0 && (
          <aside className="h-fit rounded-card bg-surface p-5 lg:sticky lg:top-32">
            {missing > 0 ? (
              <div className="mb-3 text-sm">
                <p>
                  {fill(c.missing, { amount: fmt.price(missing) })}
                </p>
                <div className="mt-2 h-2 overflow-hidden rounded-full bg-surface-2">
                  <div className="h-full bg-ok" style={{ width: `${Math.min(100, (cart.subtotal / shop.freeShippingFrom) * 100)}%` }} />
                </div>
              </div>
            ) : (
              <p className="mb-3 text-sm text-ok">{c.eligible}</p>
            )}
            <p className="text-lg">
              {plural(cart.count, c.subtotal)} <b>{fmt.price(cart.subtotal)}</b>
            </p>
            <p className="text-sm text-muted">{fill(c.shipping, { v: cart.shipping ? fmt.price(cart.shipping) : c.free })}</p>
            <Link
              href="/checkout"
              aria-disabled={cart.unavailable.length > 0}
              className={`mt-4 block rounded-full bg-brand py-2 text-center font-medium text-brand-ink hover:brightness-105 ${cart.unavailable.length ? "pointer-events-none opacity-50" : ""}`}
            >
              {c.proceed}
            </Link>
            {cart.unavailable.length > 0 && <p className="mt-2 text-xs text-deal">{c.fixQty}</p>}
          </aside>
        )}
      </div>

      {suggestions.length > 0 && <ProductRow title={cart.lines.length ? c.alsoBought : c.bestSellers} products={suggestions} />}
    </div>
  );
}
