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

### Données

Les comptes et commandes sont enregistrés dans `data/db.json` (créé automatiquement, ignoré par git).
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
| Produits et catégories | `src/lib/catalog.ts` |
| En-tête, pied de page | `src/components/Header.tsx`, `Footer.tsx` |

Les composants n'utilisent que des couleurs du thème (`bg-brand`, `text-muted`, `bg-surface`…), donc un nouveau thème s'applique partout sans toucher aux pages.

## Prochaines étapes

3. Espace vendeur : produits, stocks, commandes
4. Avis clients, recommandations, suivi de commande
5. Éditeur de thèmes
