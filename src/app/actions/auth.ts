"use server";

import { redirect } from "next/navigation";
import { endSession, hashPassword, newId, safeReturnPath, startSession, verifyPassword } from "@/lib/auth";
import { createUser, findUserByEmail } from "@/lib/db";

export type FormState = { error?: string; values?: Record<string, string> };

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export async function signUp(_: FormState, form: FormData): Promise<FormState> {
  const name = String(form.get("name") ?? "").trim();
  const email = String(form.get("email") ?? "").trim().toLowerCase();
  const password = String(form.get("password") ?? "");
  const confirm = String(form.get("confirm") ?? "");
  const values = { name, email };

  if (name.length < 2) return { error: "Indiquez votre nom.", values };
  if (!EMAIL_RE.test(email)) return { error: "Adresse e-mail invalide.", values };
  if (password.length < 8) return { error: "Le mot de passe doit contenir au moins 8 caractères.", values };
  if (password !== confirm) return { error: "Les deux mots de passe ne correspondent pas.", values };
  if (await findUserByEmail(email)) return { error: "Un compte existe déjà avec cette adresse. Connectez-vous.", values };

  const user = await createUser({ id: newId("usr"), name, email, passwordHash: await hashPassword(password) });
  await startSession(user.id);
  redirect(safeReturnPath(form.get("suite"), "/compte"));
}

export async function signIn(_: FormState, form: FormData): Promise<FormState> {
  const email = String(form.get("email") ?? "").trim().toLowerCase();
  const password = String(form.get("password") ?? "");
  const user = await findUserByEmail(email);
  if (!user || !(await verifyPassword(password, user.passwordHash))) {
    return { error: "E-mail ou mot de passe incorrect.", values: { email } };
  }
  await startSession(user.id);
  redirect(safeReturnPath(form.get("suite"), "/"));
}

export async function signOut() {
  await endSession();
  redirect("/");
}
