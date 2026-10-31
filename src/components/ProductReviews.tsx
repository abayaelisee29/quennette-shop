import Link from "next/link";
import { deleteReviewAction, toggleHelpfulAction } from "@/app/actions/reviews";
import { listReviews, type Review, type User } from "@/lib/db";
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

export function ProductReviews({ product, user, filter, sort = "utiles", thanks }: Props) {
  const all = listReviews(product.id);
  const dist = distribution(product, all);
  const distTotal = Math.max(1, dist.reduce((a, b) => a + b, 0));
  const mine = user ? all.find((r) => r.userId === user.id) : undefined;
  const isOwner = !!user?.shopId && user.shopId === product.sellerId;
  const shown = all
    .filter((r) => !filter || r.rating === filter)
    .sort((a, b) => (sort === "recents" ? b.createdAt.localeCompare(a.createdAt) : b.helpful.length - a.helpful.length || b.createdAt.localeCompare(a.createdAt)));
  const href = (q: Record<string, string | number | undefined>) => {
    const params = new URLSearchParams();
    const next = { note: filter, tri: sort === "utiles" ? undefined : sort, ...q };
    for (const [k, v] of Object.entries(next)) if (v !== undefined && v !== "") params.set(k === "tri" ? "avis_tri" : "avis_note", String(v));
    const s = params.toString();
    return `/produit/${product.id}${s ? `?${s}` : ""}#avis`;
  };

  return (
    <section id="avis" className="grid scroll-mt-32 gap-8 md:grid-cols-[300px_1fr]">
      <div>
        <h2 className="text-xl font-bold">Commentaires client</h2>
        {product.reviewCount > 0 ? (
          <>
            <div className="mt-2 flex items-center gap-2">
              <Stars rating={product.rating} size="md" />
              <span className="font-medium">{product.rating.toLocaleString("fr-FR")} sur 5</span>
            </div>
            <p className="text-sm text-muted">{product.reviewCount.toLocaleString("fr-FR")} évaluations</p>
            <div className="mt-4 space-y-2">
              {dist.map((d, i) => {
                const pct = Math.round((d / distTotal) * 100);
                const stars = 5 - i;
                return (
                  <Link key={i} href={href({ note: filter === stars ? undefined : stars })} scroll={false} className="flex items-center gap-2 text-sm hover:underline">
                    <span className={`w-16 ${filter === stars ? "font-bold" : ""} text-link`}>{stars} étoile{stars > 1 ? "s" : ""}</span>
                    <span className="h-5 flex-1 overflow-hidden rounded border border-line bg-surface-2">
                      <span className="block h-full bg-star" style={{ width: `${pct}%` }} />
                    </span>
                    <span className="w-9 text-right text-muted">{pct} %</span>
                  </Link>
                );
              })}
            </div>
          </>
        ) : (
          <p className="mt-2 text-sm text-muted">Pas encore d&apos;évaluation.</p>
        )}
        <hr className="my-6 border-line" />
        <h3 className="font-bold">Donnez votre avis sur ce produit</h3>
        <p className="mt-1 text-sm text-muted">Partagez votre expérience avec les autres clients.</p>
        {isOwner ? (
          <p className="mt-3 text-sm text-muted">Vous ne pouvez pas évaluer vos propres produits.</p>
        ) : (
          <Link href={`/produit/${product.id}/avis`} className="mt-3 block rounded-full border border-line py-1.5 text-center text-sm hover:bg-surface-2">
            {mine ? "Modifier mon commentaire" : "Écrire un commentaire"}
          </Link>
        )}
      </div>

      <div>
        {thanks && <p className="mb-4 rounded-card border border-ok/40 bg-ok/10 p-3 text-sm text-ok">Merci ! Votre commentaire est publié.</p>}
        {all.length > 0 && (
          <div className="mb-4 flex flex-wrap items-center gap-2 text-sm">
            <span className="font-bold">
              {shown.length} commentaire{shown.length > 1 ? "s" : ""}
              {filter ? ` avec ${filter} étoile${filter > 1 ? "s" : ""}` : ""}
            </span>
            {filter && (
              <Link href={href({ note: undefined })} scroll={false} className="text-link hover:underline">
                Voir tous
              </Link>
            )}
            <span className="ml-auto flex gap-1">
              {[
                ["utiles", "Les plus utiles"],
                ["recents", "Les plus récents"],
              ].map(([v, l]) => (
                <Link key={v} href={href({ tri: v === "utiles" ? undefined : v })} scroll={false} className={`rounded-full border px-3 py-1 ${sort === v ? "border-ink font-bold" : "border-line"}`}>
                  {l}
                </Link>
              ))}
            </span>
          </div>
        )}
        {shown.length === 0 ? (
          <p className="rounded-card border border-dashed border-line p-6 text-muted">
            {all.length ? "Aucun commentaire avec cette note." : "Aucun commentaire écrit pour l'instant. Soyez le premier à partager votre avis !"}
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
                  Évalué le {new Date(r.createdAt).toLocaleDateString("fr-FR", { day: "numeric", month: "long", year: "numeric" })}
                  {r.updatedAt && " (modifié)"}
                </p>
                {r.verified && <p className="text-xs font-bold text-deal">Achat vérifié</p>}
                <p className="mt-2 text-sm leading-relaxed whitespace-pre-line">{r.body}</p>
                <div className="mt-2 flex items-center gap-3 text-xs text-muted">
                  {r.helpful.length > 0 && (
                    <span>
                      {r.helpful.length} personne{r.helpful.length > 1 ? "s ont" : " a"} trouvé cela utile
                    </span>
                  )}
                  {user?.id === r.userId ? (
                    <form action={deleteReviewAction}>
                      <input type="hidden" name="reviewId" value={r.id} />
                      <button className="text-deal hover:underline">Supprimer mon commentaire</button>
                    </form>
                  ) : (
                    <form action={toggleHelpfulAction}>
                      <input type="hidden" name="reviewId" value={r.id} />
                      <button className="rounded-full border border-line px-3 py-1 text-ink hover:bg-surface-2">
                        {user && r.helpful.includes(user.id) ? "✓ Utile" : "Utile"}
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
