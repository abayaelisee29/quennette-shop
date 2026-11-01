import { fill } from "@/lib/i18n";
import { getI18n } from "@/lib/i18n/server";

export async function OrderSummary({ subtotal, shipping, total, count }: { subtotal: number; shipping: number; total: number; count: number }) {
  const { t, fmt } = await getI18n();
  const c = t.checkout;
  return (
    <div className="rounded-card border border-line bg-surface p-5 text-sm">
      <h2 className="mb-3 text-lg font-bold">{c.summary}</h2>
      <dl className="space-y-1">
        <div className="flex justify-between">
          <dt>{fill(c.itemsCount, { n: count })}</dt>
          <dd>{fmt.price(subtotal)}</dd>
        </div>
        <div className="flex justify-between">
          <dt>{c.shippingLabel}</dt>
          <dd>{shipping ? fmt.price(shipping) : c.free}</dd>
        </div>
        <div className="mt-2 flex justify-between border-t border-line pt-2 text-lg font-bold text-deal">
          <dt>{c.total}</dt>
          <dd>{fmt.price(total)}</dd>
        </div>
      </dl>
      <p className="mt-2 text-xs text-muted">{c.currencyNote}</p>
    </div>
  );
}
