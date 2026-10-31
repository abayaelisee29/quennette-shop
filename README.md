# Queennette Shop

Marketplace en ligne construite avec Next.js 16, React 19 et Tailwind CSS 4.

## Étape 1 : catalogue

- Accueil : bannière, cartes par catégorie, rangées « Offres du jour », « Meilleures ventes », « Les mieux notés », « Nouveautés »
- Pages catégories : `/categorie/[slug]`
- Fiche produit : `/produit/[id]` (galerie, encadré d'achat, caractéristiques, produits similaires, résumé des notes)
- Recherche : `/recherche?q=…` avec filtres (catégorie, livraison express, note, prix, marques, promo, stock), tri et pagination
- 4 thèmes interchangeables (Reine, Océan, Forêt, Minuit), mémorisés dans le navigateur
- Catalogue d'exemple : 8 catégories, 64 produits

## Étape 2 : comptes, panier, paiement

- Comptes clients : `/inscription`, `/connexion`, `/compte` (mots de passe chiffrés avec scrypt, session par cookie sécurisé)
- Panier : `/panier` (fonctionne sans compte, quantités, suppression, barre « livraison gratuite », suggestions)
- Liste d'envies : `/envies` (bouton sur chaque fiche produit et dans le panier)
- Commande : `/commande` (adresse de livraison, récapitulatif) puis paiement Stripe Checkout
- Confirmation et historique des commandes dans `/compte`
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

- `/vendeur` : n'importe quel client peut ouvrir sa boutique (nom + présentation)
- Tableau de bord : chiffre d'affaires, commandes, articles à expédier, stock bas
- `/vendeur/produits` : liste filtrable, modification rapide du stock, ajout/modification/suppression, brouillons
- Fiche produit vendeur : titre, marque, catégorie, prix, prix barré, stock, livraison express, points forts, **photo**
- `/vendeur/commandes` : commandes payées contenant ses produits, adresse de livraison, « Marquer comme expédiée » avec n° de suivi, puis « livrée »
- Le client voit l'état d'expédition et le n° de suivi dans `/compte`
- Le stock baisse automatiquement quand une commande est payée
- Vitrine publique de chaque boutique : `/boutique/[nom]`, avec recherche et filtres
- Le catalogue d'exemple appartient à la boutique maison « Queennette » (`/boutique/queennette`)

Les photos sont enregistrées dans `data/uploads/` et servies par `/api/images/…`.

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
| Couleurs d'un thème, ou ajouter un thème | `src/app/globals.css` + `src/lib/themes.ts` |
| Catégories | `src/lib/categories.ts` |
| Catalogue d'exemple importé au premier lancement | `src/lib/sample-data.ts` |
| En-tête, pied de page | `src/components/Header.tsx`, `Footer.tsx` |

Les composants n'utilisent que des couleurs du thème (`bg-brand`, `text-muted`, `bg-surface`…), donc un nouveau thème s'applique partout sans toucher aux pages.

## Prochaines étapes

4. Avis clients, recommandations, suivi de commande
5. Éditeur de thèmes
