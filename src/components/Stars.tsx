import { fill } from "@/lib/i18n";
import { getI18n } from "@/lib/i18n/server";

export async function Stars({ rating, count, size = "sm" }: { rating: number; count?: number; size?: "sm" | "md" }) {
  const { t, fmt } = await getI18n();
  const pct = (rating / 5) * 100;
  const label = fill(t.stars.outOf, { r: fmt.number(rating) });
  return (
    <span className={`relative inline-flex items-center gap-1 ${size === "md" ? "text-base" : "text-sm"}`} title={label}>
      <span className="relative inline-block leading-none tracking-tight text-line" aria-hidden>
        ★★★★★
        <span className="absolute inset-0 overflow-hidden text-star" style={{ width: `${pct}%` }}>
          ★★★★★
        </span>
      </span>
      <span className="sr-only">{label}</span>
      {count !== undefined && <span className="text-link">{fmt.number(count)}</span>}
    </span>
  );
}
