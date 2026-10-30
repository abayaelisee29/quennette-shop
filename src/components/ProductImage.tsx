import type { Product } from "@/lib/catalog";

// Visuel de remplacement en attendant de vraies photos produits (étape 3 : upload par les vendeurs).
export function ProductImage({ product, className = "", variant = 0 }: { product: Product; className?: string; variant?: number }) {
  const h = (product.hue + variant * 40) % 360;
  return (
    <div
      className={`grid aspect-square place-items-center overflow-hidden rounded-card ${className}`}
      style={{ background: `radial-gradient(circle at 30% 25%, hsl(${h} 70% 94%), hsl(${h} 45% 82%))` }}
      role="img"
      aria-label={product.title}
    >
      <span className="select-none text-[clamp(2.5rem,40cqw,7rem)] drop-shadow-md" style={{ transform: `rotate(${variant * 8 - 8}deg)` }}>
        {product.emoji}
      </span>
    </div>
  );
}
