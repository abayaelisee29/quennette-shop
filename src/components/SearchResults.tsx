import Link from "next/link";
import { PAGE_SIZE, SORTS, getCategories, searchProducts, type SearchParams } from "@/lib/catalog";
import { fill } from "@/lib/i18n";
import { getI18n } from "@/lib/i18n/server";
import { AutoSubmitSelect } from "./AutoSubmitSelect";
import { ProductCard } from "./ProductCard";
import { Stars } from "./Stars";

type Props = {
  params: SearchParams;
  basePath: string; // "/search" ou "/category/xxx"
  lockedCategory?: string;
  lockedShop?: string;
};

const priceRanges: { min?: number; max?: number }[] = [{ max: 20 }, { min: 20, max: 50 }, { min: 50, max: 100 }, { min: 100, max: 250 }, { min: 250 }];

// Construit l'URL avec les filtres actuels + des modifications. Une valeur `undefined` retire le filtre.
function hrefWith(basePath: string, params: SearchParams, changes: Partial<Record<keyof SearchParams, unknown>>, lockedCategory?: string) {
  const next: Record<string, unknown> = { ...params, page: undefined, ...changes };
  const qs = new URLSearchParams();
  for (const [k, v] of Object.entries(next)) {
    if ((k === "cat" && lockedCategory) || k === "shop") continue;
    if (v === undefined || v === false || v === "" || (k === "sort" && v === "relevance") || (k === "page" && v === 1)) continue;
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

export async function SearchResults({ params, basePath, lockedCategory, lockedShop }: Props) {
  const { lang, t, fmt } = await getI18n();
  const s = t.search;
  const p = { ...params, ...(lockedCategory && { cat: lockedCategory }), ...(lockedShop && { shop: lockedShop }) };
  const { items, total, page, pageCount, brands, categoryCounts, category: activeCat } = searchProducts(p, lang);
  const href = (changes: Partial<Record<keyof SearchParams, unknown>>) => hrefWith(basePath, p, changes, lockedCategory);
  const hasFilters = !!(p.brand?.length || p.min !== undefined || p.max !== undefined || p.rating || p.fast || p.deal || p.stock);

  const filters = (
    <div className="space-y-6">
      {!lockedCategory && (
        <div>
          <h3 className="mb-2 font-bold">{s.category}</h3>
          {p.cat && <FilterLink href={href({ cat: undefined })}>{s.allCategories}</FilterLink>}
          {(p.cat ? categoryCounts.filter((c) => c.slug === p.cat) : categoryCounts).map((c) => (
            <FilterLink key={c.slug} href={href({ cat: c.slug })} active={p.cat === c.slug}>
              {c.emoji} {c.name} <span className="text-muted">({c.count})</span>
            </FilterLink>
          ))}
          {categoryCounts.length === 0 && <p className="text-sm text-muted">{s.none}</p>}
        </div>
      )}

      <div>
        <h3 className="mb-2 font-bold">{s.delivery}</h3>
        <FilterLink href={href({ fast: !p.fast })} active={p.fast}>
          <Check on={!!p.fast} /> {s.express}
        </FilterLink>
      </div>

      <div>
        <h3 className="mb-2 font-bold">{s.customerReviews}</h3>
        {[4, 3].map((n) => (
          <FilterLink key={n} href={href({ rating: p.rating === n ? undefined : n })} active={p.rating === n}>
            <Stars rating={n} /> {s.andUp}
          </FilterLink>
        ))}
      </div>

      <div>
        <h3 className="mb-2 font-bold">{s.price}</h3>
        {priceRanges.map((r) => {
          const on = p.min === r.min && p.max === r.max;
          const label =
            r.min === undefined
              ? fill(s.under, { a: fmt.price(r.max!) })
              : r.max === undefined
                ? fill(s.over, { a: fmt.price(r.min) })
                : fill(s.between, { a: fmt.price(r.min), b: fmt.price(r.max) });
          return (
            <FilterLink key={label} href={href(on ? { min: undefined, max: undefined } : { min: r.min, max: r.max })} active={on}>
              {label}
            </FilterLink>
          );
        })}
        <form action={basePath} className="mt-2 flex items-center gap-1">
          {Object.entries({ q: p.q, cat: lockedCategory ? undefined : p.cat, rating: p.rating, sort: p.sort !== "relevance" ? p.sort : undefined, fast: p.fast ? 1 : undefined, deal: p.deal ? 1 : undefined, stock: p.stock ? 1 : undefined }).map(
            ([k, v]) => v !== undefined && <input key={k} type="hidden" name={k} value={String(v)} />
          )}
          {p.brand?.map((m) => <input key={m} type="hidden" name="brand" value={m} />)}
          <input name="min" type="number" min={0} placeholder={s.min} defaultValue={p.min} className="w-16 rounded border border-line bg-surface px-2 py-1 text-sm" />
          <input name="max" type="number" min={0} placeholder={s.max} defaultValue={p.max} className="w-16 rounded border border-line bg-surface px-2 py-1 text-sm" />
          <button className="rounded-full border border-line bg-surface-2 px-3 py-1 text-sm hover:bg-line">{s.go}</button>
        </form>
      </div>

      <div>
        <h3 className="mb-2 font-bold">{s.brands}</h3>
        {brands.map((b) => {
          const on = !!p.brand?.includes(b);
          const nextBrands = on ? p.brand!.filter((x) => x !== b) : [...(p.brand ?? []), b];
          return (
            <FilterLink key={b} href={href({ brand: nextBrands })} active={on}>
              <Check on={on} /> {b}
            </FilterLink>
          );
        })}
      </div>

      <div>
        <h3 className="mb-2 font-bold">{s.dealsAvailability}</h3>
        <FilterLink href={href({ deal: !p.deal })} active={p.deal}>
          <Check on={!!p.deal} /> {s.onSale}
        </FilterLink>
        <FilterLink href={href({ stock: !p.stock })} active={p.stock}>
          <Check on={!!p.stock} /> {s.excludeOut}
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
            {total === 0 ? s.noResults : total === 1 ? s.single : fill(s.range, { from: (page - 1) * PAGE_SIZE + 1, to: Math.min(page * PAGE_SIZE, total), total: fmt.number(total) })}
            {p.q && (
              <>
                {" "}
                {s.for} <b className="text-deal">“{p.q}”</b>
              </>
            )}
            {activeCat && !lockedCategory && (
              <>
                {" "}
                {s.in} <b>{activeCat.name}</b>
              </>
            )}
          </p>
          <form action={basePath} className="flex items-center gap-2">
            {[...new URLSearchParams(href({ sort: undefined }).split("?")[1] ?? "").entries()].map(([k, v], i) => (
              <input key={k + i} type="hidden" name={k} value={v} />
            ))}
            <label htmlFor="sort" className="text-muted">
              {s.sortBy}
            </label>
            <AutoSubmitSelect id="sort" name="sort" defaultValue={p.sort} className="rounded-card border border-line bg-surface-2 px-2 py-1">
              {SORTS.map((o) => (
                <option key={o} value={o}>
                  {s.sorts[o]}
                </option>
              ))}
            </AutoSubmitSelect>
            <noscript>
              <button className="rounded-full bg-brand px-3 py-1 font-medium text-brand-ink">{s.sortSubmit}</button>
            </noscript>
          </form>
        </div>
      </div>

      <div className="mx-auto flex max-w-[1500px] gap-6 px-4 py-4">
        {/* Filtres : colonne sur ordinateur, menu repliable sur mobile */}
        <aside className="hidden w-60 shrink-0 md:block">{filters}</aside>

        <div className="min-w-0 flex-1">
          <details className="mb-4 rounded-card border border-line bg-surface p-3 md:hidden">
            <summary className="cursor-pointer font-bold">{hasFilters ? s.filtersActive : s.filters}</summary>
            <div className="mt-4">{filters}</div>
          </details>

          {hasFilters && (
            <div className="mb-4 flex flex-wrap gap-2 text-sm">
              {p.brand?.map((m) => (
                <Chip key={m} href={href({ brand: p.brand!.filter((x) => x !== m) })}>
                  {m}
                </Chip>
              ))}
              {(p.min !== undefined || p.max !== undefined) && (
                <Chip href={href({ min: undefined, max: undefined })}>
                  {p.min !== undefined && p.max !== undefined
                    ? `${fmt.price(p.min)} – ${fmt.price(p.max)}`
                    : p.min !== undefined
                      ? fill(s.from, { a: fmt.price(p.min) })
                      : fill(s.upTo, { a: fmt.price(p.max!) })}
                </Chip>
              )}
              {p.rating && <Chip href={href({ rating: undefined })}>{fill(s.ratingChip, { n: p.rating })}</Chip>}
              {p.fast && <Chip href={href({ fast: false })}>{s.express}</Chip>}
              {p.deal && <Chip href={href({ deal: false })}>{s.onSale}</Chip>}
              {p.stock && <Chip href={href({ stock: false })}>{s.inStock}</Chip>}
              <Link href={hrefWith(basePath, { q: p.q, cat: p.cat, sort: p.sort }, {}, lockedCategory)} className="px-2 py-1 text-link hover:underline">
                {s.clearAll}
              </Link>
            </div>
          )}

          <h2 className="mb-3 text-xl font-bold">{s.results}</h2>
          {items.length === 0 ? (
            <div className="rounded-card border border-line bg-surface p-8 text-center">
              <p className="text-lg font-bold">{s.noMatch}</p>
              <p className="mt-2 text-muted">{s.tryOther}</p>
              <div className="mt-4 flex flex-wrap justify-center gap-2">
                {getCategories(lang).slice(0, 4).map((c) => (
                  <Link key={c.slug} href={`/category/${c.slug}`} className="rounded-full border border-line px-3 py-1 text-sm hover:bg-surface-2">
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
            <nav className="mt-8 flex justify-center gap-1" aria-label={s.pagination}>
              {page > 1 && <PageLink href={href({ page: page - 1 })}>{s.prev}</PageLink>}
              {Array.from({ length: pageCount }, (_, i) => i + 1).map((n) => (
                <PageLink key={n} href={href({ page: n })} active={n === page}>
                  {n}
                </PageLink>
              ))}
              {page < pageCount && <PageLink href={href({ page: page + 1 })}>{s.next}</PageLink>}
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
