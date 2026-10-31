import type { Product } from "@/lib/products";

// Photo du vendeur si elle existe, sinon visuel de remplacement (emoji sur fond coloré).
export function ProductImage({ product, className = "", variant = 0 }: { product: Product; className?: string; variant?: number }) {
  if (product.imageUrl) {
    return (
      <div className={`aspect-square overflow-hidden rounded-card bg-white ${className}`}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={product.imageUrl} alt={product.title} className="h-full w-full object-contain" style={variant ? { transform: `scale(${1 + variant * 0.15})` } : undefined} />
      </div>
    );
  }
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
