import "server-only";
import { cookies } from "next/headers";
import { cache } from "react";
import { makeFormatters } from "./format";
import { DEFAULT_LANG, LANG_COOKIE, dictionaries, isLang, type Lang } from "./index";

export { makeFormatters, type Formatters } from "./format";

// Langue de la requête (cookie qs_lang), dictionnaire et formats. Mis en cache pour la requête.
export const getI18n = cache(async () => {
  const v = (await cookies()).get(LANG_COOKIE)?.value;
  const lang: Lang = isLang(v) ? v : DEFAULT_LANG;
  return { lang, t: dictionaries[lang], fmt: makeFormatters(lang) };
});
