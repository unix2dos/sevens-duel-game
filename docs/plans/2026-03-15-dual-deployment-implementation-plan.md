# Dual Deployment Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Make the repository's dual-deployment model explicit by keeping GitHub Pages on GitHub Actions, keeping Cloudflare Pages on Cloudflare Git integration, and adding CI that verifies both static-host build modes.

**Architecture:** Do not add a Cloudflare upload step to GitHub Actions. Instead, add one verification workflow that builds the app once with the root-path configuration used by Cloudflare Pages and once with the subpath configuration used by GitHub Pages, then update the deployment docs so the responsibilities of each platform are unambiguous.

**Tech Stack:** GitHub Actions, Vite, Node.js 22, npm, Markdown

---

### Task 1: Add CI Coverage for Both Static Hosts

**Files:**
- Create: `/Users/liuwei/workspace/sevens-duel-game/.github/workflows/verify-static-host-builds.yml`

**Step 1: Add the workflow**

Create `/Users/liuwei/workspace/sevens-duel-game/.github/workflows/verify-static-host-builds.yml` with a matrix build that runs on `pull_request` and `push` to `main`.

Matrix entries:

- `Cloudflare Pages` with `VITE_BASE_PATH=/`
- `GitHub Pages` with `VITE_BASE_PATH=/sevens-duel-game/`

**Step 2: Validate YAML syntax**

Run:

```bash
ruby -e 'require "yaml"; YAML.load_file(".github/workflows/verify-static-host-builds.yml")'
```

Expected: no output and exit code `0`.

### Task 2: Clarify the GitHub Pages Deployment Workflow

**Files:**
- Modify: `/Users/liuwei/workspace/sevens-duel-game/.github/workflows/deploy-github-pages.yml`

**Step 1: Add an ownership comment**

At the top of `/Users/liuwei/workspace/sevens-duel-game/.github/workflows/deploy-github-pages.yml`, add a short comment that states:

- this workflow only publishes GitHub Pages
- Cloudflare Pages is intentionally handled by Cloudflare Git integration

**Step 2: Validate YAML syntax**

Run:

```bash
ruby -e 'require "yaml"; YAML.load_file(".github/workflows/deploy-github-pages.yml")'
```

Expected: no output and exit code `0`.

### Task 3: Rewrite the Deployment Documentation

**Files:**
- Modify: `/Users/liuwei/workspace/sevens-duel-game/docs/deployment.md`
- Modify: `/Users/liuwei/workspace/sevens-duel-game/README.md`

**Step 1: Update `docs/deployment.md`**

Make the guide describe the chosen dual-deployment model:

- Cloudflare Pages is the primary host.
- GitHub Pages is the fallback host.
- GitHub Actions does not upload to Cloudflare.
- Cloudflare should track `main` using Git integration.
- The repository contains CI that verifies both build targets.

**Step 2: Update `README.md`**

Rewrite the deployment summary so readers can tell at a glance:

- both public URLs exist
- which platform is primary vs fallback
- which automation path each platform uses

**Step 3: Verify the prose is consistent**

Run:

```bash
rg -n "Cloudflare|GitHub Pages|双部署|Git integration|VITE_BASE_PATH" README.md docs/deployment.md .github/workflows
```

Expected: references are consistent and do not describe GitHub Actions as directly deploying Cloudflare.

### Task 4: Run Build Verification

**Files:**
- No additional file changes

**Step 1: Verify Cloudflare-style build**

Run:

```bash
npm run build
```

Expected: success with the default root-path build.

**Step 2: Verify GitHub Pages-style build**

Run:

```bash
env VITE_BASE_PATH=/sevens-duel-game/ npm run build
```

Expected: success with the GitHub Pages subpath build.

**Step 3: Final diff review**

Run:

```bash
git diff -- .github/workflows README.md docs/deployment.md docs/plans
```

Expected: only dual-deployment workflow and documentation changes appear.
