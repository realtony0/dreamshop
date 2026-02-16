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

## Deploiement Vercel

Pour la prod, n’utilise pas `file:./dev.db` (SQLite local). Utilise une DB libSQL distante (Turso).

1) Variables d’environnement Vercel (Project Settings -> Environment Variables)

- `DATABASE_URL=libsql://<ta-db>.turso.io`
- `TURSO_AUTH_TOKEN=<ton-token>` (ou `DATABASE_AUTH_TOKEN`)
- `ADMIN_CODE=1508` (ou ton nouveau code)
- `ADMIN_SESSION_SECRET=<long-secret-random>`
- `ADMIN_AUTH_DISABLED=true` (désactive le pin admin)
- `NEXT_PUBLIC_DEFAULT_THEME=white`
- `NEXT_PUBLIC_ENABLE_PWA=0` (mettre `1` seulement si tu veux activer le service worker)

2) Initialiser le schema sur la DB distante (une fois)

```bash
DATABASE_URL="libsql://<ta-db>.turso.io" TURSO_AUTH_TOKEN="<ton-token>" npm run db:push
```

3) (Optionnel) Importer / seed les produits sur la DB distante

```bash
DATABASE_URL="libsql://<ta-db>.turso.io" TURSO_AUTH_TOKEN="<ton-token>" npm run photos:import
```

4) Lancer le deploy sur Vercel

- Framework: `Next.js` (auto)
- Build command: `npm run build` (auto)
- Output: `.next` (auto)

## Thèmes / palettes

Palette changeable via le sélecteur en footer.
Thème par défaut via `NEXT_PUBLIC_DEFAULT_THEME` (crock | mono | sand | slate | white), et variables CSS dans `src/app/globals.css`.
