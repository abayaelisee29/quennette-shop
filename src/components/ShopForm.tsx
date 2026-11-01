"use client";

import { useActionState } from "react";
import { createShopAction, updateShopAction, type SellerFormState } from "@/app/actions/seller";
import { useI18n } from "./I18nProvider";
import { SubmitButton } from "./SubmitButton";

const input = "mt-1 w-full rounded-card border border-line bg-surface px-3 py-2 font-normal outline-none focus:border-accent focus:ring-2 focus:ring-accent/30";

export function ShopForm({ mode, defaults }: { mode: "create" | "edit"; defaults?: { name: string; description: string } }) {
  const { t } = useI18n();
  const f = t.seller.shopForm;
  const [state, action] = useActionState<SellerFormState, FormData>(mode === "create" ? createShopAction : updateShopAction, {});
  const v = { ...defaults, ...state.values };
  return (
    <form action={action} className="space-y-4">
      {state.error && <p role="alert" className="rounded-card border border-deal/40 bg-deal/10 px-3 py-2 text-sm text-deal">{state.error}</p>}
      {state.values?.saved && <p className="rounded-card border border-ok/40 bg-ok/10 px-3 py-2 text-sm text-ok">{f.saved}</p>}
      <label className="block text-sm font-bold">
        {f.name}
        <input name="name" defaultValue={v.name} required maxLength={40} className={input} />
      </label>
      <label className="block text-sm font-bold">
        {f.about} <span className="font-normal text-muted">{f.aboutHint}</span>
        <textarea name="description" defaultValue={v.description} rows={3} maxLength={500} className={input} />
      </label>
      <SubmitButton className="rounded-full bg-brand px-6 py-2 font-medium text-brand-ink">{mode === "create" ? f.create : f.save}</SubmitButton>
    </form>
  );
}
