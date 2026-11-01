"use client";

import { useActionState, useState } from "react";
import { saveProductAction, type SellerFormState } from "@/app/actions/seller";
import type { Category } from "@/lib/categories";
import type { Product } from "@/lib/products";
import { useI18n } from "./I18nProvider";
import { SubmitButton } from "./SubmitButton";

const input = "mt-1 w-full rounded-card border border-line bg-surface px-3 py-2 font-normal outline-none focus:border-accent focus:ring-2 focus:ring-accent/30";
const label = "block text-sm font-bold";

export function ProductForm({ product, categories }: { product?: Product; categories: Category[] }) {
  const { t } = useI18n();
  const f = t.seller.form;
  const [state, action] = useActionState<SellerFormState, FormData>(saveProductAction, {});
  const [preview, setPreview] = useState<string | undefined>(product?.imageUrl);
  const v: Record<string, string> = state.values ?? {
    title: product?.title ?? "",
    brand: product?.brand ?? "",
    category: product?.category ?? "",
    price: product?.price?.toString() ?? "",
    listPrice: product?.listPrice?.toString() ?? "",
    stock: product?.stock?.toString() ?? "10",
    emoji: product?.emoji ?? "",
    description: product?.description ?? "",
    features: product?.features.join("\n") ?? "",
    status: product?.status ?? "actif",
    fastDelivery: product?.fastDelivery ? "1" : "",
  };

  return (
    // key : remet les champs à jour si le serveur renvoie une erreur avec les valeurs saisies
    <form action={action} key={JSON.stringify(state)} className="grid gap-6 lg:grid-cols-[1fr_320px]">
      {product && <input type="hidden" name="id" value={product.id} />}
      <div className="space-y-5">
        {state.error && (
          <p role="alert" className="rounded-card border border-deal/40 bg-deal/10 px-3 py-2 text-sm text-deal">
            {state.error}
          </p>
        )}
        <section className="space-y-4 rounded-card border border-line bg-surface p-5">
          <h2 className="font-bold">{f.info}</h2>
          <label className={label}>
            {f.title}
            <input name="title" defaultValue={v.title} required maxLength={120} className={input} placeholder={f.titlePh} />
          </label>
          <div className="grid gap-4 sm:grid-cols-2">
            <label className={label}>
              {f.brand}
              <input name="brand" defaultValue={v.brand} required maxLength={40} className={input} />
            </label>
            <label className={label}>
              {f.category}
              <select name="category" defaultValue={v.category} required className={input}>
                <option value="">{f.choose}</option>
                {categories.map((c) => (
                  <option key={c.slug} value={c.slug}>
                    {c.emoji} {c.name}
                  </option>
                ))}
              </select>
            </label>
          </div>
          <label className={label}>
            {f.description}
            <textarea name="description" defaultValue={v.description} rows={4} maxLength={2000} className={input} />
          </label>
          <label className={label}>
            {f.features} <span className="font-normal text-muted">{f.featuresHint}</span>
            <textarea name="features" defaultValue={v.features} rows={4} className={input} placeholder={f.featuresPh} />
          </label>
        </section>

        <section className="grid gap-4 rounded-card border border-line bg-surface p-5 sm:grid-cols-3">
          <h2 className="font-bold sm:col-span-3">{f.pricing}</h2>
          <label className={label}>
            {f.price}
            <input name="price" defaultValue={v.price} required inputMode="decimal" className={input} />
          </label>
          <label className={label}>
            {f.listPrice} <span className="font-normal text-muted">{f.optional}</span>
            <input name="listPrice" defaultValue={v.listPrice} inputMode="decimal" className={input} />
          </label>
          <label className={label}>
            {f.stock}
            <input name="stock" type="number" min={0} defaultValue={v.stock} required className={input} />
          </label>
          <label className="flex items-center gap-2 text-sm sm:col-span-3">
            <input type="checkbox" name="fastDelivery" defaultChecked={!!v.fastDelivery} className="h-4 w-4 accent-[var(--accent)]" />
            {f.fast}
          </label>
        </section>
      </div>

      <aside className="space-y-5">
        <section className="space-y-3 rounded-card border border-line bg-surface p-5">
          <h2 className="font-bold">{f.photo}</h2>
          <div className="grid aspect-square place-items-center overflow-hidden rounded-card border border-dashed border-line bg-surface-2">
            {preview ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={preview} alt="" className="h-full w-full object-contain" />
            ) : (
              <span className="text-6xl">{v.emoji || "🖼️"}</span>
            )}
          </div>
          <input
            type="file"
            name="image"
            accept="image/jpeg,image/png,image/webp,image/gif"
            onChange={(e) => {
              const f = e.target.files?.[0];
              setPreview(f ? URL.createObjectURL(f) : product?.imageUrl);
            }}
            className="w-full text-sm file:mr-2 file:rounded-full file:border-0 file:bg-surface-2 file:px-3 file:py-1"
          />
          <p className="text-xs text-muted">{f.photoHint}</p>
          {product?.imageUrl && (
            <label className="flex items-center gap-2 text-sm">
              <input type="checkbox" name="removeImage" /> {f.removePhoto}
            </label>
          )}
          <label className={label}>
            {f.emoji} <span className="font-normal text-muted">{f.emojiHint}</span>
            <input name="emoji" defaultValue={v.emoji} maxLength={4} className={input} placeholder="👗" />
          </label>
        </section>
        <section className="space-y-3 rounded-card border border-line bg-surface p-5">
          <h2 className="font-bold">{f.publishing}</h2>
          <label className="flex items-center gap-2 text-sm">
            <input type="radio" name="status" value="actif" defaultChecked={v.status !== "brouillon"} /> {f.forSale}
          </label>
          <label className="flex items-center gap-2 text-sm">
            <input type="radio" name="status" value="brouillon" defaultChecked={v.status === "brouillon"} /> {f.draft}
          </label>
          <SubmitButton pendingText={f.saving} className="w-full rounded-full bg-brand py-2 font-medium text-brand-ink">
            {product ? f.save : f.publish}
          </SubmitButton>
        </section>
      </aside>
    </form>
  );
}
