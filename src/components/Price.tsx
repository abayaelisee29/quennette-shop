import { getI18n } from "@/lib/i18n/server";
import { discountPercent, type Product } from "@/lib/products";

export async function Price({ product, size = "md" }: { product: Product; size?: "md" | "lg" }) {
  const { lang, t, fmt } = await getI18n();
  const sep = lang === "fr" ? "," : ".";
  const [int, dec] = fmt.price(product.price).split(sep);
  const off = discountPercent(product);
  return (
    <div className="flex flex-wrap items-baseline gap-x-2">
      {off > 0 && <span className={`font-medium text-deal ${size === "lg" ? "text-2xl" : "text-sm"}`}>-{off}%</span>}
      <span className={`font-medium text-ink ${size === "lg" ? "text-3xl" : "text-xl"}`}>
        {int}
        {dec && <sup className="text-[0.55em]">{dec}</sup>}
      </span>
      {product.listPrice && (
        <span className="text-xs text-muted">
          {t.price.listPrice} <s>{fmt.price(product.listPrice)}</s>
        </span>
      )}
    </div>
  );
}
