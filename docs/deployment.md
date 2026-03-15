# Deployment Guide

## Goal

Publish the current single-player web game behind a public HTTPS URL with the lowest possible operating cost and the simplest future update flow.

## Chosen Model: Dual Deployment

This repository now uses a split deployment model:

- `Cloudflare Pages` is the primary public host.
- `GitHub Pages` is the fallback public host.
- `GitHub Actions` only publishes the GitHub Pages copy.
- `Cloudflare Pages` should deploy through Cloudflare's own Git integration, not through a GitHub Actions upload step.

This keeps each platform on its native deployment path while preserving two live URLs.

## Primary Host: Cloudflare Pages

This repository is a plain static Vite app. It builds into `dist/` and does not require a server runtime, database, or edge function. That makes it a good fit for Cloudflare Pages.

### Why this is the primary option

- Free static hosting
- GitHub integration with automatic deploys on push
- Root-path hosting, so the current app works without route rewrites
- Easy migration later because the project remains a standard static build

### Cloudflare Pages settings

If Cloudflare does not auto-detect the project correctly, use:

- Framework preset: `Vite`
- Build command: `npm run build`
- Build output directory: `dist`
- Root directory: leave empty unless the repo becomes a monorepo later
- Production branch: `main`

### Expected maintenance flow

1. Merge changes into `main`.
2. Cloudflare Pages pulls from GitHub automatically.
3. Wait for the deploy to finish.
4. Open the production URL and verify the home screen and one full match.

## Fallback Host: GitHub Pages

GitHub Pages is the no-cost fallback when you want a working public URL without opening a separate hosting account first. This repository includes a GitHub Actions workflow that builds and deploys the static site from `main`.

### GitHub Pages caveat

GitHub Pages serves project sites from a subpath such as `/sevens-duel-game/`. The Vite config in this repo reads `VITE_BASE_PATH` so the same codebase can build correctly for both:

- `VITE_BASE_PATH=/` for Cloudflare Pages and most static hosts
- `VITE_BASE_PATH=/sevens-duel-game/` for GitHub Pages

### GitHub Pages setup

1. Open the repository settings on GitHub.
2. Go to `Pages`.
3. Set the build source to `GitHub Actions`.
4. Push the workflow on `main`.
5. Wait for the `Deploy to GitHub Pages` workflow to publish the site.

## CI Coverage Inside GitHub

The repository now keeps a separate validation workflow for the two static-host build modes:

- `VITE_BASE_PATH=/` for Cloudflare Pages
- `VITE_BASE_PATH=/sevens-duel-game/` for GitHub Pages

That workflow verifies build compatibility on pull requests and on pushes to `main`, but it does not upload anything to Cloudflare.

## Why Not Upload Cloudflare from GitHub Actions

This repository intentionally avoids a second deploy step from GitHub Actions to Cloudflare because:

- Cloudflare Pages already supports Git-native deployment from the same repository.
- keeping Cloudflare deployment inside Cloudflare avoids extra API tokens in GitHub secrets
- platform-native previews and deploy status remain available in Cloudflare
- failure isolation is simpler when each platform owns its own deploy pipeline

## Suggested Operator Checklist

When dual deployment is considered healthy, all of the following should be true:

1. A push to `main` triggers the `Deploy to GitHub Pages` workflow on GitHub.
2. The same push appears as a production deploy inside Cloudflare Pages.
3. The GitHub Pages URL loads correctly under `/sevens-duel-game/`.
4. The Cloudflare Pages URL loads correctly from `/`.

## Scope Boundaries

This deployment setup does not include:

- user accounts
- cloud saves
- leaderboards
- multiplayer rooms
- PWA install flow
- custom domain purchase
- mainland China acceleration or ICP备案

## Mainland China Access Note

This setup is suitable for public sharing, but "China mainland and overseas both stable and fast" is not a realistic acceptance target with a free overseas static host alone. If that becomes a hard requirement later, plan a separate phase around domestic hosting,备案, and distribution strategy.

## Migration Exit

Keep the app as a static `dist/` build with no platform-specific runtime features. That allows later migration to:

- Vercel
- Netlify
- GitHub Pages
- Cloudflare Pages
- a domestic static hosting provider
