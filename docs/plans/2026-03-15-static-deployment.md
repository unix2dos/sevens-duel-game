# Static Deployment Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Prepare this repository for free public deployment with a static-hosting-first setup that supports Cloudflare Pages as the primary option and GitHub Pages as the zero-cost fallback.

**Architecture:** Keep the game as a plain static Vite build. Add one environment-driven base path hook so the same codebase can deploy at `/` on Cloudflare Pages and at `/sevens-duel-game/` on GitHub Pages without platform-specific runtime code.

**Tech Stack:** Vite, React, GitHub Actions, Cloudflare Pages, GitHub Pages

---

### Task 1: Document the deployment approach

**Files:**
- Create: `docs/deployment.md`
- Modify: `README.md`

**Step 1:** Write a deployment guide that explains the primary and fallback hosting choices.

**Step 2:** Describe the exact Cloudflare Pages build settings for this repo.

**Step 3:** Describe the maintenance flow for future updates.

**Step 4:** Add a short deployment section to the README that links to the detailed guide.

**Step 5:** Re-read the docs to ensure they do not promise unsupported features such as PWA, custom domains, or mainland-China acceleration.

### Task 2: Add GitHub Pages-compatible build support

**Files:**
- Modify: `vite.config.ts`

**Step 1:** Add an environment-driven `base` setting that defaults to `/`.

**Step 2:** Keep local development and default production builds unchanged when no environment variable is set.

**Step 3:** Ensure the config is simple enough that other static hosts can still use the default root deployment path.

### Task 3: Add a GitHub Pages fallback workflow

**Files:**
- Create: `.github/workflows/deploy-github-pages.yml`

**Step 1:** Add a workflow that runs on pushes to `main` and manual dispatch.

**Step 2:** Install dependencies with `npm ci` and build with `VITE_BASE_PATH=/sevens-duel-game/`.

**Step 3:** Upload the `dist/` artifact and deploy it with the official Pages actions.

**Step 4:** Scope permissions to the minimum required for Pages deployment.

### Task 4: Verify the repository state

**Files:**
- Verify only

**Step 1:** Run `npm run build` with the default root base path.

**Step 2:** Run `VITE_BASE_PATH=/sevens-duel-game/ npm run build` to verify GitHub Pages compatibility.

**Step 3:** Run `npm run test`.

**Step 4:** Review the diff to confirm only deployment-related files changed.
