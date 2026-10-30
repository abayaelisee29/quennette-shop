# Queennette Shop

Marketplace en ligne construite avec Next.js 16, React 19 et Tailwind CSS 4.

## Étape 1 (ce dépôt)

- Accueil : bannière, cartes par catégorie, rangées « Offres du jour », « Meilleures ventes », « Les mieux notés », « Nouveautés »
- Pages catégories : `/categorie/[slug]`
- Fiche produit : `/produit/[id]` (galerie, encadré d'achat, caractéristiques, produits similaires, résumé des notes)
- Recherche : `/recherche?q=…` avec filtres (catégorie, livraison express, note, prix, marques, promo, stock), tri et pagination
- 4 thèmes interchangeables (Reine, Océan, Forêt, Minuit), mémorisés dans le navigateur
- Catalogue d'exemple : 8 catégories, 64 produits

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

2. Comptes clients, panier, liste d'envies, paiement Stripe (test)
3. Espace vendeur : produits, stocks, commandes
4. Avis clients, recommandations, suivi de commande
5. Éditeur de thèmes
