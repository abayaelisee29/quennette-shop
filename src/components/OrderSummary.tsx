import { formatPrice } from "@/lib/config";

export function OrderSummary({ subtotal, shipping, total, count }: { subtotal: number; shipping: number; total: number; count: number }) {
  return (
    <div className="rounded-card border border-line bg-surface p-5 text-sm">
      <h2 className="mb-3 text-lg font-bold">Récapitulatif</h2>
      <dl className="space-y-1">
        <div className="flex justify-between">
          <dt>Articles ({count}) :</dt>
          <dd>{formatPrice(subtotal)}</dd>
        </div>
        <div className="flex justify-between">
          <dt>Livraison :</dt>
          <dd>{shipping ? formatPrice(shipping) : "Gratuite"}</dd>
        </div>
        <div className="mt-2 flex justify-between border-t border-line pt-2 text-lg font-bold text-deal">
          <dt>Montant total :</dt>
          <dd>{formatPrice(total)}</dd>
        </div>
      </dl>
      <p className="mt-2 text-xs text-muted">TVA incluse</p>
    </div>
  );
}
