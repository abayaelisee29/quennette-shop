import type { Metadata } from "next";
import Link from "next/link";
import { moveWishToCart, toggleWishlistAction } from "@/app/actions/cart";
import { Price } from "@/components/Price";
import { ProductImage } from "@/components/ProductImage";
import { Stars } from "@/components/Stars";
import { requireUser } from "@/lib/auth";
import { getProduct } from "@/lib/catalog";

export const metadata: Metadata = { title: "Liste d'envies" };

export default async function WishlistPage() {
  const user = await requireUser("/envies");
  const items = user.wishlist.map(getProduct).filter((p) => p !== undefined);

  return (
    <div className="mx-auto max-w-4xl px-4 py-8">
      <h1 className="text-3xl font-medium">Votre liste d&apos;envies</h1>
      <p className="text-muted">
        {items.length} article{items.length > 1 ? "s" : ""}
      </p>
      {items.length === 0 ? (
        <p className="mt-6 rounded-card border border-line bg-surface p-6 text-muted">
          Votre liste est vide. Cliquez sur « ♡ Ajouter à la liste d&apos;envies » sur une fiche produit pour garder un article de côté.{" "}
          <Link href="/" className="text-link hover:underline">
            Découvrir des produits
          </Link>
        </p>
      ) : (
        <ul className="mt-6 divide-y divide-line rounded-card border border-line bg-surface">
          {items.map((p) => (
            <li key={p.id} className="flex gap-4 p-4">
              <Link href={`/produit/${p.id}`} className="w-24 shrink-0 [container-type:inline-size] sm:w-32">
                <ProductImage product={p} />
              </Link>
              <div className="min-w-0 flex-1 space-y-1">
                <Link href={`/produit/${p.id}`} className="line-clamp-2 text-lg hover:text-link">
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
                    {p.stock === 0 ? "Indisponible" : "Ajouter au panier"}
                  </button>
                </form>
                <form action={toggleWishlistAction}>
                  <input type="hidden" name="productId" value={p.id} />
                  <input type="hidden" name="back" value="/envies" />
                  <button className="w-full rounded-full border border-line py-1.5 text-sm hover:bg-surface-2">Retirer</button>
                </form>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
