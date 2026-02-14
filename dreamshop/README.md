Site e-commerce Next.js + TailwindCSS, style minimal / premium streetwear (hoodies & ensembles tech fleece).

## Getting Started

### 1) Installer

```bash
npm install
```

### 2) Base de données (SQLite + Prisma)

```bash
npm run db:setup
```

### 3) Lancer le serveur

Option A (classique, au premier plan) :

```bash
npm run dev
```

Ouvrir `http://localhost:3000`.

Option B (recommandé si ça “se coupe”, serveur détaché) :

```bash
npm run dev:daemon
```

Ouvrir `http://localhost:3001`.

Commandes utiles :

```bash
npm run dev:status
npm run dev:stop
```

Logs : `.dev.log` (PID : `.dev.pid`).

## Pages

- `/` accueil (hero + produits mis en avant)
- `/shop` boutique + filtres (taille / couleur / prix)
- `/products/[slug]` fiche produit (couleur / taille / galerie)
- `/cart` panier
- `/checkout` checkout simple (démo) + création de commande + décrément stock

## Admin

- `/admin` dashboard (ventes, commandes, stock faible)
- `/admin/products` CRUD produits + stock par taille + images
- `/admin/orders` gestion commandes + statut

Identifiants (par défaut si non définis) :
- code: `1508`

Recommandé : créer un `.env.local` à partir de `.env.example`.

## Thèmes / palettes

Palette changeable via le sélecteur en footer.
Thème par défaut via `NEXT_PUBLIC_DEFAULT_THEME` (mono | sand | slate | white), et variables CSS dans `src/app/globals.css`.
