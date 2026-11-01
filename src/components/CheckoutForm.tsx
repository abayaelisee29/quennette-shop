"use client";

import { useActionState } from "react";
import { placeOrder, type CheckoutState } from "@/app/actions/checkout";
import type { Address } from "@/lib/db";
import { useI18n } from "./I18nProvider";
import { SubmitButton } from "./SubmitButton";

const input = "w-full rounded-card border border-line bg-surface px-3 py-2 font-normal outline-none focus:border-accent focus:ring-2 focus:ring-accent/30";

export function CheckoutForm({ defaults, payLabel, children }: { defaults: Partial<Address>; payLabel: string; children?: React.ReactNode }) {
  const { t } = useI18n();
  const c = t.checkout;
  const [state, action] = useActionState<CheckoutState, FormData>(placeOrder, {});
  const v = { ...defaults, ...state.values };
  const field = (name: keyof Address, label: string, opts: { auto?: string; required?: boolean; type?: string } = {}) => (
    <label className="block text-sm font-bold">
      {label}
      {opts.required !== false && <span className="text-deal"> *</span>}
      <input name={name} type={opts.type ?? "text"} defaultValue={v[name]} autoComplete={opts.auto} required={opts.required !== false} className={`mt-1 ${input}`} />
    </label>
  );
  return (
    <form action={action} className="space-y-6">
      <section className="rounded-card border border-line bg-surface p-5">
        <h2 className="mb-4 text-lg font-bold">{c.shippingAddress}</h2>
        {state.error && (
          <p role="alert" className="mb-4 rounded-card border border-deal/40 bg-deal/10 px-3 py-2 text-sm text-deal">
            {state.error}
          </p>
        )}
        <div className="grid gap-3 sm:grid-cols-2">
          <div className="sm:col-span-2">{field("fullName", c.fullName, { auto: "name" })}</div>
          <div className="sm:col-span-2">{field("line1", c.line1, { auto: "address-line1" })}</div>
          <div className="sm:col-span-2">{field("line2", c.line2, { auto: "address-line2", required: false })}</div>
          {field("postalCode", c.postalCode, { auto: "postal-code" })}
          {field("city", c.city, { auto: "address-level2" })}
          {field("country", c.country, { auto: "country-name" })}
          {field("phone", c.phone, { auto: "tel", type: "tel" })}
        </div>
      </section>
      <section className="rounded-card border border-line bg-surface p-5">
        <h2 className="mb-2 text-lg font-bold">{c.payment}</h2>
        {children}
        <SubmitButton pendingText={c.redirecting} className="mt-4 w-full rounded-full bg-brand py-2.5 font-bold text-brand-ink sm:w-auto sm:px-10">
          {payLabel}
        </SubmitButton>
      </section>
    </form>
  );
}
