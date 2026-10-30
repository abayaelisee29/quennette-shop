// Catalogue d'exemple. À l'étape 2, ces données viendront de la base (Supabase/PostgreSQL).

export type Category = {
  slug: string;
  name: string;
  emoji: string;
  description: string;
};

export type Product = {
  id: string;
  title: string;
  brand: string;
  category: string; // slug de la catégorie
  price: number;
  listPrice?: number; // prix barré si promo
  rating: number; // 0..5
  reviewCount: number;
  stock: number;
  fastDelivery: boolean;
  emoji: string;
  hue: number; // couleur du visuel de remplacement
  description: string;
  features: string[];
  createdAt: string;
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

type Seed = [title: string, brand: string, price: number, emoji: string, features: string[]];

const seeds: Record<string, Seed[]> = {
  electronique: [
    ["Casque sans fil à réduction de bruit", "Sonora", 129.9, "🎧", ["Autonomie 40 h", "Réduction de bruit active", "Bluetooth 5.3"]],
    ["Écouteurs intra-auriculaires True Wireless", "Sonora", 49.9, "🎵", ["Étui de charge", "Résistants à l'eau IPX5", "Micro intégré"]],
    ["Smartphone 6,5\" 128 Go", "Nova", 299, "📱", ["Écran AMOLED", "Triple caméra 50 Mpx", "Batterie 5000 mAh"]],
    ["Montre connectée sport", "Pulse", 89.9, "⌚", ["Suivi cardiaque", "GPS intégré", "Étanche 5 ATM"]],
    ["Enceinte Bluetooth portable", "Sonora", 39.9, "🔊", ["Son 360°", "12 h d'autonomie", "Flottante"]],
    ["Chargeur rapide USB-C 65 W", "Volta", 24.9, "🔌", ["3 ports", "Compatible ordinateurs", "Compact"]],
    ["Batterie externe 20 000 mAh", "Volta", 29.9, "🔋", ["Charge rapide", "2 appareils à la fois", "Écran LED"]],
    ["Caméra de surveillance Wi-Fi", "Vigil", 45, "📷", ["Vision nocturne", "Détection de mouvement", "Audio bidirectionnel"]],
  ],
  informatique: [
    ["Ordinateur portable 15\" 16 Go RAM", "Lumen", 749, "💻", ["SSD 512 Go", "Écran Full HD", "Autonomie 10 h"]],
    ["Souris sans fil ergonomique", "Glide", 19.9, "🖱️", ["Silencieuse", "6 boutons", "Récepteur USB"]],
    ["Clavier mécanique rétroéclairé", "Glide", 69.9, "⌨️", ["Switchs tactiles", "AZERTY", "RGB"]],
    ["Écran 27\" QHD", "Lumen", 259, "🖥️", ["2560×1440", "IPS 75 Hz", "HDMI + DisplayPort"]],
    ["Disque SSD externe 1 To", "Stora", 89, "💾", ["USB-C 10 Gb/s", "Antichoc", "Compatible Mac et PC"]],
    ["Webcam Full HD 1080p", "Vigil", 34.9, "🎥", ["Micro stéréo", "Correction de lumière", "Clip universel"]],
    ["Routeur Wi-Fi 6", "Nexo", 79.9, "📡", ["Double bande", "Couverture 150 m²", "Contrôle parental"]],
    ["Imprimante jet d'encre multifonction", "Printa", 99, "🖨️", ["Wi-Fi", "Scanner", "Recto verso"]],
  ],
  maison: [
    ["Robot cuiseur multifonction", "Cuisio", 199, "🍲", ["10 programmes", "Bol 4,5 L", "Livre de recettes"]],
    ["Cafetière expresso automatique", "Aroma", 249, "☕", ["Broyeur intégré", "Mousseur à lait", "15 bars"]],
    ["Friteuse à air chaud 5,5 L", "Cuisio", 89.9, "🍟", ["Sans huile", "8 modes", "Panier antiadhésif"]],
    ["Aspirateur robot connecté", "Netto", 229, "🤖", ["Cartographie", "Application mobile", "Aspire et lave"]],
    ["Set de 3 poêles antiadhésives", "Cuisio", 54.9, "🍳", ["Tous feux dont induction", "Sans PFOA", "20/24/28 cm"]],
    ["Lampe de chevet tactile", "Lueur", 27.9, "💡", ["3 intensités", "Port USB", "Bois naturel"]],
    ["Parure de lit 240×220 coton", "Doux Nid", 49.9, "🛏️", ["100 % coton", "2 taies incluses", "Lavable 60 °C"]],
    ["Bouilloire électrique en verre", "Aroma", 29.9, "🫖", ["1,7 L", "Arrêt automatique", "LED bleue"]],
  ],
  mode: [
    ["Robe d'été fluide imprimée", "Maison Ama", 39.9, "👗", ["Viscose légère", "Du S au XXL", "Lavable en machine"]],
    ["Baskets légères unisexe", "Foulée", 59.9, "👟", ["Semelle amortissante", "Mesh respirant", "Du 36 au 46"]],
    ["Sac à main en cuir", "Maison Ama", 89, "👜", ["Cuir véritable", "Bandoulière amovible", "3 compartiments"]],
    ["Chemise en lin homme", "Atelier Kofi", 44.9, "👔", ["100 % lin", "Coupe droite", "4 coloris"]],
    ["Jean coupe slim", "Atelier Kofi", 49.9, "👖", ["Denim stretch", "5 poches", "Du 36 au 50"]],
    ["Lunettes de soleil polarisées", "Solis", 29.9, "🕶️", ["UV400", "Étui inclus", "Monture légère"]],
    ["Montre classique bracelet cuir", "Tempo", 79, "⌚", ["Mouvement quartz", "Verre minéral", "Étanche 3 ATM"]],
    ["Écharpe en laine douce", "Maison Ama", 24.9, "🧣", ["Laine mérinos", "180×30 cm", "Unisexe"]],
  ],
  beaute: [
    ["Sérum visage à l'acide hyaluronique", "Éclat", 22.9, "💧", ["30 ml", "Tous types de peau", "Sans parfum"]],
    ["Sèche-cheveux ionique", "Brise", 49.9, "💨", ["2200 W", "3 vitesses", "Diffuseur inclus"]],
    ["Coffret de maquillage", "Éclat", 34.9, "💄", ["24 fards", "Pinceaux inclus", "Miroir"]],
    ["Huile de karité pure", "Terre d'Afrique", 14.9, "🧴", ["100 % naturelle", "Corps et cheveux", "200 ml"]],
    ["Brosse à dents électrique", "Dentia", 39.9, "🪥", ["Minuteur 2 min", "3 modes", "Autonomie 30 jours"]],
    ["Parfum floral 50 ml", "Maison Ama", 59, "🌸", ["Eau de parfum", "Notes de jasmin", "Flacon verre"]],
    ["Lisseur céramique", "Brise", 34.9, "✨", ["Chauffe en 30 s", "230 °C", "Arrêt automatique"]],
    ["Pèse-personne connecté", "Pulse", 29.9, "⚖️", ["13 mesures", "Application", "Jusqu'à 180 kg"]],
  ],
  sport: [
    ["Tapis de yoga antidérapant", "Zenfit", 24.9, "🧘", ["6 mm", "Sangle de transport", "TPE écologique"]],
    ["Haltères réglables 2×10 kg", "Forza", 69.9, "🏋️", ["Disques en fonte", "Barres chromées", "Mallette"]],
    ["Vélo d'appartement pliable", "Forza", 179, "🚴", ["8 niveaux", "Écran LCD", "Pliable"]],
    ["Ballon de football taille 5", "Goal", 19.9, "⚽", ["Cousu main", "Toutes surfaces", "Pompe offerte"]],
    ["Tente 4 places", "Nomade", 119, "⛺", ["Montage 5 min", "Imperméable", "Sac de transport"]],
    ["Gourde isotherme 750 ml", "Nomade", 19.9, "🥤", ["Inox", "Froid 24 h", "Sans BPA"]],
    ["Raquette de tennis adulte", "Goal", 54.9, "🎾", ["Cadre graphite", "Housse incluse", "Poids 280 g"]],
    ["Corde à sauter lestée", "Zenfit", 12.9, "🪢", ["Compteur", "Poignées mousse", "Réglable"]],
  ],
  livres: [
    ["Roman : Les Étoiles d'Abidjan", "Éditions Lagune", 18.9, "📘", ["Broché", "320 pages", "Prix des lecteurs"]],
    ["Livre de cuisine : Saveurs d'Afrique", "Éditions Lagune", 24.9, "📙", ["Relié", "120 recettes", "Photos couleur"]],
    ["Bande dessinée : L'Aventure de Kouassi", "Bulles & Cie", 13.9, "📗", ["Tome 1", "48 pages", "Dès 8 ans"]],
    ["Guide : Lancer sa boutique en ligne", "Éditions Pro", 21, "📕", ["Broché", "240 pages", "Cas pratiques"]],
    ["Album jeunesse : La Petite Reine", "Bulles & Cie", 11.9, "📒", ["Cartonné", "32 pages", "Dès 3 ans"]],
    ["Thriller : Nuit Blanche", "Éditions Lagune", 9.9, "📓", ["Poche", "416 pages", "Best-seller"]],
    ["Méthode d'anglais débutant", "Éditions Pro", 19.9, "📔", ["Livre + audio", "30 leçons", "Exercices corrigés"]],
    ["Carnet de développement personnel", "Éditions Pro", 14.9, "📝", ["Guidé", "180 pages", "Format A5"]],
  ],
  jouets: [
    ["Jeu de construction 500 pièces", "Bricolo", 34.9, "🧱", ["Dès 6 ans", "Compatible grandes marques", "Boîte de rangement"]],
    ["Peluche ourson géante", "Câlin", 29.9, "🧸", ["80 cm", "Lavable", "Ultra douce"]],
    ["Puzzle 1000 pièces paysage", "Bricolo", 16.9, "🧩", ["Dès 12 ans", "Poster inclus", "Carton épais"]],
    ["Voiture télécommandée tout-terrain", "Turbo", 44.9, "🏎️", ["25 km/h", "Batterie rechargeable", "Antichoc"]],
    ["Jeu de société familial", "Bricolo", 24.9, "🎲", ["2 à 6 joueurs", "Dès 8 ans", "30 min"]],
    ["Poussette canne légère", "Câlin", 89, "👶", ["5,9 kg", "Pliage une main", "Habillage pluie"]],
    ["Kit de dessin 150 pièces", "Arc-en-ciel", 22.9, "🖍️", ["Mallette", "Feutres, crayons, pastels", "Dès 5 ans"]],
    ["Draisienne enfant", "Turbo", 49.9, "🛴", ["Dès 2 ans", "Selle réglable", "Pneus increvables"]],
  ],
};

// Générateur pseudo-aléatoire déterministe : les mêmes valeurs à chaque build.
function seeded(n: number) {
  const x = Math.sin(n * 9301 + 49297) * 233280;
  return x - Math.floor(x);
}

export const products: Product[] = Object.entries(seeds).flatMap(([cat, list], ci) =>
  list.map(([title, brand, price, emoji, features], i) => {
    const n = ci * 100 + i + 1;
    const r = seeded(n);
    const onSale = seeded(n + 7) < 0.35;
    return {
      id: `${cat.slice(0, 3)}-${String(i + 1).padStart(3, "0")}`,
      title,
      brand,
      category: cat,
      price,
      listPrice: onSale ? Math.round(price * (1.15 + seeded(n + 3) * 0.35)) - 0.1 : undefined,
      rating: Math.round((3.4 + r * 1.6) * 10) / 10,
      reviewCount: Math.floor(seeded(n + 11) * 4800) + 12,
      stock: seeded(n + 5) < 0.08 ? 0 : Math.floor(seeded(n + 13) * 60) + 1,
      fastDelivery: seeded(n + 17) < 0.6,
      emoji,
      hue: Math.floor(seeded(n + 19) * 360),
      description: `${title} de la marque ${brand}. Un produit sélectionné par Queennette pour sa qualité et son excellent rapport qualité-prix.`,
      features,
      createdAt: new Date(Date.UTC(2026, 0, 1) + Math.floor(seeded(n + 23) * 300) * 86400000).toISOString(),
    };
  })
);

export function getCategory(slug: string) {
  return categories.find((c) => c.slug === slug);
}

export function getProduct(id: string) {
  return products.find((p) => p.id === id);
}

export function discountPercent(p: Product) {
  return p.listPrice ? Math.round((1 - p.price / p.listPrice) * 100) : 0;
}

// ---------- Recherche et filtres ----------

export const sortOptions = [
  { value: "pertinence", label: "Pertinence" },
  { value: "prix-asc", label: "Prix croissant" },
  { value: "prix-desc", label: "Prix décroissant" },
  { value: "note", label: "Meilleures notes" },
  { value: "avis", label: "Plus d'avis" },
  { value: "nouveautes", label: "Nouveautés" },
] as const;

export type SearchParams = {
  q?: string;
  cat?: string;
  marque?: string[];
  min?: number;
  max?: number;
  note?: number;
  rapide?: boolean;
  promo?: boolean;
  stock?: boolean;
  tri?: string;
  page?: number;
};

export const PAGE_SIZE = 12;

function normalize(s: string) {
  return s.toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "");
}

