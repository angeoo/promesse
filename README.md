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
