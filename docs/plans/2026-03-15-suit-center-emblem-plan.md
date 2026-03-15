# Suit Center Emblem Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Show a full-size suit emblem placeholder before a suit's real `7` is played, then switch back to the standard `7` once it reaches the board.

**Architecture:** Keep the existing Pixi card rendering pipeline intact and add a face rendering variant for suit placeholders only. The suit board layer decides whether the center slot should render a placeholder card or the real `7`, so the standard `7` artwork remains unchanged once played.

**Tech Stack:** TypeScript, React, PixiJS, Vitest

---

### Task 1: Lock The SVG Variant Contract

**Files:**
- Create: `src/scene/pixi/cards/__tests__/cardSvg.test.ts`
- Modify: `src/scene/pixi/cards/cardSvg.ts`

**Step 1: Write the failing test**

Add a test that builds a `suit-emblem` face for `spades-7` and asserts:
- the SVG contains `♠`
- the SVG does not contain a corner rank text node for `7`
- the SVG does not contain the standard pip layout for rank `7`

**Step 2: Run test to verify it fails**

Run: `npm run test -- src/scene/pixi/cards/__tests__/cardSvg.test.ts`
Expected: FAIL because the variant does not exist yet

**Step 3: Write minimal implementation**

Add a card face variant option and generate a dedicated center-only emblem face when the variant is `suit-emblem`.

**Step 4: Run test to verify it passes**

Run: `npm run test -- src/scene/pixi/cards/__tests__/cardSvg.test.ts`
Expected: PASS

### Task 2: Thread The Variant Through Card Rendering

**Files:**
- Modify: `src/scene/pixi/CardView.ts`
- Modify: `src/scene/pixi/cards/PokerCardSprite.ts`

**Step 1: Write the failing test**

Use the layer-level test in Task 3 to expose that the center card cannot yet pass a face variant through the card rendering chain.

**Step 2: Run test to verify it fails**

Run: `npm run test -- src/scene/pixi/layers/__tests__/suitBoardLayer.test.ts`
Expected: FAIL because the center card call does not expose the new variant

**Step 3: Write minimal implementation**

Add an optional `faceVariant` prop to `CardView` and `PokerCardSprite`, defaulting to standard rendering.

**Step 4: Run test to verify it passes**

Run: `npm run test -- src/scene/pixi/layers/__tests__/suitBoardLayer.test.ts`
Expected: PASS once the layer also uses the new prop

### Task 3: Apply The Variant Only To Placeholder Center Cards

**Files:**
- Modify: `src/scene/pixi/layers/SuitBoardLayer.ts`
- Modify: `src/scene/pixi/layers/__tests__/suitBoardLayer.test.ts`

**Step 1: Write the failing test**

Update the suit board layer test to assert:
- before a suit's `7` is played, the center slot uses a `seed-...` placeholder card with `faceVariant: "suit-emblem"`
- after the real `7` is on the board, the placeholder disappears and the center slot uses the real `7` with the default face

**Step 2: Run test to verify it fails**

Run: `npm run test -- src/scene/pixi/layers/__tests__/suitBoardLayer.test.ts`
Expected: FAIL because the center slot still treats the real `7` as the placeholder

**Step 3: Write minimal implementation**

Pass `faceVariant: "suit-emblem"` only when creating a placeholder center card, and render the real `7` at center once it exists in the suit layout.

**Step 4: Run test to verify it passes**

Run: `npm run test -- src/scene/pixi/layers/__tests__/suitBoardLayer.test.ts`
Expected: PASS

### Task 4: Verify The Change

**Files:**
- Verify only

**Step 1: Run targeted tests**

Run: `npm run test -- src/scene/pixi/cards/__tests__/cardSvg.test.ts src/scene/pixi/layers/__tests__/suitBoardLayer.test.ts src/scene/pixi/cards/__tests__/cardView.test.ts src/scene/pixi/cards/__tests__/pokerCardSprite.test.ts`
Expected: PASS

**Step 2: Run broader project verification**

Run:
- `npm run test -- src/scene/pixi/cards/__tests__/cardSvg.test.ts src/scene/pixi/layers/__tests__/suitBoardLayer.test.ts src/scene/pixi/cards/__tests__/cardView.test.ts src/scene/pixi/cards/__tests__/pokerCardSprite.test.ts`
- `npm run build`

Expected:
- targeted tests pass
- build exits 0
