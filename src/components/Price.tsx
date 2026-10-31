import { discountPercent, type Product } from "@/lib/products";
import { formatPrice } from "@/lib/config";

export function Price({ product, size = "md" }: { product: Product; size?: "md" | "lg" }) {
  const [int, dec] = formatPrice(product.price).split(",");
  const off = discountPercent(product);
  return (
    <div className="flex flex-wrap items-baseline gap-x-2">
      {off > 0 && <span className={`font-medium text-deal ${size === "lg" ? "text-2xl" : "text-sm"}`}>-{off}%</span>}
      <span className={`font-medium text-ink ${size === "lg" ? "text-3xl" : "text-xl"}`}>
        {int}
        {dec && <sup className="text-[0.55em]">,{dec}</sup>}
      </span>
      {product.listPrice && (
        <span className="text-xs text-muted">
          Prix conseillé : <s>{formatPrice(product.listPrice)}</s>
        </span>
      )}
    </div>
  );
}
