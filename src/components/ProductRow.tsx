import Link from "next/link";
import type { Product } from "@/lib/catalog";
import { ProductCard } from "./ProductCard";

export function ProductRow({ title, products, href }: { title: string; products: Product[]; href?: string }) {
  return (
    <section className="rounded-card bg-surface p-4">
      <div className="mb-3 flex items-baseline gap-4">
        <h2 className="text-xl font-bold text-ink">{title}</h2>
        {href && (
          <Link href={href} className="text-sm text-link hover:underline">
            Voir plus
          </Link>
        )}
      </div>
      <div className="no-scrollbar -mx-1 flex snap-x gap-3 overflow-x-auto px-1 pb-1">
        {products.map((p) => (
          <div key={p.id} className="w-44 shrink-0 snap-start sm:w-52">
            <ProductCard product={p} compact />
          </div>
        ))}
      </div>
    </section>
  );
}
