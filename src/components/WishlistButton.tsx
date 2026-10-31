import { toggleWishlistAction } from "@/app/actions/cart";

export function WishlistButton({ productId, active, back, className = "" }: { productId: string; active: boolean; back: string; className?: string }) {
  return (
    <form action={toggleWishlistAction}>
      <input type="hidden" name="productId" value={productId} />
      <input type="hidden" name="back" value={back} />
      <button className={`w-full rounded-card border border-line py-1.5 text-sm hover:bg-surface-2 ${className}`} aria-pressed={active}>
        {active ? <span className="text-deal">♥ Dans votre liste d&apos;envies</span> : "♡ Ajouter à la liste d'envies"}
      </button>
    </form>
  );
}
