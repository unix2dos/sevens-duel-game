# Suit Completion Flip Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Replay a one-time full-column flip animation when a suit becomes complete.

**Architecture:** Detect newly completed suits in the Pixi scene layer by comparing the previous and current layout, then pass celebration flags down to the suit board and card sprite layers. Keep the feature entirely in rendering code so core game rules and events remain unchanged.

**Tech Stack:** TypeScript, React, PixiJS, Vitest

---

### Task 1: Lock The Trigger Logic

**Files:**
- Create: `src/scene/pixi/__tests__/suitCelebration.test.ts`
- Create: `src/scene/pixi/suitCelebration.ts`

**Step 1: Write the failing test**

Add tests that:
- return the completed suit when a suit count moves from 12 to 13
- return nothing when the suit was already complete
- return nothing on first render

**Step 2: Run test to verify it fails**

Run: `npm run test -- src/scene/pixi/__tests__/suitCelebration.test.ts`
Expected: FAIL because helper does not exist yet

**Step 3: Write minimal implementation**

Implement a pure helper that compares previous and next layouts and returns newly completed suits.

**Step 4: Run test to verify it passes**

Run: `npm run test -- src/scene/pixi/__tests__/suitCelebration.test.ts`
Expected: PASS

### Task 2: Mark A Whole Suit For Replay

**Files:**
- Modify: `src/scene/pixi/layers/SuitBoardLayer.ts`
- Modify: `src/scene/pixi/TableView.ts`
- Modify: `src/scene/pixi/GameScene.tsx`
- Modify: `src/scene/pixi/layers/__tests__/suitBoardLayer.test.ts`

**Step 1: Write the failing test**

Update `suitBoardLayer.test.ts` so a completed suit requires every card view in that suit lane to receive `replayFlip`.

**Step 2: Run test to verify it fails**

Run: `npm run test -- src/scene/pixi/layers/__tests__/suitBoardLayer.test.ts`
Expected: FAIL because the replay flag is not propagated

**Step 3: Write minimal implementation**

Thread a celebration suit set through the scene/view/layer stack and set `replayFlip` for the completed suit lane.

**Step 4: Run test to verify it passes**

Run: `npm run test -- src/scene/pixi/layers/__tests__/suitBoardLayer.test.ts`
Expected: PASS

### Task 3: Add The Flip Animation Path

**Files:**
- Modify: `src/scene/pixi/CardView.ts`
- Modify: `src/scene/pixi/cards/PokerCardSprite.ts`
- Create: `src/scene/pixi/cards/__tests__/pokerCardSprite.test.ts`

**Step 1: Write the failing test**

Add a test showing `replayFlip: true` registers a ticker-driven animation path even when `animateEntrance` is false.

**Step 2: Run test to verify it fails**

Run: `npm run test -- src/scene/pixi/cards/__tests__/pokerCardSprite.test.ts`
Expected: FAIL because `replayFlip` does not exist

**Step 3: Write minimal implementation**

Add a one-shot flip animation to `PokerCardSprite` and plumb the flag through `CardView`.

**Step 4: Run test to verify it passes**

Run: `npm run test -- src/scene/pixi/cards/__tests__/pokerCardSprite.test.ts`
Expected: PASS

### Task 4: Verify The Whole Feature

**Files:**
- Verify only

**Step 1: Run targeted tests**

Run: `npm run test -- src/scene/pixi/__tests__/suitCelebration.test.ts src/scene/pixi/layers/__tests__/suitBoardLayer.test.ts src/scene/pixi/cards/__tests__/pokerCardSprite.test.ts`
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
