import { setLanguage } from "@/app/actions/lang";
import { LANGS, type Dict, type Lang } from "@/lib/i18n";

// Bouton EN / FR. Simple formulaire : marche aussi sans JavaScript. Le choix est gardé dans un cookie.
export function LanguageSwitcher({ lang, t }: { lang: Lang; t: Dict }) {
  return (
    <form action={setLanguage} className="flex flex-col items-start rounded px-2 py-1 leading-tight" aria-label={t.lang.label}>
      <span className="text-xs opacity-80">🌐 {t.lang.label}</span>
      <span className="flex text-sm font-bold">
        {LANGS.map((l, i) => (
          <span key={l} className="flex">
            {i > 0 && <span className="px-1 opacity-50">|</span>}
            <button
              type="submit"
              name="lang"
              value={l}
              lang={l}
              title={t.lang[l]}
              aria-pressed={l === lang}
              className={l === lang ? "text-brand underline underline-offset-4" : "opacity-80 hover:opacity-100 hover:underline"}
            >
              {l.toUpperCase()}
            </button>
          </span>
        ))}
      </span>
    </form>
  );
}
