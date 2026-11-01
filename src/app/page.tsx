import Link from "next/link";
import { ProductImage } from "@/components/ProductImage";
import { ProductRow } from "@/components/ProductRow";
import { discountPercent, getCategories, getProducts } from "@/lib/catalog";
import { getCurrentUser } from "@/lib/auth";
import { shop } from "@/lib/config";
import { fill } from "@/lib/i18n";
import { getI18n } from "@/lib/i18n/server";
import { forYou, recentlyViewed } from "@/lib/recommendations";

export default async function Home() {
  const { lang, t, fmt } = await getI18n();
  const h = t.home;
  const products = getProducts(lang);
  const user = await getCurrentUser();
  const [recent, recommended] = await Promise.all([recentlyViewed(lang), forYou(lang, user)]);
  const bestSellers = [...products].sort((a, b) => b.reviewCount - a.reviewCount).slice(0, 14);
  const deals = products.filter((p) => p.listPrice).sort((a, b) => discountPercent(b) - discountPercent(a)).slice(0, 14);
  const topRated = [...products].sort((a, b) => b.rating - a.rating).slice(0, 14);
  const newest = [...products].sort((a, b) => b.createdAt.localeCompare(a.createdAt)).slice(0, 14);

  return (
    <div className="relative">
      {/* Bannière */}
      <section className="relative overflow-hidden bg-hero text-nav-ink">
        <div className="mx-auto grid max-w-[1500px] items-center gap-6 px-6 pt-10 pb-36 md:grid-cols-2 md:pt-14 md:pb-44">
          <div>
            <p className="font-semibold tracking-wide text-brand uppercase">{h.eyebrow}</p>
            <h1 className="mt-2 font-display text-4xl leading-tight font-bold md:text-5xl">{t.meta.tagline}</h1>
            <p className="mt-3 max-w-md text-lg opacity-90">
              {fill(h.heroText, { amount: fmt.price(shop.freeShippingFrom) })}
            </p>
            <div className="mt-6 flex flex-wrap gap-3">
              <Link href="/search?deal=1" className="rounded-full bg-brand px-6 py-2.5 font-bold text-brand-ink shadow hover:brightness-105">
                {h.seeDeals}
              </Link>
              <Link href="/search" className="rounded-full border border-nav-ink/40 px-6 py-2.5 font-medium hover:bg-white/10">
                {h.browse}
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
          {getCategories(lang).map((c) => {
            const items = products.filter((p) => p.category === c.slug).slice(0, 4);
            return (
              <section key={c.slug} className="flex flex-col rounded-card bg-surface p-4 shadow-sm">
                <h2 className="mb-3 text-lg font-bold">
                  {c.emoji} {c.name}
                </h2>
                <div className="grid flex-1 grid-cols-2 gap-3">
                  {items.map((p) => (
                    <Link key={p.id} href={`/product/${p.id}`} className="group [container-type:inline-size]">
                      <ProductImage product={p} />
                      <span className="mt-1 line-clamp-1 text-xs text-ink group-hover:text-link">{p.title}</span>
                    </Link>
                  ))}
                </div>
                <Link href={`/category/${c.slug}`} className="mt-3 text-sm text-link hover:underline">
                  {h.discover}
                </Link>
              </section>
            );
          })}
        </div>

        {recommended.length > 0 && <ProductRow title={user ? fill(h.recommendedFor, { name: user.name.split(" ")[0] }) : h.inspired} products={recommended} />}
        {recent.length > 0 && <ProductRow title={h.recentlyViewed} products={recent.slice(0, 14)} />}
        <ProductRow title={h.todaysDeals} products={deals} href="/search?deal=1" />
        <ProductRow title={h.bestSellers} products={bestSellers} href="/search?sort=reviews" />

        <section className="grid gap-4 rounded-card bg-surface p-6 md:grid-cols-3">
          {h.perks.map(([icon, title, text]) => (
            <div key={title} className="flex gap-3">
              <span className="text-3xl">{icon}</span>
              <div>
                <h3 className="font-bold">{title}</h3>
                <p className="text-sm text-muted">{text}</p>
              </div>
            </div>
          ))}
        </section>

        <ProductRow title={h.topRated} products={topRated} href="/search?sort=rating" />
        <ProductRow title={h.newArrivals} products={newest} href="/search?sort=newest" />
      </div>
    </div>
  );
}
