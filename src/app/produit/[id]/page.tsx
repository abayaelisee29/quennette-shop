import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Price } from "@/components/Price";
import { ProductImage } from "@/components/ProductImage";
import { ProductRow } from "@/components/ProductRow";
import { BoughtTogether } from "@/components/BoughtTogether";
import { ProductReviews } from "@/components/ProductReviews";
import { RecentlyViewedTracker } from "@/components/RecentlyViewedTracker";
import { Stars } from "@/components/Stars";
import { SubmitButton } from "@/components/SubmitButton";
import { WishlistButton } from "@/components/WishlistButton";
import { addToCart, buyNow } from "@/app/actions/cart";
import { getCurrentUser } from "@/lib/auth";
import { MAX_QTY } from "@/lib/cart";
import { getCategory, getProduct, getProducts } from "@/lib/catalog";
import { findShop } from "@/lib/db";
import { formatPrice, shop } from "@/lib/config";
import { alsoBought, boughtTogether, recentlyViewed } from "@/lib/recommendations";

type Props = {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ avis_note?: string; avis_tri?: string; avis?: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const p = getProduct((await params).id);
  return p ? { title: p.title, description: p.description } : { title: "Produit introuvable" };
}

function deliveryDate(days: number) {
  const d = new Date();
  d.setDate(d.getDate() + days);
  return d.toLocaleDateString("fr-FR", { weekday: "long", day: "numeric", month: "long" });
}

