import Link from "next/link";
import { ProductImage } from "@/components/ProductImage";
import { ProductRow } from "@/components/ProductRow";
import { categories, discountPercent, getProducts } from "@/lib/catalog";
import { shop } from "@/lib/config";

export default function Home() {
  const products = getProducts();
  const bestSellers = [...products].sort((a, b) => b.reviewCount - a.reviewCount).slice(0, 14);
  const deals = products.filter((p) => p.listPrice).sort((a, b) => discountPercent(b) - discountPercent(a)).slice(0, 14);
  const topRated = [...products].sort((a, b) => b.rating - a.rating).slice(0, 14);
  const newest = [...products].sort((a, b) => b.createdAt.localeCompare(a.createdAt)).slice(0, 14);

  return (
    <div className="relative">
      {/* Bannière */}
      <section className="relative overflow-hidden bg-gradient-to-br from-nav via-accent to-header text-nav-ink">
        <div className="mx-auto grid max-w-[1500px] items-center gap-6 px-6 pt-10 pb-36 md:grid-cols-2 md:pt-14 md:pb-44">
          <div>
            <p className="font-semibold tracking-wide text-brand uppercase">Nouvelle boutique</p>
            <h1 className="mt-2 font-display text-4xl leading-tight font-bold md:text-5xl">{shop.tagline}</h1>
            <p className="mt-3 max-w-md text-lg opacity-90">
              Des milliers de produits, des prix doux et la livraison offerte dès {shop.freeShippingFrom} €.
            </p>
            <div className="mt-6 flex flex-wrap gap-3">
              <Link href="/recherche?promo=1" className="rounded-full bg-brand px-6 py-2.5 font-bold text-brand-ink shadow hover:brightness-105">
                Voir les offres du jour
              </Link>
              <Link href="/recherche" className="rounded-full border border-nav-ink/40 px-6 py-2.5 font-medium hover:bg-white/10">
                Parcourir le catalogue
              </Link>
            </div>
          </div>
          <div className="hidden justify-center gap-4 md:flex">
            {deals.slice(0, 3).map((p, i) => (
              <div key={p.id} className="w-40 [container-type:inline-size]" style={{ transform: `translateY(${i === 1 ? -20 : 10}px) rotate(${(i - 1) * 4}deg)` }}>
                <ProductImage product={p} className="shadow-2xl" />
              </div>
            ))}
          </div>
        </div>
      </section>

      <div className="relative z-10 mx-auto -mt-28 max-w-[1500px] space-y-5 px-3 md:-mt-36">
        {/* Grille de cartes catégories (4 vignettes chacune) */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {categories.map((c) => {
            const items = products.filter((p) => p.category === c.slug).slice(0, 4);
            return (
              <section key={c.slug} className="flex flex-col rounded-card bg-surface p-4 shadow-sm">
                <h2 className="mb-3 text-lg font-bold">
                  {c.emoji} {c.name}
                </h2>
                <div className="grid flex-1 grid-cols-2 gap-3">
                  {items.map((p) => (
                    <Link key={p.id} href={`/produit/${p.id}`} className="group [container-type:inline-size]">
                      <ProductImage product={p} />
                      <span className="mt-1 line-clamp-1 text-xs text-ink group-hover:text-link">{p.title}</span>
                    </Link>
                  ))}
                </div>
                <Link href={`/categorie/${c.slug}`} className="mt-3 text-sm text-link hover:underline">
                  Découvrir
                </Link>
              </section>
            );
          })}
        </div>

        <ProductRow title="Offres du jour" products={deals} href="/recherche?promo=1" />
        <ProductRow title="Meilleures ventes" products={bestSellers} href="/recherche?tri=avis" />

        <section className="grid gap-4 rounded-card bg-surface p-6 md:grid-cols-3">
          {[
            ["🚚", "Livraison express", "Recevez vos articles dès demain sur des milliers de produits."],
            ["↩️", "Retours gratuits", "30 jours pour changer d'avis, sans frais."],
            ["🔒", "Paiement sécurisé", "Vos données sont protégées à chaque commande."],
          ].map(([icon, title, text]) => (
            <div key={title} className="flex gap-3">
              <span className="text-3xl">{icon}</span>
              <div>
                <h3 className="font-bold">{title}</h3>
                <p className="text-sm text-muted">{text}</p>
              </div>
            </div>
          ))}
        </section>

        <ProductRow title="Les mieux notés" products={topRated} href="/recherche?tri=note" />
        <ProductRow title="Nouveautés" products={newest} href="/recherche?tri=nouveautes" />
      </div>
    </div>
  );
}