export function parseSearchParams(raw: Record<string, string | string[] | undefined>): SearchParams {
  const one = (k: string) => (Array.isArray(raw[k]) ? raw[k]![0] : (raw[k] as string | undefined));
  const many = (k: string) => (raw[k] === undefined ? [] : Array.isArray(raw[k]) ? (raw[k] as string[]) : [raw[k] as string]);
  const num = (k: string) => {
    const v = one(k);
    const n = v ? Number(v) : NaN;
    return Number.isFinite(n) && n >= 0 ? n : undefined;
  };
  return {
    q: one("q")?.trim() || undefined,
    cat: one("cat") || undefined,
    marque: many("marque"),
    min: num("min"),
    max: num("max"),
    note: num("note"),
    rapide: one("rapide") === "1",
    promo: one("promo") === "1",
    stock: one("stock") === "1",
    tri: one("tri") || "pertinence",
    page: Math.max(1, Math.floor(num("page") ?? 1)),
  };
}

export function searchProducts(params: SearchParams) {
  const terms = params.q ? normalize(params.q).split(/\s+/).filter(Boolean) : [];

  // Base : texte + catégorie. Les facettes (marques, fourchettes) sont calculées sur cette base.
  const base = products
    .map((p) => {
      if (params.cat && p.category !== params.cat) return null;
      if (!terms.length) return { p, score: 0 };
      const hay = normalize(`${p.title} ${p.brand} ${getCategory(p.category)?.name} ${p.features.join(" ")}`);
      const title = normalize(p.title);
      let score = 0;
      for (const t of terms) {
        if (!hay.includes(t)) return null;
        score += title.includes(t) ? 3 : 1;
      }
      return { p, score };
    })
    .filter((x): x is { p: Product; score: number } => x !== null);

  const brands = [...new Set(base.map((x) => x.p.brand))].sort((a, b) => a.localeCompare(b));
  const categoryCounts = categories
    .map((c) => ({ ...c, count: base.filter((x) => x.p.category === c.slug).length }))
    .filter((c) => c.count > 0);

  let results = base.filter(({ p }) => {
    if (params.marque?.length && !params.marque.includes(p.brand)) return false;
    if (params.min !== undefined && p.price < params.min) return false;
    if (params.max !== undefined && p.price > params.max) return false;
    if (params.note !== undefined && p.rating < params.note) return false;
    if (params.rapide && !p.fastDelivery) return false;
    if (params.promo && !p.listPrice) return false;
    if (params.stock && p.stock === 0) return false;
    return true;
  });

  const sorters: Record<string, (a: (typeof results)[0], b: (typeof results)[0]) => number> = {
    pertinence: (a, b) => b.score - a.score || b.p.reviewCount * b.p.rating - a.p.reviewCount * a.p.rating,
    "prix-asc": (a, b) => a.p.price - b.p.price,
    "prix-desc": (a, b) => b.p.price - a.p.price,
    note: (a, b) => b.p.rating - a.p.rating || b.p.reviewCount - a.p.reviewCount,
    avis: (a, b) => b.p.reviewCount - a.p.reviewCount,
    nouveautes: (a, b) => b.p.createdAt.localeCompare(a.p.createdAt),
  };
  results = [...results].sort(sorters[params.tri ?? "pertinence"] ?? sorters.pertinence);

  const total = results.length;
  const pageCount = Math.max(1, Math.ceil(total / PAGE_SIZE));
  const page = Math.min(params.page ?? 1, pageCount);
  return {
    items: results.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE).map((x) => x.p),
    total,
    page,
    pageCount,
    brands,
    categoryCounts,
  };
}
