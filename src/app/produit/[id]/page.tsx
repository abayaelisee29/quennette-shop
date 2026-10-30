import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Price } from "@/components/Price";
import { ProductImage } from "@/components/ProductImage";
import { ProductRow } from "@/components/ProductRow";
import { Stars } from "@/components/Stars";
import { getCategory, getProduct, products } from "@/lib/catalog";
import { formatPrice, shop } from "@/lib/config";

// Regénère la page toutes les heures pour garder la date de livraison à jour.
export const revalidate = 3600;

type Props = { params: Promise<{ id: string }> };

export function generateStaticParams() {
  return products.map((p) => ({ id: p.id }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const p = getProduct((await params).id);
  return p ? { title: p.title, description: p.description } : { title: "Produit introuvable" };
}

function deliveryDate(days: number) {
  const d = new Date();
  d.setDate(d.getDate() + days);
  return d.toLocaleDateString("fr-FR", { weekday: "long", day: "numeric", month: "long" });
}

export default async function ProductPage({ params }: Props) {
  const p = getProduct((await params).id);
  if (!p) notFound();
  const cat = getCategory(p.category)!;
  const similar = products.filter((x) => x.category === p.category && x.id !== p.id);
  const sameBrand = products.filter((x) => x.brand === p.brand && x.id !== p.id);
  const freeShipping = p.price >= shop.freeShippingFrom;
  // Répartition des notes simulée à partir de la note moyenne (les vrais avis arrivent à l'étape 4).
  const dist = [5, 4, 3, 2, 1].map((s) => Math.max(1, Math.round(100 * Math.exp(-Math.abs(s - p.rating) * 1.3))));
  const distTotal = dist.reduce((a, b) => a + b, 0);

  return (
    <div className="bg-surface">
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
            <label className="mt-3 flex items-center gap-2 text-sm">
              Quantité :
              <select disabled={p.stock === 0} className="rounded-card border border-line bg-surface-2 px-2 py-1">
                {Array.from({ length: Math.min(10, Math.max(1, p.stock)) }, (_, i) => (
                  <option key={i}>{i + 1}</option>
                ))}
              </select>
            </label>
            <button
              disabled
              title="Le panier arrive à l'étape 2"
              className="mt-4 w-full rounded-full bg-brand py-2 font-medium text-brand-ink disabled:cursor-not-allowed disabled:opacity-60"
            >
              Ajouter au panier
            </button>
            <button disabled title="Le paiement arrive à l'étape 2" className="mt-2 w-full rounded-full bg-accent py-2 font-medium text-accent-ink disabled:cursor-not-allowed disabled:opacity-60">
              Acheter maintenant
            </button>
            <p className="mt-2 text-center text-xs text-muted">Panier et paiement : prochaine étape</p>
            <dl className="mt-4 grid grid-cols-[auto_1fr] gap-x-3 gap-y-1 text-xs text-muted">
              <dt>Expédié par</dt>
              <dd>{shop.name}</dd>
              <dt>Vendu par</dt>
              <dd>{p.brand}</dd>
              <dt>Retours</dt>
              <dd>Gratuits sous 30 jours</dd>
              <dt>Paiement</dt>
              <dd>Transaction sécurisée</dd>
            </dl>
            <hr className="my-4 border-line" />
            <button disabled className="w-full rounded-card border border-line py-1.5 text-sm disabled:opacity-60">
              ♡ Ajouter à la liste d&apos;envies
            </button>
          </aside>
        </div>

        <hr className="my-8 border-line" />
        <ProductRow title="Produits similaires" products={similar} href={`/categorie/${cat.slug}`} />
        {sameBrand.length > 0 && (
          <div className="mt-4">
            <ProductRow title={`Autres produits ${p.brand}`} products={sameBrand} />
          </div>
        )}

        <hr className="my-8 border-line" />
        <section id="avis" className="grid gap-8 md:grid-cols-[300px_1fr]">
          <div>
            <h2 className="text-xl font-bold">Commentaires client</h2>
            <div className="mt-2 flex items-center gap-2">
              <Stars rating={p.rating} size="md" />
              <span className="font-medium">{p.rating.toLocaleString("fr-FR")} sur 5</span>
            </div>
            <p className="text-sm text-muted">{p.reviewCount.toLocaleString("fr-FR")} évaluations</p>
            <div className="mt-4 space-y-2">
              {dist.map((d, i) => {
                const pct = Math.round((d / distTotal) * 100);
                return (
                  <div key={i} className="flex items-center gap-2 text-sm">
                    <span className="w-16 text-link">{5 - i} étoiles</span>
                    <span className="h-5 flex-1 overflow-hidden rounded border border-line bg-surface-2">
                      <span className="block h-full bg-star" style={{ width: `${pct}%` }} />
                    </span>
                    <span className="w-9 text-right text-muted">{pct} %</span>
                  </div>
                );
              })}
            </div>
          </div>
          <div className="rounded-card border border-dashed border-line p-6 text-muted">
            Les avis détaillés des clients (texte, photos, votes utiles) seront ajoutés à l&apos;étape 4.
          </div>
        </section>
      </div>
    </div>
  );
}
