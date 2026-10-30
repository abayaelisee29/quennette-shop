"use client";

import { useEffect, useRef, useState } from "react";
import { THEME_STORAGE_KEY, themes, defaultTheme } from "@/lib/themes";

export function ThemeSwitcher() {
  const [open, setOpen] = useState(false);
  const [current, setCurrent] = useState<string>(defaultTheme);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setCurrent(document.documentElement.dataset.theme ?? defaultTheme);
    const close = (e: MouseEvent) => {
      if (!ref.current?.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("click", close);
    return () => document.removeEventListener("click", close);
  }, []);

  function choose(id: string) {
    document.documentElement.dataset.theme = id;
    try {
      localStorage.setItem(THEME_STORAGE_KEY, id);
    } catch {}
    setCurrent(id);
    setOpen(false);
  }

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen((o) => !o)}
        aria-expanded={open}
        className="flex flex-col items-start rounded px-2 py-1 text-left leading-tight hover:outline hover:outline-1 hover:outline-header-ink/40"
      >
        <span className="text-xs opacity-80">Thème</span>
        <span className="text-sm font-bold">{themes.find((t) => t.id === current)?.name ?? "Reine"} ▾</span>
      </button>
      {open && (
        <ul className="absolute right-0 z-50 mt-2 w-44 overflow-hidden rounded-card border border-line bg-surface py-1 text-ink shadow-xl">
          {themes.map((t) => (
            <li key={t.id}>
              <button onClick={() => choose(t.id)} className="flex w-full items-center gap-2 px-3 py-2 text-sm hover:bg-surface-2">
                <span className="flex">
                  {t.swatch.map((c) => (
                    <span key={c} className="h-4 w-4 rounded-full border border-white/40 first:mr-[-4px]" style={{ background: c }} />
                  ))}
                </span>
                <span className={t.id === current ? "font-bold" : ""}>{t.name}</span>
                {t.id === current && <span className="ml-auto text-ok">✓</span>}
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
