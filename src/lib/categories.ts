// Catégories du catalogue. Fichier sans dépendance serveur : utilisable partout, y compris côté navigateur.
import type { Lang } from "./i18n";

type Text = { name: string; description: string };

export type CategoryDef = { slug: string; emoji: string; idPrefix: string; en: Text; fr: Text };
export type Category = { slug: string; emoji: string; name: string; description: string };

export const categoryDefs: CategoryDef[] = [
  { slug: "electronics", emoji: "🎧", idPrefix: "ele", en: { name: "Electronics", description: "Audio, phones, accessories and smart devices." }, fr: { name: "Électronique", description: "Audio, téléphones, accessoires et objets connectés." } },
  { slug: "computers", emoji: "💻", idPrefix: "inf", en: { name: "Computers", description: "Laptops, monitors, peripherals and storage." }, fr: { name: "Informatique", description: "Ordinateurs, périphériques et stockage." } },
  { slug: "home", emoji: "🏠", idPrefix: "mai", en: { name: "Home & Kitchen", description: "Appliances, cookware and home decor." }, fr: { name: "Maison & Cuisine", description: "Électroménager, ustensiles et décoration." } },
  { slug: "fashion", emoji: "👗", idPrefix: "mod", en: { name: "Fashion", description: "Clothing, shoes and accessories." }, fr: { name: "Mode", description: "Vêtements, chaussures et accessoires." } },
  { slug: "beauty", emoji: "💄", idPrefix: "bea", en: { name: "Beauty & Health", description: "Skincare, makeup and wellness." }, fr: { name: "Beauté & Santé", description: "Soins, maquillage et bien-être." } },
  { slug: "sports", emoji: "⚽", idPrefix: "spo", en: { name: "Sports & Outdoors", description: "Fitness, outdoor gear and equipment." }, fr: { name: "Sport & Loisirs", description: "Fitness, plein air et équipements." } },
  { slug: "books", emoji: "📚", idPrefix: "liv", en: { name: "Books", description: "Novels, comics, kids' books and how-to guides." }, fr: { name: "Livres", description: "Romans, BD, jeunesse et pratique." } },
  { slug: "toys", emoji: "🧸", idPrefix: "jou", en: { name: "Toys & Kids", description: "Games, early learning and baby gear." }, fr: { name: "Jouets & Enfants", description: "Jeux, éveil et puériculture." } },
];

// Anciennes adresses françaises des catégories (avant le passage à l'anglais).
export const legacyCategorySlugs: Record<string, string> = {
  electronique: "electronics",
  informatique: "computers",
  maison: "home",
  mode: "fashion",
  beaute: "beauty",
  sport: "sports",
  livres: "books",
  jouets: "toys",
};

export function getCategories(lang: Lang): Category[] {
  return categoryDefs.map((c) => ({ slug: c.slug, emoji: c.emoji, ...c[lang] }));
}

export function getCategory(slug: string, lang: Lang): Category | undefined {
  return getCategories(lang).find((c) => c.slug === slug);
}

export function isCategory(slug: string) {
  return categoryDefs.some((c) => c.slug === slug);
}
