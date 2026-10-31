import Link from "next/link";
import { PAGE_SIZE, categories, getCategory, searchProducts, sortOptions, type SearchParams } from "@/lib/catalog";
import { formatPrice } from "@/lib/config";
import { AutoSubmitSelect } from "./AutoSubmitSelect";
import { ProductCard } from "./ProductCard";
import { Stars } from "./Stars";

type Props = {
  params: SearchParams;
  basePath: string; // "/recherche" ou "/categorie/xxx"
  lockedCategory?: string;
  lockedShop?: string;
};

const priceRanges = [
  { label: "Moins de 20 €", max: 20 },
  { label: "20 à 50 €", min: 20, max: 50 },
  { label: "50 à 100 €", min: 50, max: 100 },
  { label: "100 à 250 €", min: 100, max: 250 },
  { label: "250 € et plus", min: 250 },
];

// Construit l'URL avec les filtres actuels + des modifications. Une valeur `undefined` retire le filtre.
function hrefWith(basePath: string, params: SearchParams, changes: Partial<Record<keyof SearchParams, unknown>>, lockedCategory?: string) {
  const next: Record<string, unknown> = { ...params, page: undefined, ...changes };
  const qs = new URLSearchParams();
  for (const [k, v] of Object.entries(next)) {
    if ((k === "cat" && lockedCategory) || k === "shop") continue;
    if (v === undefined || v === false || v === "" || (k === "tri" && v === "pertinence") || (k === "page" && v === 1)) continue;
    if (Array.isArray(v)) v.forEach((x) => qs.append(k, String(x)));
    else qs.set(k, v === true ? "1" : String(v));
  }
  const s = qs.toString();
  return s ? `${basePath}?${s}` : basePath;
}

function FilterLink({ href, active, children }: { href: string; active?: boolean; children: React.ReactNode }) {
  return (
    <Link href={href} scroll={false} className={`flex items-center gap-2 py-0.5 text-sm hover:text-link ${active ? "font-bold text-ink" : "text-ink/85"}`}>
      {children}
    </Link>
  );
}

function Check({ on }: { on: boolean }) {
  return (
    <span className={`grid h-4 w-4 shrink-0 place-items-center rounded-sm border text-[10px] ${on ? "border-accent bg-accent text-accent-ink" : "border-muted"}`}>{on ? "✓" : ""}</span>
  );
}

