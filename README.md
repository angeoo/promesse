# Promesse – Site Next.js

Application Next.js (App Router) pour l’association Promesse, alignée sur la charte graphique (Libre Baskerville / Questrial, palette pourpre & bleu nuit). Stack : Next.js 14, TypeScript, Tailwind CSS, Vitest, ESLint/Prettier.

## Démarrage

```bash
pnpm install
pnpm dev        # http://localhost:3000
pnpm lint       # ESLint
pnpm test       # Vitest + RTL
pnpm build      # Build production
```

## Backend médias (MongoDB + S3)

Le projet inclut un backend pour gérer des médias (images/vidéos) avec:
- MongoDB pour les métadonnées
- S3 (ou compatible S3) pour les fichiers

1. Configurer les variables d’environnement (voir `.env.example`) :
   - `MONGODB_URI`
   - `MONGODB_DB` (optionnel, défaut `promesse`)
   - `S3_REGION`
   - `S3_BUCKET`
   - `S3_ACCESS_KEY_ID`
   - `S3_SECRET_ACCESS_KEY`
   - `S3_ENDPOINT` (optionnel, pour providers S3-compatibles)
   - `ADMIN_PASSWORD` (mot de passe du formulaire admin)
   - `ADMIN_AUTH_SECRET` (optionnel, secret de signature de session)
   - `MEDIA_KILL_SWITCH_ENABLED` (true/false, blocage upload si quotas atteints)
   - `MEDIA_MAX_ASSETS` (nombre max de médias)
   - `MEDIA_MAX_TOTAL_MB` (taille totale max des médias en MB)
2. Installer la dépendance MongoDB :
   - `pnpm add mongodb`
3. Installer les dépendances AWS SDK :
   - `pnpm add @aws-sdk/client-s3 @aws-sdk/s3-request-presigner`
4. Lancer l’app :
   - `pnpm dev`

### Routes / pages ajoutées

- `app/admin/media/page.tsx` : interface admin pour uploader et supprimer des médias.
- `app/api/admin/auth/login/route.ts` : connexion admin (mot de passe simple).
- `app/api/admin/auth/logout/route.ts` : déconnexion admin.
- `app/api/admin/auth/session/route.ts` : vérification de session admin.
- `app/api/admin/media/route.ts` : API admin (`GET`, `POST`, `DELETE`).
  - inclut un kill switch paramétrable par quotas (`MEDIA_*`)
- `app/api/media/[id]/route.ts` : redirection vers une URL signée S3 pour lire le média.
- `app/(site)/ressources/page.tsx` : affiche automatiquement les médias publiés.

## Structure

- `app/` pages App Router (`page.tsx`, `app/(example)/dashboard/page.tsx`)
- `components/ui/` design system (Button, Input, Card, Badge, Typography)
- `features/` espace pour modules métier
- `styles/` `globals.css` avec tokens CSS et Tailwind base
- `lib/` utilitaires partagés
- `tests/` tests Vitest/RTL + `vitest.config.ts`
- `.github/workflows/` CI Vercel-like (lint, test, build)

## Design system & tokens

- Couleurs : `--color-primary` #720021, `--color-secondary` #000065, `--color-accent` #00003A, surfaces claires, texte #111.
- Typographies : Libre Baskerville pour les titres (`font-heading`), Questrial pour le texte (`font-body`).
- Rayons : `--radius-sm/md/lg` (6/10/16px), ombres `shadow-soft` et `shadow-focus`.
- Spacings utilitaires : `--space-*` pour cohérence dans le CSS personnalisé.
- Tailwind mappe les variables via `colors`, `fontFamily`, `borderRadius`, `boxShadow`.

### Composants

- `Button` variantes `primary | secondary | ghost`, tailles `sm | md | lg`, états `disabled` + `loading`.
- `Input` avec label, aide et message d’erreur accessible.
- `Card` conteneur surface avec header optionnel.
- `Badge` tonalités `primary | secondary | neutral`.
- `Typography` (`Title`, `Text`) pour hiérarchie éditoriale.

## Pages

- `app/(site)/page.tsx` : Accueil (hero, stats, axes d’impact, démonstration des composants).
- `app/(site)/association/page.tsx` : histoire, vision, missions, valeurs.
- `app/(site)/actions/page.tsx` : actions terrain, chiffres, appels à l’action.
- `app/(site)/programmes/page.tsx` : formations, ambassadeurs, soutien orphelins.
- `app/(site)/ressources/page.tsx` : fiches, vidéos, ressources pour éducateurs.
- `app/(site)/s-engager/page.tsx` : bénévolat, ambassadeurs, dons, vidéo d’engagement.
- `app/(site)/partenariats/page.tsx` : co-construction, mécénat, interventions.
- `app/(site)/actualites/page.tsx` : actualités et temps forts.
- `app/(site)/contact/page.tsx` : contact direct, formulaire, dons.

## Qualité

- ESLint (`next/core-web-vitals`) + Prettier.
- Vitest (jsdom) + React Testing Library (`tests/button.test.tsx`).
- CI GitHub Actions : pnpm install → lint → test → build (compatible déploiement Vercel).

## Conventions

- Imports absolus via alias `@/*`.
- Composants UI dans `components/ui`, logique métier dans `features/`.
- CSS : privilégier tokens (`var(--color-*)`, rayons) et classes Tailwind.
