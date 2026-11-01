import { toggleWishlistAction } from "@/app/actions/cart";
import { getI18n } from "@/lib/i18n/server";

export async function WishlistButton({ productId, active, back, className = "" }: { productId: string; active: boolean; back: string; className?: string }) {
  const { t } = await getI18n();
  return (
    <form action={toggleWishlistAction}>
      <input type="hidden" name="productId" value={productId} />
      <input type="hidden" name="back" value={back} />
      <button className={`w-full rounded-card border border-line py-1.5 text-sm hover:bg-surface-2 ${className}`} aria-pressed={active}>
        {active ? <span className="text-deal">{t.product.wishlistIn}</span> : t.product.wishlistAdd}
      </button>
    </form>
  );
}
