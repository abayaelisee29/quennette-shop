// Réglages de la boutique : nom, devise, langue. Modifiez ici pour changer partout.
export const shop = {
  name: "Queennette",
  tagline: "Tout ce qu'il vous faut, livré comme une reine",
  locale: "fr-FR",
  currency: "EUR",
  freeShippingFrom: 35,
};

const fmt = new Intl.NumberFormat(shop.locale, { style: "currency", currency: shop.currency });

export function formatPrice(n: number) {
  return fmt.format(n);
}
