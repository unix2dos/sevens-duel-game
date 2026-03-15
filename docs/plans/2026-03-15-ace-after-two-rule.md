# Ace After Two Rule Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Change the game so `A` is only playable after `2`, not after `K`, and render `A` on the same side as the low-card chain.

**Architecture:** Keep the change localized to the existing order-based rules engine and the view-layer sorting helpers. Reuse a shared visual rank order so the rules, board layout, and hand presentation stay consistent.

**Tech Stack:** TypeScript, React, PixiJS, Vitest

---

### Task 1: Lock The New Rule With Tests

**Files:**
- Modify: `src/game/core/__tests__/rules.test.ts`
- Test: `src/game/core/__tests__/rules.test.ts`

**Step 1: Write the failing test**

Add assertions that:
- `A` is illegal after `K`
- `A` is legal after `2`
- `getLegalCards` excludes `A` when only `K` is present

**Step 2: Run test to verify it fails**

Run: `npm run test -- src/game/core/__tests__/rules.test.ts`
Expected: FAIL because current order still allows `K -> A`

**Step 3: Write minimal implementation**

Update the rule order arrays in `src/game/core/rules.ts`.

**Step 4: Run test to verify it passes**

Run: `npm run test -- src/game/core/__tests__/rules.test.ts`
Expected: PASS

### Task 2: Align Visual Ordering

**Files:**
- Modify: `src/scene/pixi/layers/SuitBoardLayer.ts`
- Modify: `src/ui/cardPresentation.ts`
- Create or modify test: `src/scene/pixi/layers/__tests__/suitBoardLayer.test.ts`

**Step 1: Write the failing test**

Add a test that renders a suit lane containing `A` and `2`, then verify `A` is placed farther out on the low-card side than `2`.

**Step 2: Run test to verify it fails**

Run: `npm run test -- src/scene/pixi/layers/__tests__/suitBoardLayer.test.ts`
Expected: FAIL because the current board treats `A` as the highest card.

**Step 3: Write minimal implementation**

Introduce a shared visual rank order where `A` sorts before `2`, then use it in:
- `src/scene/pixi/layers/SuitBoardLayer.ts`
- `src/ui/cardPresentation.ts`

**Step 4: Run test to verify it passes**

Run: `npm run test -- src/scene/pixi/layers/__tests__/suitBoardLayer.test.ts`
Expected: PASS

### Task 3: Full Verification

**Files:**
- Verify only

**Step 1: Run targeted tests**

Run: `npm run test -- src/game/core/__tests__/rules.test.ts src/scene/pixi/layers/__tests__/suitBoardLayer.test.ts`
Expected: PASS

**Step 2: Run full project verification**

Run:
- `npm run test`
- `npm run lint`
- `npm run build`

Expected:
- tests all pass
- lint exits 0
- build exits 0
