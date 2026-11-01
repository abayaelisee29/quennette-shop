"use client";

import Link from "next/link";
import { useActionState } from "react";
import { signIn, signUp, type FormState } from "@/app/actions/auth";
import { useI18n } from "./I18nProvider";
import { SubmitButton } from "./SubmitButton";

const input = "w-full rounded-card border border-line bg-surface px-3 py-2 outline-none focus:border-accent focus:ring-2 focus:ring-accent/30";

export function AuthForm({ mode, next }: { mode: "signin" | "signup"; next?: string }) {
  const { t } = useI18n();
  const a = t.auth;
  const [state, action] = useActionState<FormState, FormData>(mode === "signin" ? signIn : signUp, {});
  const v = state.values ?? {};
  const q = next ? `?next=${encodeURIComponent(next)}` : "";
  return (
    <div className="mx-auto w-full max-w-sm px-4 py-10">
      <div className="rounded-card border border-line bg-surface p-6">
        <h1 className="mb-4 text-2xl font-medium">{mode === "signin" ? a.signInTitle : a.signUpTitle}</h1>
        {state.error && (
          <p role="alert" className="mb-4 rounded-card border border-deal/40 bg-deal/10 px-3 py-2 text-sm text-deal">
            {state.error}
          </p>
        )}
        <form action={action} className="space-y-3">
          {next && <input type="hidden" name="next" value={next} />}
          {mode === "signup" && (
            <label className="block text-sm font-bold">
              {a.name}
              <input name="name" defaultValue={v.name} autoComplete="name" required className={`mt-1 font-normal ${input}`} />
            </label>
          )}
          <label className="block text-sm font-bold">
            {a.email}
            <input name="email" type="email" defaultValue={v.email} autoComplete="email" required className={`mt-1 font-normal ${input}`} />
          </label>
          <label className="block text-sm font-bold">
            {a.password}
            <input
              name="password"
              type="password"
              autoComplete={mode === "signin" ? "current-password" : "new-password"}
              minLength={mode === "signup" ? 8 : undefined}
              required
              className={`mt-1 font-normal ${input}`}
            />
            {mode === "signup" && <span className="mt-1 block text-xs font-normal text-muted">{a.passwordHint}</span>}
          </label>
          {mode === "signup" && (
            <label className="block text-sm font-bold">
              {a.confirm}
              <input name="confirm" type="password" autoComplete="new-password" required className={`mt-1 font-normal ${input}`} />
            </label>
          )}
          <SubmitButton className="w-full rounded-full bg-brand py-2 font-medium text-brand-ink">
            {mode === "signin" ? a.continue : a.create}
          </SubmitButton>
        </form>
      </div>
      {mode === "signin" ? (
        <div className="mt-6 text-center">
          <p className="mb-2 text-sm text-muted">{a.newCustomer}</p>
          <Link href={`/signup${q}`} className="block rounded-full border border-line bg-surface py-2 text-sm hover:bg-surface-2">
            {a.create}
          </Link>
        </div>
      ) : (
        <p className="mt-6 text-center text-sm">
          {a.haveAccount}{" "}
          <Link href={`/signin${q}`} className="text-link hover:underline">
            {a.signInLink}
          </Link>
        </p>
      )}
    </div>
  );
}
