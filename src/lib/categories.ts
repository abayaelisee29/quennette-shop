// Catégories du catalogue. Fichier sans dépendance serveur : utilisable partout, y compris côté navigateur.

export type Category = {
  slug: string;
  name: string;
  emoji: string;
  description: string;
};

export const categories: Category[] = [
  { slug: "electronique", name: "Électronique", emoji: "🎧", description: "Audio, téléphones, accessoires et objets connectés." },
  { slug: "informatique", name: "Informatique", emoji: "💻", description: "Ordinateurs, périphériques et stockage." },
  { slug: "maison", name: "Maison & Cuisine", emoji: "🏠", description: "Électroménager, ustensiles et décoration." },
  { slug: "mode", name: "Mode", emoji: "👗", description: "Vêtements, chaussures et accessoires." },
  { slug: "beaute", name: "Beauté & Santé", emoji: "💄", description: "Soins, maquillage et bien-être." },
  { slug: "sport", name: "Sport & Loisirs", emoji: "⚽", description: "Fitness, plein air et équipements." },
  { slug: "livres", name: "Livres", emoji: "📚", description: "Romans, BD, jeunesse et pratique." },
  { slug: "jouets", name: "Jouets & Enfants", emoji: "🧸", description: "Jeux, éveil et puériculture." },
];

export function getCategory(slug: string) {
  return categories.find((c) => c.slug === slug);
}
