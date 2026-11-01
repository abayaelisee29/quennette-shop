import Link from "next/link";
import { addManyToCart } from "@/app/actions/cart";
import { fill } from "@/lib/i18n";
import { getI18n } from "@/lib/i18n/server";
import type { Product } from "@/lib/products";
import { ProductImage } from "./ProductImage";
import { SubmitButton } from "./SubmitButton";

export async function BoughtTogether({ product, others }: { product: Product; others: Product[] }) {
  if (!others.length || product.stock === 0) return null;
  const { t, fmt } = await getI18n();
  const g = t.together;
  const all = [product, ...others];
  const total = all.reduce((s, p) => s + p.price, 0);
  return (
    <section className="rounded-card border border-line p-5">
      <h2 className="mb-4 text-xl font-bold">{g.title}</h2>
      <div className="flex flex-wrap items-center gap-6">
        <div className="flex items-center gap-2">
          {all.map((p, i) => (
            <div key={p.id} className="flex items-center gap-2">
              {i > 0 && <span className="text-2xl text-muted">+</span>}
              <Link href={`/product/${p.id}`} className="w-24 [container-type:inline-size] sm:w-32">
                <ProductImage product={p} />
              </Link>
            </div>
          ))}
        </div>
        <form action={addManyToCart} className="space-y-2">
          {all.map((p) => (
            <input key={p.id} type="hidden" name="productId" value={p.id} />
          ))}
          <p className="text-lg">
            {g.total} <b>{fmt.price(total)}</b>
          </p>
          <SubmitButton pendingText={t.product.adding} className="rounded-full bg-brand px-5 py-2 text-sm font-medium text-brand-ink">
            {fill(g.addAll, { n: all.length })}
          </SubmitButton>
        </form>
      </div>
      <ul className="mt-4 space-y-1 text-sm">
        {all.map((p, i) => (
          <li key={p.id}>
            {i === 0 ? <b>{g.thisItem} </b> : null}
            <Link href={`/product/${p.id}`} className={i ? "text-link hover:underline" : ""}>
              {p.title}
            </Link>{" "}
            <b>{fmt.price(p.price)}</b>
          </li>
        ))}
      </ul>
    </section>
  );
}
