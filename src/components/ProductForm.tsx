"use client";

import { useActionState, useState } from "react";
import { saveProductAction, type SellerFormState } from "@/app/actions/seller";
import type { Category } from "@/lib/categories";
import type { Product } from "@/lib/products";
import { SubmitButton } from "./SubmitButton";

const input = "mt-1 w-full rounded-card border border-line bg-surface px-3 py-2 font-normal outline-none focus:border-accent focus:ring-2 focus:ring-accent/30";
const label = "block text-sm font-bold";

export function ProductForm({ product, categories }: { product?: Product; categories: Category[] }) {
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
          <h2 className="font-bold">Informations</h2>
          <label className={label}>
            Titre du produit
            <input name="title" defaultValue={v.title} required maxLength={120} className={input} placeholder="Ex. : Robe en wax coupe portefeuille" />
          </label>
          <div className="grid gap-4 sm:grid-cols-2">
            <label className={label}>
              Marque
              <input name="brand" defaultValue={v.brand} required maxLength={40} className={input} />
            </label>
            <label className={label}>
              Catégorie
              <select name="category" defaultValue={v.category} required className={input}>
                <option value="">Choisir…</option>
                {categories.map((c) => (
                  <option key={c.slug} value={c.slug}>
                    {c.emoji} {c.name}
                  </option>
                ))}
              </select>
            </label>
          </div>
          <label className={label}>
            Description
            <textarea name="description" defaultValue={v.description} rows={4} maxLength={2000} className={input} />
          </label>
          <label className={label}>
            Points forts <span className="font-normal text-muted">(un par ligne)</span>
            <textarea name="features" defaultValue={v.features} rows={4} className={input} placeholder={"100 % coton\nLavable en machine\nTailles S à XL"} />
          </label>
        </section>

        <section className="grid gap-4 rounded-card border border-line bg-surface p-5 sm:grid-cols-3">
          <h2 className="font-bold sm:col-span-3">Prix et stock</h2>
          <label className={label}>
            Prix de vente (€)
            <input name="price" defaultValue={v.price} required inputMode="decimal" className={input} />
          </label>
          <label className={label}>
            Prix barré (€) <span className="font-normal text-muted">optionnel</span>
            <input name="listPrice" defaultValue={v.listPrice} inputMode="decimal" className={input} />
          </label>
          <label className={label}>
            Stock
            <input name="stock" type="number" min={0} defaultValue={v.stock} required className={input} />
          </label>
          <label className="flex items-center gap-2 text-sm sm:col-span-3">
            <input type="checkbox" name="fastDelivery" defaultChecked={!!v.fastDelivery} className="h-4 w-4 accent-[var(--accent)]" />
            Proposer la livraison express
          </label>
        </section>
      </div>

      <aside className="space-y-5">
        <section className="space-y-3 rounded-card border border-line bg-surface p-5">
          <h2 className="font-bold">Photo</h2>
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
          <p className="text-xs text-muted">JPEG, PNG, WebP ou GIF, 3 Mo maximum.</p>
          {product?.imageUrl && (
            <label className="flex items-center gap-2 text-sm">
              <input type="checkbox" name="removeImage" /> Retirer la photo actuelle
            </label>
          )}
          <label className={label}>
            Emoji de remplacement <span className="font-normal text-muted">(sans photo)</span>
            <input name="emoji" defaultValue={v.emoji} maxLength={4} className={input} placeholder="👗" />
          </label>
        </section>
        <section className="space-y-3 rounded-card border border-line bg-surface p-5">
          <h2 className="font-bold">Publication</h2>
          <label className="flex items-center gap-2 text-sm">
            <input type="radio" name="status" value="actif" defaultChecked={v.status !== "brouillon"} /> En vente
          </label>
          <label className="flex items-center gap-2 text-sm">
            <input type="radio" name="status" value="brouillon" defaultChecked={v.status === "brouillon"} /> Brouillon (non visible)
          </label>
          <SubmitButton pendingText="Enregistrement…" className="w-full rounded-full bg-brand py-2 font-medium text-brand-ink">
            {product ? "Enregistrer les modifications" : "Mettre en ligne"}
          </SubmitButton>
        </section>
      </aside>
    </form>
  );
}
