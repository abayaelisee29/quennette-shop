import Link from "next/link";
import { shop } from "@/lib/config";

export function Logo() {
  return (
    <Link href="/" className="flex shrink-0 items-center gap-1.5 rounded px-1 py-1 outline-offset-2 hover:outline hover:outline-1 hover:outline-header-ink/40">
      <svg viewBox="0 0 32 32" className="h-8 w-8" aria-hidden>
        <path d="M4 22 6 9l6 6 4-9 4 9 6-6 2 13z" fill="var(--brand)" />
        <rect x="4" y="23.5" width="24" height="3.5" rx="1.5" fill="var(--brand)" />
      </svg>
      <span className="font-display text-2xl font-bold tracking-tight text-header-ink">
        {shop.name}
        <span className="text-brand">.</span>
      </span>
    </Link>
  );
}