export function SearchResults({ params, basePath, lockedCategory, lockedShop }: Props) {
  const p = { ...params, ...(lockedCategory && { cat: lockedCategory }), ...(lockedShop && { shop: lockedShop }) };
  const { items, total, page, pageCount, brands, categoryCounts } = searchProducts(p);
  const href = (changes: Partial<Record<keyof SearchParams, unknown>>) => hrefWith(basePath, p, changes, lockedCategory);
  const activeCat = p.cat ? getCategory(p.cat) : undefined;
  const hasFilters = !!(p.marque?.length || p.min !== undefined || p.max !== undefined || p.note || p.rapide || p.promo || p.stock);

  const filters = (
    <div className="space-y-6">
      {!lockedCategory && (
        <div>
          <h3 className="mb-2 font-bold">Catégorie</h3>
          {p.cat && <FilterLink href={href({ cat: undefined })}>‹ Toutes les catégories</FilterLink>}
          {(p.cat ? categoryCounts.filter((c) => c.slug === p.cat) : categoryCounts).map((c) => (
            <FilterLink key={c.slug} href={href({ cat: c.slug })} active={p.cat === c.slug}>
              {c.emoji} {c.name} <span className="text-muted">({c.count})</span>
            </FilterLink>
          ))}
          {categoryCounts.length === 0 && <p className="text-sm text-muted">Aucune</p>}
        </div>
      )}

      <div>
        <h3 className="mb-2 font-bold">Livraison</h3>
        <FilterLink href={href({ rapide: !p.rapide })} active={p.rapide}>
          <Check on={!!p.rapide} /> ⚡ Livraison express
        </FilterLink>
      </div>

      <div>
        <h3 className="mb-2 font-bold">Avis clients</h3>
        {[4, 3].map((n) => (
          <FilterLink key={n} href={href({ note: p.note === n ? undefined : n })} active={p.note === n}>
            <Stars rating={n} /> et plus
          </FilterLink>
        ))}
      </div>

      <div>
        <h3 className="mb-2 font-bold">Prix</h3>
        {priceRanges.map((r) => {
          const on = p.min === r.min && p.max === r.max;
          return (
            <FilterLink key={r.label} href={href(on ? { min: undefined, max: undefined } : { min: r.min, max: r.max })} active={on}>
              {r.label}
            </FilterLink>
          );
        })}
        <form action={basePath} className="mt-2 flex items-center gap-1">
          {Object.entries({ q: p.q, cat: lockedCategory ? undefined : p.cat, note: p.note, tri: p.tri !== "pertinence" ? p.tri : undefined, rapide: p.rapide ? 1 : undefined, promo: p.promo ? 1 : undefined, stock: p.stock ? 1 : undefined }).map(
            ([k, v]) => v !== undefined && <input key={k} type="hidden" name={k} value={String(v)} />
          )}
          {p.marque?.map((m) => <input key={m} type="hidden" name="marque" value={m} />)}
          <input name="min" type="number" min={0} placeholder="Min" defaultValue={p.min} className="w-16 rounded border border-line bg-surface px-2 py-1 text-sm" />
          <input name="max" type="number" min={0} placeholder="Max" defaultValue={p.max} className="w-16 rounded border border-line bg-surface px-2 py-1 text-sm" />
          <button className="rounded-full border border-line bg-surface-2 px-3 py-1 text-sm hover:bg-line">OK</button>
        </form>
      </div>

      <div>
        <h3 className="mb-2 font-bold">Marques</h3>
        {brands.map((b) => {
          const on = !!p.marque?.includes(b);
          const nextBrands = on ? p.marque!.filter((x) => x !== b) : [...(p.marque ?? []), b];
          return (
            <FilterLink key={b} href={href({ marque: nextBrands })} active={on}>
              <Check on={on} /> {b}
            </FilterLink>
          );
        })}
      </div>

      <div>
        <h3 className="mb-2 font-bold">Offres et disponibilité</h3>
        <FilterLink href={href({ promo: !p.promo })} active={p.promo}>
          <Check on={!!p.promo} /> En promotion
        </FilterLink>
        <FilterLink href={href({ stock: !p.stock })} active={p.stock}>
          <Check on={!!p.stock} /> Exclure les produits indisponibles
        </FilterLink>
      </div>
    </div>
  );

  return (
    <div>
      {/* Barre de résultats */}
      <div className="border-b border-line bg-surface">
        <div className="mx-auto flex max-w-[1500px] flex-wrap items-center justify-between gap-2 px-4 py-2 text-sm">
          <p>
            {total === 0 ? "Aucun résultat" : `${(page - 1) * PAGE_SIZE + 1}-${Math.min(page * PAGE_SIZE, total)} sur ${total} résultat${total > 1 ? "s" : ""}`}
            {p.q && (
              <>
                {" "}
                pour <b className="text-deal">« {p.q} »</b>
              </>
            )}
            {activeCat && !lockedCategory && (
              <>
                {" "}
                dans <b>{activeCat.name}</b>
              </>
            )}
          </p>
          <form action={basePath} className="flex items-center gap-2">
            {[...new URLSearchParams(href({ tri: undefined }).split("?")[1] ?? "").entries()].map(([k, v], i) => (
              <input key={k + i} type="hidden" name={k} value={v} />
            ))}
            <label htmlFor="tri" className="text-muted">
              Trier par
            </label>
            <AutoSubmitSelect id="tri" name="tri" defaultValue={p.tri} className="rounded-card border border-line bg-surface-2 px-2 py-1">
              {sortOptions.map((o) => (
                <option key={o.value} value={o.value}>
                  {o.label}
                </option>
              ))}
            </AutoSubmitSelect>
            <noscript>
              <button className="rounded-full bg-brand px-3 py-1 font-medium text-brand-ink">Trier</button>
            </noscript>
          </form>
        </div>
      </div>

      <div className="mx-auto flex max-w-[1500px] gap-6 px-4 py-4">
        {/* Filtres : colonne sur ordinateur, menu repliable sur mobile */}
        <aside className="hidden w-60 shrink-0 md:block">{filters}</aside>

        <div className="min-w-0 flex-1">
          <details className="mb-4 rounded-card border border-line bg-surface p-3 md:hidden">
            <summary className="cursor-pointer font-bold">Filtres{hasFilters ? " (actifs)" : ""}</summary>
            <div className="mt-4">{filters}</div>
          </details>

          {hasFilters && (
            <div className="mb-4 flex flex-wrap gap-2 text-sm">
              {p.marque?.map((m) => (
                <Chip key={m} href={href({ marque: p.marque!.filter((x) => x !== m) })}>
                  {m}
                </Chip>
              ))}
              {(p.min !== undefined || p.max !== undefined) && (
                <Chip href={href({ min: undefined, max: undefined })}>
                  {p.min !== undefined && p.max !== undefined
                    ? `${formatPrice(p.min)} – ${formatPrice(p.max)}`
                    : p.min !== undefined
                      ? `Dès ${formatPrice(p.min)}`
                      : `Jusqu'à ${formatPrice(p.max!)}`}
                </Chip>
              )}
              {p.note && <Chip href={href({ note: undefined })}>{p.note}★ et plus</Chip>}
              {p.rapide && <Chip href={href({ rapide: false })}>Livraison express</Chip>}
              {p.promo && <Chip href={href({ promo: false })}>En promotion</Chip>}
              {p.stock && <Chip href={href({ stock: false })}>En stock</Chip>}
              <Link href={hrefWith(basePath, { q: p.q, cat: p.cat, tri: p.tri }, {}, lockedCategory)} className="px-2 py-1 text-link hover:underline">
                Tout effacer
              </Link>
            </div>
          )}

          <h2 className="mb-3 text-xl font-bold">Résultats</h2>
          {items.length === 0 ? (
            <div className="rounded-card border border-line bg-surface p-8 text-center">
              <p className="text-lg font-bold">Aucun produit ne correspond à votre recherche.</p>
              <p className="mt-2 text-muted">Essayez d&apos;autres mots-clés ou retirez des filtres.</p>
              <div className="mt-4 flex flex-wrap justify-center gap-2">
                {categories.slice(0, 4).map((c) => (
                  <Link key={c.slug} href={`/categorie/${c.slug}`} className="rounded-full border border-line px-3 py-1 text-sm hover:bg-surface-2">
                    {c.emoji} {c.name}
                  </Link>
                ))}
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
              {items.map((it) => (
                <ProductCard key={it.id} product={it} />
              ))}
            </div>
          )}

          {pageCount > 1 && (
            <nav className="mt-8 flex justify-center gap-1" aria-label="Pagination">
              {page > 1 && <PageLink href={href({ page: page - 1 })}>‹ Précédent</PageLink>}
              {Array.from({ length: pageCount }, (_, i) => i + 1).map((n) => (
                <PageLink key={n} href={href({ page: n })} active={n === page}>
                  {n}
                </PageLink>
              ))}
              {page < pageCount && <PageLink href={href({ page: page + 1 })}>Suivant ›</PageLink>}
            </nav>
          )}
        </div>
      </div>
    </div>
  );
}

function Chip({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <Link href={href} scroll={false} className="flex items-center gap-1 rounded-full border border-line bg-surface px-3 py-1 hover:bg-surface-2">
      {children} <span className="text-muted">✕</span>
    </Link>
  );
}

function PageLink({ href, active, children }: { href: string; active?: boolean; children: React.ReactNode }) {
  return (
    <Link
      href={href}
      aria-current={active ? "page" : undefined}
      className={`rounded-card border px-3 py-1.5 text-sm ${active ? "border-ink font-bold" : "border-line bg-surface hover:bg-surface-2"}`}
    >
      {children}
    </Link>
  );
}
