"use client";

import { useActionState, useState } from "react";
import { submitReview, type ReviewFormState } from "@/app/actions/reviews";
import { SubmitButton } from "./SubmitButton";

const input = "mt-1 w-full rounded-card border border-line bg-surface px-3 py-2 font-normal outline-none focus:border-accent focus:ring-2 focus:ring-accent/30";
const labels = ["", "Très déçu", "Déçu", "Correct", "Satisfait", "Excellent"];

export function ReviewForm({ productId, defaults }: { productId: string; defaults?: { rating: number; title: string; body: string } }) {
  const [state, action] = useActionState<ReviewFormState, FormData>(submitReview, {});
  const [rating, setRating] = useState(Number(state.values?.rating) || defaults?.rating || 0);
  const [hover, setHover] = useState(0);
  const v = { title: defaults?.title, body: defaults?.body, ...state.values };
  const shown = hover || rating;

  return (
    <form action={action} className="space-y-5">
      <input type="hidden" name="productId" value={productId} />
      <input type="hidden" name="rating" value={rating || ""} />
      {state.error && (
        <p role="alert" className="rounded-card border border-deal/40 bg-deal/10 px-3 py-2 text-sm text-deal">
          {state.error}
        </p>
      )}
      <fieldset>
        <legend className="text-sm font-bold">Note globale</legend>
        <div className="mt-1 flex items-center gap-1" onMouseLeave={() => setHover(0)}>
          {[1, 2, 3, 4, 5].map((n) => (
            <button
              key={n}
              type="button"
              aria-label={`${n} étoile${n > 1 ? "s" : ""}`}
              aria-pressed={rating === n}
              onClick={() => setRating(n)}
              onMouseEnter={() => setHover(n)}
              className={`text-4xl leading-none transition ${n <= shown ? "text-star" : "text-line"}`}
            >
              ★
            </button>
          ))}
          <span className="ml-2 text-sm text-muted">{labels[shown]}</span>
        </div>
      </fieldset>
      <label className="block text-sm font-bold">
        Titre de votre commentaire
        <input name="title" defaultValue={v.title} maxLength={100} required placeholder="Ce qu'il faut retenir" className={input} />
      </label>
      <label className="block text-sm font-bold">
        Votre commentaire
        <textarea name="body" defaultValue={v.body} rows={6} maxLength={3000} required placeholder="Qu'avez-vous aimé ou moins aimé ? Comment l'utilisez-vous ?" className={input} />
      </label>
      <SubmitButton pendingText="Publication…" className="rounded-full bg-brand px-6 py-2 font-medium text-brand-ink">
        Publier
      </SubmitButton>
    </form>
  );
}
