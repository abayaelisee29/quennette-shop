"use client";

import Link from "next/link";
import { useActionState } from "react";
import { signIn, signUp, type FormState } from "@/app/actions/auth";
import { SubmitButton } from "./SubmitButton";

const input = "w-full rounded-card border border-line bg-surface px-3 py-2 outline-none focus:border-accent focus:ring-2 focus:ring-accent/30";

export function AuthForm({ mode, suite }: { mode: "connexion" | "inscription"; suite?: string }) {
  const [state, action] = useActionState<FormState, FormData>(mode === "connexion" ? signIn : signUp, {});
  const v = state.values ?? {};
  const q = suite ? `?suite=${encodeURIComponent(suite)}` : "";
  return (
    <div className="mx-auto w-full max-w-sm px-4 py-10">
      <div className="rounded-card border border-line bg-surface p-6">
        <h1 className="mb-4 text-2xl font-medium">{mode === "connexion" ? "S'identifier" : "Créer un compte"}</h1>
        {state.error && (
          <p role="alert" className="mb-4 rounded-card border border-deal/40 bg-deal/10 px-3 py-2 text-sm text-deal">
            {state.error}
          </p>
        )}
        <form action={action} className="space-y-3">
          {suite && <input type="hidden" name="suite" value={suite} />}
          {mode === "inscription" && (
            <label className="block text-sm font-bold">
              Votre nom
              <input name="name" defaultValue={v.name} autoComplete="name" required className={`mt-1 font-normal ${input}`} />
            </label>
          )}
          <label className="block text-sm font-bold">
            Adresse e-mail
            <input name="email" type="email" defaultValue={v.email} autoComplete="email" required className={`mt-1 font-normal ${input}`} />
          </label>
          <label className="block text-sm font-bold">
            Mot de passe
            <input
              name="password"
              type="password"
              autoComplete={mode === "connexion" ? "current-password" : "new-password"}
              minLength={mode === "inscription" ? 8 : undefined}
              required
              className={`mt-1 font-normal ${input}`}
            />
            {mode === "inscription" && <span className="mt-1 block text-xs font-normal text-muted">Au moins 8 caractères.</span>}
          </label>
          {mode === "inscription" && (
            <label className="block text-sm font-bold">
              Confirmez le mot de passe
              <input name="confirm" type="password" autoComplete="new-password" required className={`mt-1 font-normal ${input}`} />
            </label>
          )}
          <SubmitButton className="w-full rounded-full bg-brand py-2 font-medium text-brand-ink">
            {mode === "connexion" ? "Continuer" : "Créer votre compte"}
          </SubmitButton>
        </form>
      </div>
      {mode === "connexion" ? (
        <div className="mt-6 text-center">
          <p className="mb-2 text-sm text-muted">Nouveau client ?</p>
          <Link href={`/inscription${q}`} className="block rounded-full border border-line bg-surface py-2 text-sm hover:bg-surface-2">
            Créer votre compte
          </Link>
        </div>
      ) : (
        <p className="mt-6 text-center text-sm">
          Vous avez déjà un compte ?{" "}
          <Link href={`/connexion${q}`} className="text-link hover:underline">
            Identifiez-vous
          </Link>
        </p>
      )}
    </div>
  );
}
