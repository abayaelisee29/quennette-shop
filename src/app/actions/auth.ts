"use server";

import { redirect } from "next/navigation";
import { endSession, hashPassword, newId, safeReturnPath, startSession, verifyPassword } from "@/lib/auth";
import { createUser, findUserByEmail } from "@/lib/db";
import { getI18n } from "@/lib/i18n/server";

export type FormState = { error?: string; values?: Record<string, string> };

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export async function signUp(_: FormState, form: FormData): Promise<FormState> {
  const name = String(form.get("name") ?? "").trim();
  const email = String(form.get("email") ?? "").trim().toLowerCase();
  const password = String(form.get("password") ?? "");
  const confirm = String(form.get("confirm") ?? "");
  const values = { name, email };
  const e = (await getI18n()).t.auth.errors;

  if (name.length < 2) return { error: e.name, values };
  if (!EMAIL_RE.test(email)) return { error: e.email, values };
  if (password.length < 8) return { error: e.passwordLength, values };
  if (password !== confirm) return { error: e.mismatch, values };
  if (await findUserByEmail(email)) return { error: e.exists, values };

  const user = await createUser({ id: newId("usr"), name, email, passwordHash: await hashPassword(password) });
  await startSession(user.id);
  redirect(safeReturnPath(form.get("next"), "/account"));
}

export async function signIn(_: FormState, form: FormData): Promise<FormState> {
  const email = String(form.get("email") ?? "").trim().toLowerCase();
  const password = String(form.get("password") ?? "");
  const user = await findUserByEmail(email);
  if (!user || !(await verifyPassword(password, user.passwordHash))) {
    return { error: (await getI18n()).t.auth.errors.invalid, values: { email } };
  }
  await startSession(user.id);
  redirect(safeReturnPath(form.get("next"), "/"));
}

export async function signOut() {
  await endSession();
  redirect("/");
}
