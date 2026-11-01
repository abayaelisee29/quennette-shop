import Link from "next/link";
import { getI18n } from "@/lib/i18n/server";
import type { Product } from "@/lib/products";
import { Price } from "./Price";
import { ProductImage } from "./ProductImage";
import { Stars } from "./Stars";

export async function ProductCard({ product, compact = false }: { product: Product; compact?: boolean }) {
  const { t } = await getI18n();
  const c = t.card;
  return (
    <Link href={`/product/${product.id}`} className="group relative flex h-full flex-col rounded-card border border-line bg-surface p-3 transition hover:shadow-lg">
      <div className="relative [container-type:inline-size]">
        <ProductImage product={product} className="transition group-hover:scale-[1.02]" />
        {product.listPrice && <span className="absolute top-2 left-2 rounded bg-deal px-2 py-0.5 text-xs font-bold text-white">{c.deal}</span>}
      </div>
      <div className="mt-3 flex flex-1 flex-col gap-1">
        <h3 className={`line-clamp-2 text-ink group-hover:text-link ${compact ? "text-sm" : "text-[15px]"}`}>{product.title}</h3>
        {!compact && <span className="text-xs text-muted">{product.brand}</span>}
        {product.reviewCount > 0 ? <Stars rating={product.rating} count={product.reviewCount} /> : <span className="text-xs font-bold text-accent">{c.new}</span>}
        <Price product={product} />
        {!compact && (
          <div className="mt-auto pt-1 text-xs">
            {product.stock === 0 ? (
              <span className="text-deal">{c.unavailable}</span>
            ) : product.fastDelivery ? (
              <span className="text-ok">
                <b>{c.express}</b> {c.tomorrow}
              </span>
            ) : (
              <span className="text-muted">{c.standard}</span>
            )}
          </div>
        )}
      </div>
    </Link>
  );
}
