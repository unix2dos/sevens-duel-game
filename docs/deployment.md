# Deployment Guide

## Goal

Publish the current single-player web game behind a public HTTPS URL with the lowest possible operating cost and the simplest future update flow.

## Recommended Host: Cloudflare Pages

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
