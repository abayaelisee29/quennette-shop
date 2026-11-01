// Catalogue d'exemple, importé dans la base au premier lancement (boutique « Queennette »).
// Textes en anglais (langue par défaut) avec leur traduction française.
import { categoryDefs } from "./categories";
import type { Product } from "./products";

type Seed = [titleEn: string, titleFr: string, brand: string, price: number, emoji: string, featuresEn: string[], featuresFr: string[]];

const seeds: Record<string, Seed[]> = {
  electronics: [
    ["Noise-Cancelling Wireless Headphones", "Casque sans fil à réduction de bruit", "Sonora", 129.9, "🎧", ["40-hour battery", "Active noise cancelling", "Bluetooth 5.3"], ["Autonomie 40 h", "Réduction de bruit active", "Bluetooth 5.3"]],
    ["True Wireless Earbuds", "Écouteurs intra-auriculaires True Wireless", "Sonora", 49.9, "🎵", ["Charging case", "IPX5 water resistant", "Built-in mic"], ["Étui de charge", "Résistants à l'eau IPX5", "Micro intégré"]],
    ["6.5\" Smartphone, 128 GB", "Smartphone 6,5\" 128 Go", "Nova", 299, "📱", ["AMOLED display", "50 MP triple camera", "5000 mAh battery"], ["Écran AMOLED", "Triple caméra 50 Mpx", "Batterie 5000 mAh"]],
    ["Fitness Smartwatch", "Montre connectée sport", "Pulse", 89.9, "⌚", ["Heart-rate tracking", "Built-in GPS", "Water resistant to 5 ATM"], ["Suivi cardiaque", "GPS intégré", "Étanche 5 ATM"]],
    ["Portable Bluetooth Speaker", "Enceinte Bluetooth portable", "Sonora", 39.9, "🔊", ["360° sound", "12-hour battery", "Floats on water"], ["Son 360°", "12 h d'autonomie", "Flottante"]],
    ["65 W USB-C Fast Charger", "Chargeur rapide USB-C 65 W", "Volta", 24.9, "🔌", ["3 ports", "Charges laptops", "Compact"], ["3 ports", "Compatible ordinateurs", "Compact"]],
    ["20,000 mAh Power Bank", "Batterie externe 20 000 mAh", "Volta", 29.9, "🔋", ["Fast charging", "Charges 2 devices at once", "LED display"], ["Charge rapide", "2 appareils à la fois", "Écran LED"]],
    ["Wi-Fi Security Camera", "Caméra de surveillance Wi-Fi", "Vigil", 45, "📷", ["Night vision", "Motion detection", "Two-way audio"], ["Vision nocturne", "Détection de mouvement", "Audio bidirectionnel"]],
  ],
  computers: [
    ["15\" Laptop, 16 GB RAM", "Ordinateur portable 15\" 16 Go RAM", "Lumen", 749, "💻", ["512 GB SSD", "Full HD display", "10-hour battery"], ["SSD 512 Go", "Écran Full HD", "Autonomie 10 h"]],
    ["Ergonomic Wireless Mouse", "Souris sans fil ergonomique", "Glide", 19.9, "🖱️", ["Silent clicks", "6 buttons", "USB receiver"], ["Silencieuse", "6 boutons", "Récepteur USB"]],
    ["Backlit Mechanical Keyboard", "Clavier mécanique rétroéclairé", "Glide", 69.9, "⌨️", ["Tactile switches", "US layout", "RGB lighting"], ["Switchs tactiles", "Disposition US", "RGB"]],
    ["27\" QHD Monitor", "Écran 27\" QHD", "Lumen", 259, "🖥️", ["2560×1440", "75 Hz IPS", "HDMI + DisplayPort"], ["2560×1440", "IPS 75 Hz", "HDMI + DisplayPort"]],
    ["1 TB Portable SSD", "Disque SSD externe 1 To", "Stora", 89, "💾", ["10 Gb/s USB-C", "Shock resistant", "Works with Mac and PC"], ["USB-C 10 Gb/s", "Antichoc", "Compatible Mac et PC"]],
    ["1080p Full HD Webcam", "Webcam Full HD 1080p", "Vigil", 34.9, "🎥", ["Stereo mic", "Light correction", "Universal clip"], ["Micro stéréo", "Correction de lumière", "Clip universel"]],
    ["Wi-Fi 6 Router", "Routeur Wi-Fi 6", "Nexo", 79.9, "📡", ["Dual band", "Covers 1,600 sq ft", "Parental controls"], ["Double bande", "Couverture 150 m²", "Contrôle parental"]],
    ["All-in-One Inkjet Printer", "Imprimante jet d'encre multifonction", "Printa", 99, "🖨️", ["Wi-Fi", "Scanner", "Double-sided printing"], ["Wi-Fi", "Scanner", "Recto verso"]],
  ],
  home: [
    ["Multi-Function Cooking Robot", "Robot cuiseur multifonction", "Cuisio", 199, "🍲", ["10 programs", "4.5 L bowl", "Recipe book included"], ["10 programmes", "Bol 4,5 L", "Livre de recettes"]],
    ["Automatic Espresso Machine", "Cafetière expresso automatique", "Aroma", 249, "☕", ["Built-in grinder", "Milk frother", "15 bar"], ["Broyeur intégré", "Mousseur à lait", "15 bars"]],
    ["5.5 L Air Fryer", "Friteuse à air chaud 5,5 L", "Cuisio", 89.9, "🍟", ["Oil-free", "8 modes", "Non-stick basket"], ["Sans huile", "8 modes", "Panier antiadhésif"]],
    ["Smart Robot Vacuum", "Aspirateur robot connecté", "Netto", 229, "🤖", ["Room mapping", "Mobile app", "Vacuums and mops"], ["Cartographie", "Application mobile", "Aspire et lave"]],
    ["3-Piece Non-Stick Pan Set", "Set de 3 poêles antiadhésives", "Cuisio", 54.9, "🍳", ["All stovetops incl. induction", "PFOA-free", "8/10/11 in"], ["Tous feux dont induction", "Sans PFOA", "20/24/28 cm"]],
    ["Touch Bedside Lamp", "Lampe de chevet tactile", "Lueur", 27.9, "💡", ["3 brightness levels", "USB port", "Natural wood"], ["3 intensités", "Port USB", "Bois naturel"]],
    ["Queen Cotton Bedding Set", "Parure de lit 240×220 coton", "Doux Nid", 49.9, "🛏️", ["100% cotton", "2 pillowcases included", "Machine washable"], ["100 % coton", "2 taies incluses", "Lavable 60 °C"]],
    ["Glass Electric Kettle", "Bouilloire électrique en verre", "Aroma", 29.9, "🫖", ["1.7 L", "Auto shut-off", "Blue LED"], ["1,7 L", "Arrêt automatique", "LED bleue"]],
  ],
  fashion: [
    ["Flowy Printed Summer Dress", "Robe d'été fluide imprimée", "Maison Ama", 39.9, "👗", ["Lightweight viscose", "Sizes S to XXL", "Machine washable"], ["Viscose légère", "Du S au XXL", "Lavable en machine"]],
    ["Lightweight Unisex Sneakers", "Baskets légères unisexe", "Foulée", 59.9, "👟", ["Cushioned sole", "Breathable mesh", "US sizes 5 to 13"], ["Semelle amortissante", "Mesh respirant", "Du 36 au 46"]],
    ["Leather Handbag", "Sac à main en cuir", "Maison Ama", 89, "👜", ["Genuine leather", "Removable strap", "3 compartments"], ["Cuir véritable", "Bandoulière amovible", "3 compartiments"]],
    ["Men's Linen Shirt", "Chemise en lin homme", "Atelier Kofi", 44.9, "👔", ["100% linen", "Regular fit", "4 colors"], ["100 % lin", "Coupe droite", "4 coloris"]],
    ["Slim-Fit Jeans", "Jean coupe slim", "Atelier Kofi", 49.9, "👖", ["Stretch denim", "5 pockets", "Waist 28 to 40"], ["Denim stretch", "5 poches", "Du 36 au 50"]],
    ["Polarized Sunglasses", "Lunettes de soleil polarisées", "Solis", 29.9, "🕶️", ["UV400", "Case included", "Lightweight frame"], ["UV400", "Étui inclus", "Monture légère"]],
    ["Classic Leather-Strap Watch", "Montre classique bracelet cuir", "Tempo", 79, "⌚", ["Quartz movement", "Mineral glass", "Water resistant to 3 ATM"], ["Mouvement quartz", "Verre minéral", "Étanche 3 ATM"]],
    ["Soft Wool Scarf", "Écharpe en laine douce", "Maison Ama", 24.9, "🧣", ["Merino wool", "71 × 12 in", "Unisex"], ["Laine mérinos", "180×30 cm", "Unisexe"]],
  ],
  beauty: [
    ["Hyaluronic Acid Face Serum", "Sérum visage à l'acide hyaluronique", "Éclat", 22.9, "💧", ["1 fl oz", "All skin types", "Fragrance-free"], ["30 ml", "Tous types de peau", "Sans parfum"]],
    ["Ionic Hair Dryer", "Sèche-cheveux ionique", "Brise", 49.9, "💨", ["1875 W", "3 speeds", "Diffuser included"], ["2200 W", "3 vitesses", "Diffuseur inclus"]],
    ["Makeup Gift Set", "Coffret de maquillage", "Éclat", 34.9, "💄", ["24 shades", "Brushes included", "Mirror"], ["24 fards", "Pinceaux inclus", "Miroir"]],
    ["Pure Shea Butter Oil", "Huile de karité pure", "Terre d'Afrique", 14.9, "🧴", ["100% natural", "Body and hair", "6.8 fl oz"], ["100 % naturelle", "Corps et cheveux", "200 ml"]],
    ["Electric Toothbrush", "Brosse à dents électrique", "Dentia", 39.9, "🪥", ["2-minute timer", "3 modes", "30-day battery"], ["Minuteur 2 min", "3 modes", "Autonomie 30 jours"]],
    ["Floral Eau de Parfum, 1.7 oz", "Parfum floral 50 ml", "Maison Ama", 59, "🌸", ["Eau de parfum", "Jasmine notes", "Glass bottle"], ["Eau de parfum", "Notes de jasmin", "Flacon verre"]],
    ["Ceramic Flat Iron", "Lisseur céramique", "Brise", 34.9, "✨", ["Heats up in 30 s", "450 °F", "Auto shut-off"], ["Chauffe en 30 s", "230 °C", "Arrêt automatique"]],
    ["Smart Bathroom Scale", "Pèse-personne connecté", "Pulse", 29.9, "⚖️", ["13 body metrics", "Companion app", "Up to 400 lb"], ["13 mesures", "Application", "Jusqu'à 180 kg"]],
  ],
  sports: [
    ["Non-Slip Yoga Mat", "Tapis de yoga antidérapant", "Zenfit", 24.9, "🧘", ["1/4 in thick", "Carrying strap", "Eco-friendly TPE"], ["6 mm", "Sangle de transport", "TPE écologique"]],
    ["Adjustable Dumbbells, 2 × 22 lb", "Haltères réglables 2×10 kg", "Forza", 69.9, "🏋️", ["Cast-iron plates", "Chrome bars", "Carrying case"], ["Disques en fonte", "Barres chromées", "Mallette"]],
    ["Folding Exercise Bike", "Vélo d'appartement pliable", "Forza", 179, "🚴", ["8 resistance levels", "LCD screen", "Folds flat"], ["8 niveaux", "Écran LCD", "Pliable"]],
    ["Size 5 Soccer Ball", "Ballon de football taille 5", "Goal", 19.9, "⚽", ["Hand-stitched", "All surfaces", "Free pump"], ["Cousu main", "Toutes surfaces", "Pompe offerte"]],
    ["4-Person Tent", "Tente 4 places", "Nomade", 119, "⛺", ["5-minute setup", "Waterproof", "Carry bag"], ["Montage 5 min", "Imperméable", "Sac de transport"]],
    ["Insulated Water Bottle, 25 oz", "Gourde isotherme 750 ml", "Nomade", 19.9, "🥤", ["Stainless steel", "Cold for 24 h", "BPA-free"], ["Inox", "Froid 24 h", "Sans BPA"]],
    ["Adult Tennis Racket", "Raquette de tennis adulte", "Goal", 54.9, "🎾", ["Graphite frame", "Cover included", "10 oz"], ["Cadre graphite", "Housse incluse", "Poids 280 g"]],
    ["Weighted Jump Rope", "Corde à sauter lestée", "Zenfit", 12.9, "🪢", ["Jump counter", "Foam handles", "Adjustable"], ["Compteur", "Poignées mousse", "Réglable"]],
  ],
  books: [
    ["Novel: The Stars of Abidjan", "Roman : Les Étoiles d'Abidjan", "Lagoon Press", 18.9, "📘", ["Paperback", "320 pages", "Readers' Choice Award"], ["Broché", "320 pages", "Prix des lecteurs"]],
    ["Cookbook: Flavors of Africa", "Livre de cuisine : Saveurs d'Afrique", "Lagoon Press", 24.9, "📙", ["Hardcover", "120 recipes", "Full-color photos"], ["Relié", "120 recettes", "Photos couleur"]],
    ["Comic: Kouassi's Adventure", "Bande dessinée : L'Aventure de Kouassi", "Bubbles & Co", 13.9, "📗", ["Volume 1", "48 pages", "Ages 8+"], ["Tome 1", "48 pages", "Dès 8 ans"]],
    ["Guide: Launch Your Online Store", "Guide : Lancer sa boutique en ligne", "Pro Editions", 21, "📕", ["Paperback", "240 pages", "Real-world case studies"], ["Broché", "240 pages", "Cas pratiques"]],
    ["Picture Book: The Little Queen", "Album jeunesse : La Petite Reine", "Bubbles & Co", 11.9, "📒", ["Board book", "32 pages", "Ages 3+"], ["Cartonné", "32 pages", "Dès 3 ans"]],
    ["Thriller: Sleepless Night", "Thriller : Nuit Blanche", "Lagoon Press", 9.9, "📓", ["Mass-market paperback", "416 pages", "Bestseller"], ["Poche", "416 pages", "Best-seller"]],
    ["French for Beginners", "Le français pour débutants", "Pro Editions", 19.9, "📔", ["Book + audio", "30 lessons", "Answer key"], ["Livre + audio", "30 leçons", "Exercices corrigés"]],
    ["Personal Growth Journal", "Carnet de développement personnel", "Pro Editions", 14.9, "📝", ["Guided prompts", "180 pages", "A5 format"], ["Guidé", "180 pages", "Format A5"]],
  ],
  toys: [
    ["500-Piece Building Set", "Jeu de construction 500 pièces", "Bricolo", 34.9, "🧱", ["Ages 6+", "Compatible with major brands", "Storage box"], ["Dès 6 ans", "Compatible grandes marques", "Boîte de rangement"]],
    ["Giant Teddy Bear", "Peluche ourson géante", "Câlin", 29.9, "🧸", ["31 in tall", "Washable", "Extra soft"], ["80 cm", "Lavable", "Ultra douce"]],
    ["1000-Piece Landscape Puzzle", "Puzzle 1000 pièces paysage", "Bricolo", 16.9, "🧩", ["Ages 12+", "Poster included", "Thick cardboard"], ["Dès 12 ans", "Poster inclus", "Carton épais"]],
    ["Off-Road RC Car", "Voiture télécommandée tout-terrain", "Turbo", 44.9, "🏎️", ["15 mph", "Rechargeable battery", "Shock-proof"], ["25 km/h", "Batterie rechargeable", "Antichoc"]],
    ["Family Board Game", "Jeu de société familial", "Bricolo", 24.9, "🎲", ["2 to 6 players", "Ages 8+", "30 minutes"], ["2 à 6 joueurs", "Dès 8 ans", "30 min"]],
    ["Lightweight Umbrella Stroller", "Poussette canne légère", "Câlin", 89, "👶", ["13 lb", "One-hand fold", "Rain cover"], ["5,9 kg", "Pliage une main", "Habillage pluie"]],
    ["150-Piece Art Kit", "Kit de dessin 150 pièces", "Arc-en-ciel", 22.9, "🖍️", ["Carry case", "Markers, pencils, pastels", "Ages 5+"], ["Mallette", "Feutres, crayons, pastels", "Dès 5 ans"]],
    ["Kids' Balance Bike", "Draisienne enfant", "Turbo", 49.9, "🛴", ["Ages 2+", "Adjustable seat", "Puncture-proof tires"], ["Dès 2 ans", "Selle réglable", "Pneus increvables"]],
  ],
};

