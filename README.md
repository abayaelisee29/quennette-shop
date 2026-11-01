# Queennette Shop

Marketplace en ligne construite avec Next.js 16, React 19 et Tailwind CSS 4.

## Étape 1 : catalogue

- Accueil : bannière, cartes par catégorie, rangées « Offres du jour », « Meilleures ventes », « Les mieux notés », « Nouveautés »
- Pages catégories : `/category/[slug]`
- Fiche produit : `/product/[id]` (galerie, encadré d'achat, caractéristiques, produits similaires, résumé des notes)
- Recherche : `/search?q=…` avec filtres (catégorie, livraison express, note, prix, marques, promo, stock), tri et pagination
- Thèmes interchangeables, mémorisés dans le navigateur (voir étape 5)
- Catalogue d'exemple : 8 catégories, 64 produits

## Étape 2 : comptes, panier, paiement

- Comptes clients : `/signup`, `/signin`, `/account` (mots de passe chiffrés avec scrypt, session par cookie sécurisé)
- Panier : `/cart` (fonctionne sans compte, quantités, suppression, barre « livraison gratuite », suggestions)
- Liste d'envies : `/wishlist` (bouton sur chaque fiche produit et dans le panier)
- Commande : `/checkout` (adresse de livraison, récapitulatif) puis paiement Stripe Checkout
- Confirmation et historique des commandes dans `/account`
- Les prix sont toujours recalculés côté serveur à partir du catalogue

### Paiement : mode démo ou Stripe (test)

Sans configuration, le paiement est **simulé** (mode démo) : tout le parcours fonctionne sans compte Stripe.

Pour utiliser Stripe en mode test :

1. Créez un compte sur https://dashboard.stripe.com et activez le **mode test**.
2. Copiez `.env.example` en `.env.local` et collez votre clé secrète de test (`sk_test_...`) dans `STRIPE_SECRET_KEY`.
3. Relancez `npm run dev`. Payez avec la carte `4242 4242 4242 4242`, une date future et n'importe quel code.
4. (Optionnel) Webhook : installez la Stripe CLI, lancez `stripe listen --forward-to localhost:3000/api/stripe/webhook`
   et collez le secret `whsec_...` affiché dans `STRIPE_WEBHOOK_SECRET`. La commande est aussi validée au retour sur la page de confirmation, donc le webhook n'est pas obligatoire en local.

## Étape 3 : espace vendeur

- `/seller` : n'importe quel client peut ouvrir sa boutique (nom + présentation)
- Tableau de bord : chiffre d'affaires, commandes, articles à expédier, stock bas
- `/seller/products` : liste filtrable, modification rapide du stock, ajout/modification/suppression, brouillons
- Fiche produit vendeur : titre, marque, catégorie, prix, prix barré, stock, livraison express, points forts, **photo**
- `/seller/orders` : commandes payées contenant ses produits, adresse de livraison, « Marquer comme expédiée » avec n° de suivi, puis « livrée »
- Le client voit l'état d'expédition et le n° de suivi dans `/account`
- Le stock baisse automatiquement quand une commande est payée
- Vitrine publique de chaque boutique : `/shop/[nom]`, avec recherche et filtres
- Le catalogue d'exemple appartient à la boutique maison « Queennette » (`/shop/queennette`)

Les photos sont enregistrées dans `data/uploads/` et servies par `/api/images/…`.

## Étape 4 : avis, recommandations, suivi

- **Avis clients** : note de 1 à 5, titre, commentaire, mention « Achat vérifié » si le client a payé ce produit,
  bouton « Utile », tri (plus utiles / plus récents), filtre par nombre d'étoiles, modification et suppression de son avis.
  La note moyenne et le nombre d'évaluations du produit sont mis à jour automatiquement. Un vendeur ne peut pas noter ses propres produits.
- **Recommandations** (`src/lib/recommendations.ts`) :
  - « Fréquemment achetés ensemble » avec ajout groupé au panier (basé sur les vraies commandes, complété par catégorie/marque)
  - « Les clients ayant acheté cet article ont également acheté »
  - « Vos articles consultés récemment » (cookie `qs_vus`, 20 derniers produits)
  - « Recommandé pour vous » sur l'accueil (consultations, liste d'envies et achats)
