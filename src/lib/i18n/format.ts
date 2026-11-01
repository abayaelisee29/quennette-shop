// Formats des prix, nombres et dates selon la langue. Utilisable côté serveur et navigateur.
import { shop } from "../config";
import { locales, type Lang } from "./index";

export function makeFormatters(lang: Lang) {
  const locale = locales[lang];
  const money = new Intl.NumberFormat(locale, { style: "currency", currency: shop.currency });
  return {
    locale,
    price: (n: number) => money.format(n),
    number: (n: number) => n.toLocaleString(locale),
    date: (d: string | Date, opts: Intl.DateTimeFormatOptions = { day: "numeric", month: "long", year: "numeric" }) =>
      new Date(d).toLocaleDateString(locale, opts),
    dateTime: (d: string | Date, opts: Intl.DateTimeFormatOptions = { dateStyle: "medium", timeStyle: "short" }) =>
      new Date(d).toLocaleString(locale, opts),
  };
}

export type Formatters = ReturnType<typeof makeFormatters>;
