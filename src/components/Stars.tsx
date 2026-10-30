export function Stars({ rating, count, size = "sm" }: { rating: number; count?: number; size?: "sm" | "md" }) {
  const pct = (rating / 5) * 100;
  return (
    <span className={`relative inline-flex items-center gap-1 ${size === "md" ? "text-base" : "text-sm"}`} title={`${rating.toLocaleString("fr-FR")} sur 5`}>
      <span className="relative inline-block leading-none tracking-tight text-line" aria-hidden>
        ★★★★★
        <span className="absolute inset-0 overflow-hidden text-star" style={{ width: `${pct}%` }}>
          ★★★★★
        </span>
      </span>
      <span className="sr-only">{rating} sur 5 étoiles</span>
      {count !== undefined && <span className="text-link">{count.toLocaleString("fr-FR")}</span>}
    </span>
  );
}
