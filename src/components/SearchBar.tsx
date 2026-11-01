"use client";

import { useSearchParams } from "next/navigation";
import { getCategories } from "@/lib/categories";
import { useI18n } from "./I18nProvider";

// Formulaire GET classique : fonctionne même sans JavaScript.
export function SearchBar() {
  const sp = useSearchParams();
  const { lang, t } = useI18n();
  return (
    <form action="/search" role="search" className="flex h-11 w-full overflow-hidden rounded-card border border-line bg-surface ring-brand focus-within:ring-3">
      <select
        name="cat"
        defaultValue={sp.get("cat") ?? ""}
        aria-label={t.header.category}
        className="hidden max-w-40 cursor-pointer border-r border-line bg-surface-2 px-2 text-sm text-ink outline-none sm:block"
      >
        <option value="">{t.header.searchAll}</option>
        {getCategories(lang).map((c) => (
          <option key={c.slug} value={c.slug}>
            {c.name}
          </option>
        ))}
      </select>
      <input
        name="q"
        key={sp.get("q") ?? ""}
        defaultValue={sp.get("q") ?? ""}
        placeholder={t.header.searchPlaceholder}
        aria-label={t.header.searchLabel}
        className="min-w-0 flex-1 bg-surface px-3 text-ink outline-none placeholder:text-muted"
      />
      <button type="submit" aria-label={t.header.searchSubmit} className="grid w-12 place-items-center bg-brand text-brand-ink hover:brightness-95">
        <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
          <circle cx="11" cy="11" r="7" />
          <path d="m20 20-3.5-3.5" />
        </svg>
      </button>
    </form>
  );
}
