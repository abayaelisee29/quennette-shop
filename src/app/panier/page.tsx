import type { Metadata } from "next";
import Link from "next/link";
import { removeFromCart, toggleWishlistAction, updateCartQuantity } from "@/app/actions/cart";
import { AutoSubmitSelect } from "@/components/AutoSubmitSelect";
import { ProductImage } from "@/components/ProductImage";
import { ProductRow } from "@/components/ProductRow";
import { getCurrentUser } from "@/lib/auth";
import { MAX_QTY, getCart } from "@/lib/cart";
import { getProduct, getProducts } from "@/lib/catalog";
import { formatPrice, shop } from "@/lib/config";

export const metadata: Metadata = { title: "Panier" };

export default async function CartPage({ searchParams }: { searchParams: Promise<{ ajout?: string }> }) {
  const { ajout } = await searchParams;
  const [cart, user] = await Promise.all([getCart(), getCurrentUser()]);
  const added = ajout ? getProduct(ajout) : undefined;
  const missing = shop.freeShippingFrom - cart.subtotal;
  const inCart = new Set(cart.lines.map((l) => l.product.id));
  const suggestions = getProducts()
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
          <p className="font-bold text-ok">Ajouté au panier</p>
          <Link href={`/produit/${added.id}`} className="ml-auto hidden text-sm text-link hover:underline sm:block">
            Revenir au produit
          </Link>
        </div>
      )}

      <div className="grid gap-5 lg:grid-cols-[1fr_300px]">
        <section className="rounded-card bg-surface p-5">
          <h1 className="text-3xl font-medium">Panier</h1>
          {cart.lines.length === 0 ? (
            <div className="py-8">
              <p className="text-lg">Votre panier est vide.</p>
              <p className="mt-1 text-muted">
                Parcourez les{" "}
                <Link href="/recherche?promo=1" className="text-link hover:underline">
                  offres du jour
                </Link>{" "}
                ou ajoutez des articles depuis votre{" "}
                <Link href="/envies" className="text-link hover:underline">
                  liste d&apos;envies
                </Link>
                .
              </p>
            </div>
          ) : (
            <>
              <p className="mt-1 border-b border-line pb-2 text-right text-sm text-muted">Prix</p>
              <ul>
                {cart.lines.map(({ product: p, quantity, lineTotal }) => (
                  <li key={p.id} className="flex gap-4 border-b border-line py-4">
                    <Link href={`/produit/${p.id}`} className="w-24 shrink-0 [container-type:inline-size] sm:w-36">
                      <ProductImage product={p} />
                    </Link>
                    <div className="min-w-0 flex-1">
                      <Link href={`/produit/${p.id}`} className="line-clamp-2 text-lg hover:text-link">
                        {p.title}
                      </Link>
                      <p className={`text-sm ${p.stock >= quantity ? "text-ok" : "text-deal"}`}>
                        {p.stock === 0 ? "Plus disponible" : p.stock < quantity ? `Seulement ${p.stock} en stock` : "En stock"}
                      </p>
                      {p.fastDelivery && <p className="text-xs text-ok">⚡ Livraison express</p>}
                      <div className="mt-2 flex flex-wrap items-center gap-3 text-sm">
                        <form action={updateCartQuantity} className="flex items-center gap-1">
                          <input type="hidden" name="productId" value={p.id} />
                          <label className="flex items-center gap-1 rounded-card border border-line bg-surface-2 px-2 py-1 shadow-sm">
                            Qté :
                            <AutoSubmitSelect name="quantity" defaultValue={quantity} key={quantity} className="bg-transparent outline-none">
                              {Array.from({ length: MAX_QTY + 1 }, (_, i) => (
                                <option key={i} value={i}>
                                  {i === 0 ? "0 (supprimer)" : i}
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
                          <button className="text-link hover:underline">Supprimer</button>
                        </form>
                        <span className="text-line">|</span>
                        <form action={toggleWishlistAction}>
                          <input type="hidden" name="productId" value={p.id} />
                          <input type="hidden" name="back" value="/panier" />
                          <button className="text-link hover:underline">{user?.wishlist.includes(p.id) ? "♥ Dans vos envies" : "Mettre dans vos envies"}</button>
                        </form>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-lg font-bold">{formatPrice(lineTotal)}</p>
                      {quantity > 1 && <p className="text-xs text-muted">{formatPrice(p.price)} / unité</p>}
                    </div>
                  </li>
                ))}
              </ul>
              <p className="pt-3 text-right text-lg">
                Sous-total ({cart.count} article{cart.count > 1 ? "s" : ""}) : <b>{formatPrice(cart.subtotal)}</b>
              </p>
            </>
          )}
        </section>

        {cart.lines.length > 0 && (
          <aside className="h-fit rounded-card bg-surface p-5 lg:sticky lg:top-32">
            {missing > 0 ? (
              <div className="mb-3 text-sm">
                <p>
                  Plus que <b>{formatPrice(missing)}</b> pour la livraison gratuite.
                </p>
                <div className="mt-2 h-2 overflow-hidden rounded-full bg-surface-2">
                  <div className="h-full bg-ok" style={{ width: `${Math.min(100, (cart.subtotal / shop.freeShippingFrom) * 100)}%` }} />
                </div>
              </div>
            ) : (
              <p className="mb-3 text-sm text-ok">✓ Votre commande est éligible à la livraison GRATUITE.</p>
            )}
            <p className="text-lg">
              Sous-total ({cart.count} article{cart.count > 1 ? "s" : ""}) : <b>{formatPrice(cart.subtotal)}</b>
            </p>
            <p className="text-sm text-muted">Livraison : {cart.shipping ? formatPrice(cart.shipping) : "gratuite"}</p>
            <Link
              href="/commande"
              aria-disabled={cart.unavailable.length > 0}
              className={`mt-4 block rounded-full bg-brand py-2 text-center font-medium text-brand-ink hover:brightness-105 ${cart.unavailable.length ? "pointer-events-none opacity-50" : ""}`}
            >
              Passer la commande
            </Link>
            {cart.unavailable.length > 0 && <p className="mt-2 text-xs text-deal">Ajustez les quantités des articles indisponibles pour continuer.</p>}
          </aside>
        )}
      </div>

      {suggestions.length > 0 && <ProductRow title={cart.lines.length ? "Les clients ont aussi acheté" : "Meilleures ventes"} products={suggestions} />}
    </div>
  );
}