- **Suivi de commande** : `/account/orders/[id]` avec une frise par colis (commandée, payée, expédiée, livrée),
  n° de suivi du vendeur, date de livraison estimée, adresse, « Acheter à nouveau » et « Écrire un commentaire »

## Étape 5 : thèmes

7 thèmes au choix dans le menu « Thème » de l'en-tête : **Reine** (par défaut), Océan, Forêt, Minuit, Kente, Ivoire et Lagune.
Chaque thème définit ses couleurs, l'arrondi des angles, la police des titres (`--title-font`) et le fond des bannières (`--hero`).

- Changer le thème par défaut : `defaultTheme` dans `src/lib/themes.ts`
- Ajouter un thème : copier un bloc `[data-theme="…"]` dans `src/app/globals.css`, changer les valeurs, puis l'ajouter à la liste de `src/lib/themes.ts`
- Retirer un thème du menu : supprimer sa ligne dans `src/lib/themes.ts`

## Langues : anglais par défaut, français en option

Le site s'affiche en anglais (marché américain, prix en dollars). Le bouton **EN | FR** de l'en-tête passe tout le site en français ; le choix est gardé dans un cookie (`qs_lang`).

- Textes de l'interface : `src/lib/i18n/en.ts` (anglais) et `src/lib/i18n/fr.ts` (français), avec exactement les mêmes clés.
  TypeScript signale toute clé oubliée dans l'une des deux langues.
- Pages serveur : `const { t, fmt } = await getI18n()` ; composants navigateur : `const { t } = useI18n()`.
- Prix et dates : `fmt.price(…)`, `fmt.date(…)` (format américain en anglais, français en français). Devise : `currency` dans `src/lib/config.ts`.
- Catalogue d'exemple : chaque produit a son texte anglais et une traduction française (`fr`). Les produits ajoutés par un vendeur s'affichent tels qu'il les a écrits.
- La recherche trouve un produit qu'on tape en anglais ou en français (« headphones » comme « casque »).
- Les anciennes adresses françaises (`/panier`, `/produit/…`, `/categorie/maison`…) redirigent vers les nouvelles.

### Données

Les produits, boutiques, comptes et commandes sont enregistrés dans `data/db.json` (créé automatiquement, ignoré par git).
Au premier lancement, le catalogue d'exemple y est importé. Pour repartir de zéro, supprimez le dossier `data/`.
C'est suffisant pour développer en local ; avant une mise en ligne, `src/lib/db.ts` sera branché sur Supabase/PostgreSQL.

## Lancer en local

```bash
npm install
npm run dev
```

Puis ouvrir http://localhost:3000

## Où modifier quoi

| Je veux changer… | Fichier |
| --- | --- |
| Nom de la boutique, devise, seuil de livraison gratuite | `src/lib/config.ts` |
| Textes du site (anglais / français) | `src/lib/i18n/en.ts`, `src/lib/i18n/fr.ts` |
| Couleurs d'un thème, ou ajouter un thème | `src/app/globals.css` + `src/lib/themes.ts` |
| Catégories | `src/lib/categories.ts` |
| Catalogue d'exemple importé au premier lancement | `src/lib/sample-data.ts` |
| En-tête, pied de page | `src/components/Header.tsx`, `Footer.tsx` |

Les composants n'utilisent que des couleurs du thème (`bg-brand`, `text-muted`, `bg-surface`…), donc un nouveau thème s'applique partout sans toucher aux pages.

## Prochaines étapes

Les 5 étapes du plan sont terminées. Suites possibles : base Supabase pour la mise en ligne, déploiement, e-mails de confirmation.
