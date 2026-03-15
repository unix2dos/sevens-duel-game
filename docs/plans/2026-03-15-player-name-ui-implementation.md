# Player Name UI Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Add a required player-name input on the home screen and replace all player-facing "你/你的" UI text with that name throughout the game flow.

**Architecture:** Keep a single `playerName` source of truth in `App`, validate it before creating a match, and thread it through the existing screen/layer tree. Centralize player-facing labels in the components that already own those strings so Pixi and React views stay consistent without changing game-engine state.

**Tech Stack:** React 19, TypeScript, PixiJS, Vitest, Testing Library

---

### Task 1: Lock Start-Flow Validation

**Files:**
- Modify: `src/ui/__tests__/flow.test.tsx`
- Modify: `src/ui/screens/HomeScreen.tsx`
- Modify: `src/App.tsx`

**Step 1: Write the failing test**

Add tests that verify:
- the home screen renders a required player-name input
- clicking `开始游戏` with an empty or whitespace-only name does not enter the game
- entering a non-empty name allows the game to start

**Step 2: Run test to verify it fails**

Run: `npm run test -- src/ui/__tests__/flow.test.tsx`
Expected: FAIL because the input and validation do not exist yet

**Step 3: Write minimal implementation**

- Add `playerName` state in `App`
- Pass it into `HomeScreen`
- Add a controlled input on the home screen
- Block `onStart` when `playerName.trim()` is empty

**Step 4: Run test to verify it passes**

Run: `npm run test -- src/ui/__tests__/flow.test.tsx`
Expected: PASS

### Task 2: Thread Player Name Through UI

**Files:**
- Modify: `src/App.tsx`
- Modify: `src/ui/screens/GameScreen.tsx`
- Modify: `src/ui/screens/ResultScreen.tsx`
- Modify: `src/ui/components/ResultStats.tsx`
- Modify: `src/scene/pixi/GameScene.tsx`
- Modify: `src/scene/pixi/TableView.ts`
- Modify: `src/scene/pixi/layers/TopStatusLayer.ts`
- Modify: `src/scene/pixi/layers/PlayerHandLayer.ts`
- Modify: `src/scene/pixi/layers/TransientFeedLayer.ts`

**Step 1: Write the failing test**

Add tests that verify:
- result and stats text use the player name
- the game view receives the player name for in-table UI labels

**Step 2: Run test to verify it fails**

Run: `npm run test -- src/ui/components/__tests__/ResultStats.test.tsx src/ui/screens/__tests__/ResultScreen.test.tsx src/ui/__tests__/flow.test.tsx`
Expected: FAIL because components still hardcode `你/你的`

**Step 3: Write minimal implementation**

- Thread `playerName` from `App` into both React and Pixi game surfaces
- Replace hardcoded player-facing copy with player-name-based strings
- Keep opponent labels unchanged

**Step 4: Run test to verify it passes**

Run: `npm run test -- src/ui/components/__tests__/ResultStats.test.tsx src/ui/screens/__tests__/ResultScreen.test.tsx src/ui/__tests__/flow.test.tsx`
Expected: PASS

### Task 3: Cover Persistence Across Replay And Home

**Files:**
- Modify: `src/ui/__tests__/flow.test.tsx`
- Modify: `src/App.tsx`

**Step 1: Write the failing test**

Add tests that verify:
- `再来一局` keeps the same player name
- returning home keeps the previous input value
- editing the name on home affects the next match

**Step 2: Run test to verify it fails**

Run: `npm run test -- src/ui/__tests__/flow.test.tsx`
Expected: FAIL because the flow is not preserving/verifying name usage yet

**Step 3: Write minimal implementation**

- Ensure `playerName` lives above screen transitions
- Reuse the same value for replay
- Keep the controlled input value when navigating back home

**Step 4: Run test to verify it passes**

Run: `npm run test -- src/ui/__tests__/flow.test.tsx`
Expected: PASS

### Task 4: Project Verification

**Files:**
- Verify only

**Step 1: Run targeted tests**

Run: `npm run test -- src/ui/__tests__/flow.test.tsx src/ui/components/__tests__/ResultStats.test.tsx src/ui/screens/__tests__/ResultScreen.test.tsx`
Expected: PASS

**Step 2: Run full verification**

Run:
- `npm run test`
- `npm run lint`
- `npm run build`

Expected:
- all tests pass
- lint exits 0
- build exits 0