export default async function ProductPage({ params, searchParams }: Props) {
  const p = getProduct((await params).id);
  if (!p) notFound();
  const user = await getCurrentUser();
  const cat = getCategory(p.category)!;
  const products = getProducts();
  const shopInfo = findShop(p.sellerId);
  const sameBrand = products.filter((x) => x.brand === p.brand && x.id !== p.id);
  const freeShipping = p.price >= shop.freeShippingFrom;
  const sp = await searchParams;
  const note = Number(sp.avis_note) || undefined;
  const also = alsoBought(p);
  const together = boughtTogether(p);
  const recent = (await recentlyViewed(p.id)).slice(0, 14);

  return (
    <div className="bg-surface">
      <RecentlyViewedTracker productId={p.id} />
      <div className="mx-auto max-w-[1500px] px-4 py-4">
        <nav className="mb-4 text-sm text-muted">
          <Link href="/" className="hover:underline">
            Accueil
          </Link>{" "}
          ›{" "}
          <Link href={`/categorie/${cat.slug}`} className="hover:underline">
            {cat.name}
          </Link>{" "}
          › <span className="text-ink">{p.title}</span>
        </nav>

        <div className="grid gap-8 lg:grid-cols-[minmax(0,5fr)_minmax(0,4fr)_300px]">
          {/* Galerie */}
          <div className="flex gap-3">
            <div className="flex w-16 flex-col gap-2">
              {[0, 1, 2, 3].map((v) => (
                <div key={v} className={`rounded-card border-2 [container-type:inline-size] ${v === 0 ? "border-brand" : "border-line"}`}>
                  <ProductImage product={p} variant={v} />
                </div>
              ))}
            </div>
            <div className="flex-1 [container-type:inline-size]">
              <ProductImage product={p} className="border border-line" />
            </div>
          </div>

          {/* Informations */}
          <div>
            <h1 className="text-2xl leading-snug font-medium">{p.title}</h1>
            <Link href={`/recherche?marque=${encodeURIComponent(p.brand)}`} className="text-sm text-link hover:underline">
              Visiter la boutique {p.brand}
            </Link>
            {shopInfo && shopInfo.ownerId && (
              <p className="text-sm">
                Vendu par{" "}
                <Link href={`/boutique/${shopInfo.slug}`} className="text-link hover:underline">
                  {shopInfo.name}
                </Link>
              </p>
            )}
            <div className="mt-2 flex items-center gap-2 text-sm">
              <span className="font-medium">{p.rating.toLocaleString("fr-FR")}</span>
              <Stars rating={p.rating} size="md" />
              <a href="#avis" className="text-link hover:underline">
                {p.reviewCount.toLocaleString("fr-FR")} évaluations
              </a>
            </div>
            {p.reviewCount > 2000 && <span className="mt-2 inline-block rounded bg-accent px-2 py-0.5 text-xs font-bold text-accent-ink">N°1 des ventes</span>}
            <hr className="my-4 border-line" />
            <Price product={p} size="lg" />
            <p className="mt-1 text-sm text-muted">Toutes taxes comprises</p>
            <hr className="my-4 border-line" />
            <h2 className="mb-2 font-bold">À propos de cet article</h2>
            <ul className="list-disc space-y-1 pl-5 text-sm">
              {p.features.map((f) => (
                <li key={f}>{f}</li>
              ))}
            </ul>
            <p className="mt-4 text-sm leading-relaxed">{p.description}</p>
            <dl className="mt-4 grid grid-cols-[auto_1fr] gap-x-6 gap-y-1 text-sm">
              <dt className="font-bold">Marque</dt>
              <dd>{p.brand}</dd>
              <dt className="font-bold">Catégorie</dt>
              <dd>{cat.name}</dd>
              <dt className="font-bold">Référence</dt>
              <dd>{p.id.toUpperCase()}</dd>
            </dl>
          </div>

          {/* Encadré d'achat */}
          <aside className="h-fit rounded-card border border-line p-4 lg:sticky lg:top-32">
            <Price product={p} />
            <p className="mt-3 text-sm">
              {freeShipping ? (
                <span className="text-link">Livraison GRATUITE</span>
              ) : (
                <span>Livraison {formatPrice(4.99)}</span>
              )}{" "}
              <b>{deliveryDate(p.fastDelivery ? 1 : 4)}</b>
            </p>
            {p.fastDelivery && <p className="mt-1 text-sm text-ok">⚡ Livraison express disponible</p>}
            <p className="mt-1 text-sm">📍 Livrer à votre adresse</p>
            <p className={`mt-3 text-lg font-medium ${p.stock === 0 ? "text-deal" : "text-ok"}`}>
              {p.stock === 0 ? "Actuellement indisponible" : p.stock < 10 ? `Plus que ${p.stock} en stock` : "En stock"}
            </p>
            {p.stock > 0 && (
              <form action={addToCart}>
                <input type="hidden" name="productId" value={p.id} />
                <label className="mt-3 flex items-center gap-2 text-sm">
                  Quantité :
                  <select name="quantity" className="rounded-card border border-line bg-surface-2 px-2 py-1">
                    {Array.from({ length: Math.min(MAX_QTY, p.stock) }, (_, i) => (
                      <option key={i}>{i + 1}</option>
                    ))}
                  </select>
                </label>
                <SubmitButton pendingText="Ajout…" className="mt-4 w-full rounded-full bg-brand py-2 font-medium text-brand-ink hover:brightness-105">
                  Ajouter au panier
                </SubmitButton>
                <button formAction={buyNow} className="mt-2 w-full rounded-full bg-accent py-2 font-medium text-accent-ink hover:brightness-110">
                  Acheter maintenant
                </button>
              </form>
            )}
            <dl className="mt-4 grid grid-cols-[auto_1fr] gap-x-3 gap-y-1 text-xs text-muted">
              <dt>Expédié par</dt>
              <dd>{shop.name}</dd>
              <dt>Vendu par</dt>
              <dd>{shopInfo ? <Link href={`/boutique/${shopInfo.slug}`} className="text-link hover:underline">{shopInfo.name}</Link> : p.brand}</dd>
              <dt>Retours</dt>
              <dd>Gratuits sous 30 jours</dd>
              <dt>Paiement</dt>
              <dd>Transaction sécurisée</dd>
            </dl>
            <hr className="my-4 border-line" />
            <WishlistButton productId={p.id} active={!!user?.wishlist.includes(p.id)} back={`/produit/${p.id}`} />
          </aside>
        </div>

        <hr className="my-8 border-line" />
        <div className="space-y-4">
          <BoughtTogether product={p} others={together} />
          <ProductRow title="Les clients ayant acheté cet article ont également acheté" products={also} href={`/categorie/${cat.slug}`} />
          {sameBrand.length > 0 && <ProductRow title={`Autres produits ${p.brand}`} products={sameBrand} />}
        </div>

        <hr className="my-8 border-line" />
        <ProductReviews product={p} user={user} filter={note} sort={sp.avis_tri} thanks={sp.avis === "merci"} />

        {recent.length > 0 && (
          <>
            <hr className="my-8 border-line" />
            <ProductRow title="Vos articles consultés récemment" products={recent} />
          </>
        )}
      </div>
    </div>
  );
}
