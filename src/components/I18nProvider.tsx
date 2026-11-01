"use client";

import { createContext, useContext, useMemo } from "react";
import type { Dict, Lang } from "@/lib/i18n";
import { makeFormatters } from "@/lib/i18n/format";

const I18nContext = createContext<{ lang: Lang; t: Dict; fmt: ReturnType<typeof makeFormatters> } | null>(null);

// Donne la langue, le dictionnaire et les formats aux composants côté navigateur.
export function I18nProvider({ lang, t, children }: { lang: Lang; t: Dict; children: React.ReactNode }) {
  const value = useMemo(() => ({ lang, t, fmt: makeFormatters(lang) }), [lang, t]);
  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
}

export function useI18n() {
  const ctx = useContext(I18nContext);
  if (!ctx) throw new Error("useI18n doit être utilisé dans I18nProvider");
  return ctx;
}
