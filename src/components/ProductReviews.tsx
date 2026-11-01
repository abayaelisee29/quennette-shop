import Link from "next/link";
import { deleteReviewAction, toggleHelpfulAction } from "@/app/actions/reviews";
import { listReviews, type Review, type User } from "@/lib/db";
import { fill, plural } from "@/lib/i18n";
import { getI18n } from "@/lib/i18n/server";
import type { Product } from "@/lib/products";
import { Stars } from "./Stars";

type Props = { product: Product; user?: User; filter?: number; sort?: string; thanks?: boolean };

// Répartition des notes : avis réels + part simulée pour les notes du catalogue d'exemple.
function distribution(product: Product, reviews: Review[]) {
  const real = [5, 4, 3, 2, 1].map((s) => reviews.filter((r) => r.rating === s).length);
  const synthetic = Math.max(0, product.reviewCount - reviews.length);
  if (!synthetic) return real;
  const shape = [5, 4, 3, 2, 1].map((s) => Math.exp(-Math.abs(s - product.rating) * 1.3));
  const sum = shape.reduce((a, b) => a + b, 0);
  return real.map((n, i) => n + Math.round((shape[i] / sum) * synthetic));
}

export async function ProductReviews({ product, user, filter, sort = "top", thanks }: Props) {
  const { t, fmt } = await getI18n();
  const rv = t.reviews;
  const all = listReviews(product.id);
  const dist = distribution(product, all);
  const distTotal = Math.max(1, dist.reduce((a, b) => a + b, 0));
  const mine = user ? all.find((r) => r.userId === user.id) : undefined;
  const isOwner = !!user?.shopId && user.shopId === product.sellerId;
  const shown = all
    .filter((r) => !filter || r.rating === filter)
    .sort((a, b) => (sort === "recent" ? b.createdAt.localeCompare(a.createdAt) : b.helpful.length - a.helpful.length || b.createdAt.localeCompare(a.createdAt)));
  const href = (q: Record<string, string | number | undefined>) => {
    const params = new URLSearchParams();
    const next = { rating: filter, sort: sort === "top" ? undefined : sort, ...q };
    for (const [k, v] of Object.entries(next)) if (v !== undefined && v !== "") params.set(k === "sort" ? "review_sort" : "review_rating", String(v));
    const s = params.toString();
    return `/product/${product.id}${s ? `?${s}` : ""}#reviews`;
  };

  return (
    <section id="reviews" className="grid scroll-mt-32 gap-8 md:grid-cols-[300px_1fr]">
      <div>
        <h2 className="text-xl font-bold">{rv.title}</h2>
        {product.reviewCount > 0 ? (
          <>
            <div className="mt-2 flex items-center gap-2">
              <Stars rating={product.rating} size="md" />
              <span className="font-medium">{fill(rv.outOf, { r: fmt.number(product.rating) })}</span>
            </div>
            <p className="text-sm text-muted">{plural(product.reviewCount, rv.ratings, { n: fmt.number(product.reviewCount) })}</p>
            <div className="mt-4 space-y-2">
              {dist.map((d, i) => {
                const pct = Math.round((d / distTotal) * 100);
                const stars = 5 - i;
                return (
                  <Link key={i} href={href({ rating: filter === stars ? undefined : stars })} scroll={false} className="flex items-center gap-2 text-sm hover:underline">
                    <span className={`w-16 ${filter === stars ? "font-bold" : ""} text-link`}>{plural(stars, rv.star)}</span>
                    <span className="h-5 flex-1 overflow-hidden rounded border border-line bg-surface-2">
                      <span className="block h-full bg-star" style={{ width: `${pct}%` }} />
                    </span>
                    <span className="w-9 text-right text-muted">{pct}%</span>
                  </Link>
                );
              })}
            </div>
          </>
        ) : (
          <p className="mt-2 text-sm text-muted">{rv.none}</p>
        )}
        <hr className="my-6 border-line" />
        <h3 className="font-bold">{rv.reviewThis}</h3>
        <p className="mt-1 text-sm text-muted">{rv.share}</p>
        {isOwner ? (
          <p className="mt-3 text-sm text-muted">{rv.ownProduct}</p>
        ) : (
          <Link href={`/product/${product.id}/review`} className="mt-3 block rounded-full border border-line py-1.5 text-center text-sm hover:bg-surface-2">
            {mine ? rv.edit : rv.write}
          </Link>
        )}
      </div>

      <div>
        {thanks && <p className="mb-4 rounded-card border border-ok/40 bg-ok/10 p-3 text-sm text-ok">{rv.thanks}</p>}
        {all.length > 0 && (
          <div className="mb-4 flex flex-wrap items-center gap-2 text-sm">
            <span className="font-bold">
              {plural(shown.length, rv.count)}
              {filter ? ` ${plural(filter, rv.withStars)}` : ""}
            </span>
            {filter && (
              <Link href={href({ rating: undefined })} scroll={false} className="text-link hover:underline">
                {rv.seeAll}
              </Link>
            )}
            <span className="ml-auto flex gap-1">
              {[
                ["top", rv.top],
                ["recent", rv.recent],
              ].map(([v, l]) => (
                <Link key={v} href={href({ sort: v === "top" ? undefined : v })} scroll={false} className={`rounded-full border px-3 py-1 ${sort === v ? "border-ink font-bold" : "border-line"}`}>
                  {l}
                </Link>
              ))}
            </span>
          </div>
        )}
        {shown.length === 0 ? (
          <p className="rounded-card border border-dashed border-line p-6 text-muted">
            {all.length ? rv.noneWithRating : rv.noneYet}
          </p>
        ) : (
          <ul className="space-y-6">
            {shown.map((r) => (
              <li key={r.id} className="border-b border-line pb-5">
                <div className="flex items-center gap-2 text-sm">
                  <span className="grid h-8 w-8 place-items-center rounded-full bg-surface-2 font-bold">{r.userName[0]?.toUpperCase()}</span>
                  <span>{r.userName}</span>
                </div>
                <p className="mt-1 flex flex-wrap items-center gap-2">
                  <Stars rating={r.rating} />
                  <b>{r.title}</b>
                </p>
                <p className="text-xs text-muted">
                  {fill(rv.reviewedOn, { date: fmt.date(r.createdAt) })}
                  {r.updatedAt && ` ${rv.edited}`}
                </p>
                {r.verified && <p className="text-xs font-bold text-deal">{rv.verified}</p>}
                <p className="mt-2 text-sm leading-relaxed whitespace-pre-line">{r.body}</p>
                <div className="mt-2 flex items-center gap-3 text-xs text-muted">
                  {r.helpful.length > 0 && (
                    <span>{plural(r.helpful.length, rv.helpfulCount)}</span>
                  )}
                  {user?.id === r.userId ? (
                    <form action={deleteReviewAction}>
                      <input type="hidden" name="reviewId" value={r.id} />
                      <button className="text-deal hover:underline">{rv.delete}</button>
                    </form>
                  ) : (
                    <form action={toggleHelpfulAction}>
                      <input type="hidden" name="reviewId" value={r.id} />
                      <button className="rounded-full border border-line px-3 py-1 text-ink hover:bg-surface-2">
                        {user && r.helpful.includes(user.id) ? rv.helpfulDone : rv.helpful}
                      </button>
                    </form>
                  )}
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </section>
  );
}
