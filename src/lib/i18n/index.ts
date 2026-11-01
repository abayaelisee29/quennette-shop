// Langues du site. L'anglais est la langue par défaut ; le français est proposé dans l'en-tête.
import { en } from "./en";
import { fr } from "./fr";

export const LANGS = ["en", "fr"] as const;
export type Lang = (typeof LANGS)[number];
export const DEFAULT_LANG: Lang = "en";
export const LANG_COOKIE = "qs_lang";

export type Dict = typeof en;
export const dictionaries: Record<Lang, Dict> = { en, fr };
export const locales: Record<Lang, string> = { en: "en-US", fr: "fr-FR" };

export function isLang(v: unknown): v is Lang {
  return typeof v === "string" && (LANGS as readonly string[]).includes(v);
}

// Remplace {nom} par la valeur correspondante : fill("{n} items", { n: 3 }) → "3 items".
export function fill(template: string, vars: Record<string, string | number>) {
  return template.replace(/\{(\w+)\}/g, (_, k) => String(vars[k] ?? `{${k}}`));
}

// Choisit la forme singulier/pluriel puis remplace {n}.
export function plural(n: number, forms: { one: string; other: string }, vars: Record<string, string | number> = {}) {
  return fill(n === 1 ? forms.one : forms.other, { n, ...vars });
}