// Générateur pseudo-aléatoire déterministe : les mêmes valeurs à chaque lancement.
function seeded(n: number) {
  const x = Math.sin(n * 9301 + 49297) * 233280;
  return x - Math.floor(x);
}

const descEn = (title: string, brand: string) => `${title} by ${brand}. Hand-picked by Queennette for its quality and great value.`;
const descFr = (title: string, brand: string) =>
  `${title} de la marque ${brand}. Un produit sélectionné par Queennette pour sa qualité et son excellent rapport qualité-prix.`;

export const sampleProducts = (sellerId: string): Product[] =>
  categoryDefs.flatMap((cat, ci) =>
    (seeds[cat.slug] ?? []).map(([title, titleFr, brand, price, emoji, features, featuresFr], i) => {
      const n = ci * 100 + i + 1;
      const r = seeded(n);
      const onSale = seeded(n + 7) < 0.35;
      return {
        id: `${cat.idPrefix}-${String(i + 1).padStart(3, "0")}`,
        title,
        brand,
        category: cat.slug,
        price,
        listPrice: onSale ? Math.round(price * (1.15 + seeded(n + 3) * 0.35)) - 0.1 : undefined,
        rating: Math.round((3.4 + r * 1.6) * 10) / 10,
        reviewCount: Math.floor(seeded(n + 11) * 4800) + 12,
        stock: seeded(n + 5) < 0.08 ? 0 : Math.floor(seeded(n + 13) * 60) + 1,
        fastDelivery: seeded(n + 17) < 0.6,
        emoji,
        hue: Math.floor(seeded(n + 19) * 360),
        description: descEn(title, brand),
        features,
        fr: { title: titleFr, description: descFr(titleFr, brand), features: featuresFr },
        sellerId,
        status: "actif" as const,
        createdAt: new Date(Date.UTC(2026, 0, 1) + Math.floor(seeded(n + 23) * 300) * 86400000).toISOString(),
      };
    })
  );
