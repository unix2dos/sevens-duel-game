# Card Corner Index Enlargement Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Enlarge the corner rank/suit indices on standard card faces so overlapped hand cards can be scanned faster without changing gameplay or overall card layout.

**Architecture:** Keep the change inside the shared SVG card-face generator so both hand cards and board cards benefit automatically. Use TDD at the `buildCardFaceSvg` level, then adjust only the standard-face corner metrics while keeping the `suit-emblem` variant untouched.

**Tech Stack:** TypeScript, PixiJS, SVG card textures, Vitest

---

### Task 1: Lock The Visual Contract With Tests

**Files:**
- Modify: `src/scene/pixi/cards/__tests__/cardSvg.test.ts`
- Modify: `src/scene/pixi/cards/cardSvg.ts`

**Step 1: Write the failing test**

Add a test that builds a standard card face and asserts the SVG contains the enlarged corner metrics for:
- the new corner translate values
- the larger rank font size
- the larger suit font size

**Step 2: Run test to verify it fails**

Run: `npm run test -- src/scene/pixi/cards/__tests__/cardSvg.test.ts`
Expected: FAIL because the SVG still uses the old corner metrics.

**Step 3: Write minimal implementation**

- Update the shared corner layout values in `cornerMarkup`
- Apply the new metrics symmetrically to both corners
- Keep the `suit-emblem` branch unchanged

**Step 4: Run test to verify it passes**

Run: `npm run test -- src/scene/pixi/cards/__tests__/cardSvg.test.ts`
Expected: PASS

### Task 2: Preserve Non-Target Rendering Behavior

**Files:**
- Modify: `src/scene/pixi/cards/__tests__/cardSvg.test.ts`
- Modify: `src/scene/pixi/cards/cardSvg.ts`

**Step 1: Write or keep a guard test for the emblem variant**

Ensure there is still a test that verifies `faceVariant: "suit-emblem"`:
- renders one large suit symbol
- does not render rank corners

**Step 2: Run test to verify guard coverage**

Run: `npm run test -- src/scene/pixi/cards/__tests__/cardSvg.test.ts`
Expected: PASS for the emblem guard and FAIL only if corner changes bleed into that branch.

**Step 3: Refine implementation if needed**

- Confirm corner markup is only emitted for `standard`
- Do not change center pip / face-card / ace rendering

**Step 4: Run test to verify it passes**

Run: `npm run test -- src/scene/pixi/cards/__tests__/cardSvg.test.ts`
Expected: PASS

### Task 3: Project Verification

**Files:**
- Verify only

**Step 1: Run targeted visual-generator tests**

Run: `npm run test -- src/scene/pixi/cards/__tests__/cardSvg.test.ts src/scene/pixi/cards/__tests__/cardView.test.ts`
Expected: PASS

**Step 2: Run broader card rendering regression tests**

Run: `npm run test -- src/scene/pixi/cards/__tests__/cardGlyphs.test.ts src/scene/pixi/cards/__tests__/pokerCardSprite.test.ts`
Expected: PASS
