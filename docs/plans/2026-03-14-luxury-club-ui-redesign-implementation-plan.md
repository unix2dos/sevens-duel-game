# Luxury Club UI Redesign Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Rebuild the Sevens Duel web app into a luxury club card-table experience with real-looking poker cards, a simplified three-layer match screen, and a Pixi-first gameplay scene while preserving the existing rules and AI.

**Architecture:** Keep the TypeScript rules engine and AI intact. Move the gameplay screen to a Pixi-first scene with layered rendering for top status, opponent deck, four suit lanes, transient toasts, and the player hand rail. Use React only for page shells such as home, rules dialog, and result screen, but restyle them to match the same visual system.

**Tech Stack:** React 19, TypeScript, Vite, PixiJS 8, Vitest, React Testing Library, Playwright, npm

---

### Task 1: Lock the New Information Architecture with Failing Tests

**Files:**
- Modify: `/Users/liuwei/workspace/sevens-duel-web/src/ui/__tests__/child-mode.test.tsx`
- Modify: `/Users/liuwei/workspace/sevens-duel-web/src/ui/__tests__/flow.test.tsx`
- Modify: `/Users/liuwei/workspace/sevens-duel-web/e2e/smoke.spec.ts`

**Step 1: Write a failing UI test for the simplified gameplay structure**

Update `/Users/liuwei/workspace/sevens-duel-web/src/ui/__tests__/flow.test.tsx` with a new test that asserts:

- the match screen still shows a `canvas`
- the old large `事件流` side panel is not required as a dominant interaction area
- the player interaction is centered on a single hand rail instead of action cards plus a full hand grid

Example target assertions:

```tsx
expect(screen.queryByText(/当前可打/i)).not.toBeInTheDocument();
expect(screen.queryByRole("region", { name: /玩家控制台/i })).not.toBeInTheDocument();
expect(screen.getByTestId("table-stage")).toBeInTheDocument();
```

**Step 2: Add a failing end-to-end layout check**

Update `/Users/liuwei/workspace/sevens-duel-web/e2e/smoke.spec.ts` so the test expects:

- top summary visible
- gameplay canvas visible
- no DOM-based legal-action rack

Expected first run: FAIL, because the current gameplay page still exposes the DOM-based console.

**Step 3: Run the targeted tests and confirm failure**

Run:

```bash
cd /Users/liuwei/workspace/sevens-duel-web
npx vitest run src/ui/__tests__/flow.test.tsx src/ui/__tests__/child-mode.test.tsx
npx playwright test e2e/smoke.spec.ts --project=desktop
```

Expected: at least one assertion fails against the current layout.

**Step 4: Commit**

```bash
cd /Users/liuwei/workspace/sevens-duel-web
git add src/ui/__tests__/flow.test.tsx src/ui/__tests__/child-mode.test.tsx e2e/smoke.spec.ts
git commit -m "test: lock luxury table information architecture"
```

### Task 2: Build a Real Poker Card Rendering System for Pixi

**Files:**
- Create: `/Users/liuwei/workspace/sevens-duel-web/src/scene/pixi/cards/cardTheme.ts`
- Create: `/Users/liuwei/workspace/sevens-duel-web/src/scene/pixi/cards/cardGlyphs.ts`
- Create: `/Users/liuwei/workspace/sevens-duel-web/src/scene/pixi/cards/PokerCardSprite.ts`
- Create: `/Users/liuwei/workspace/sevens-duel-web/src/scene/pixi/cards/CardBackSprite.ts`
- Modify: `/Users/liuwei/workspace/sevens-duel-web/src/scene/pixi/CardView.ts`
- Test: `/Users/liuwei/workspace/sevens-duel-web/src/game/match/__tests__/engine.test.ts`

**Step 1: Write a failing helper test for display metadata**

Create a small pure helper test in an existing test file or add a new one under `/Users/liuwei/workspace/sevens-duel-web/src/scene/pixi/cards/__tests__/cardGlyphs.test.ts` that verifies:

- `hearts` and `diamonds` resolve to warm/red styling
- `spades` and `clubs` resolve to dark styling
- rank text and suit glyph mapping are correct

**Step 2: Run the test and confirm failure**

Run:

```bash
cd /Users/liuwei/workspace/sevens-duel-web
npx vitest run src/scene/pixi/cards/__tests__/cardGlyphs.test.ts
```

Expected: FAIL because the card rendering helpers do not exist yet.

**Step 3: Create the card theme and glyph helpers**

Implement:

- `cardTheme.ts` for ivory paper, border, ink, legal glow, illegal dimming, and back-pattern colors
- `cardGlyphs.ts` for suit symbols, rank strings, and suit tone helpers

Keep these files pure and reusable.

**Step 4: Replace the current synthetic card face with a true poker card**

Implement `PokerCardSprite.ts` and `CardBackSprite.ts` to draw:

- proper rounded ivory card body
- clear border and paper shadow
- top-left rank + suit corner mark
- centered rank or simplified face-card treatment
- consistent back-of-card pattern

Then update `/Users/liuwei/workspace/sevens-duel-web/src/scene/pixi/CardView.ts` to delegate rendering to the new sprites.

**Step 5: Run the new and existing tests**

Run:

```bash
cd /Users/liuwei/workspace/sevens-duel-web
npx vitest run src/scene/pixi/cards/__tests__/cardGlyphs.test.ts src/game/match/__tests__/engine.test.ts
```

Expected: PASS.

**Step 6: Commit**

```bash
cd /Users/liuwei/workspace/sevens-duel-web
git add src/scene/pixi/cards src/scene/pixi/CardView.ts
git commit -m "feat: add real poker card rendering system"
```

### Task 3: Replace the DOM-Heavy Match Screen with a Pixi-First Table Scene

**Files:**
- Create: `/Users/liuwei/workspace/sevens-duel-web/src/scene/pixi/layout/tableLayout.ts`
- Create: `/Users/liuwei/workspace/sevens-duel-web/src/scene/pixi/layers/TopStatusLayer.ts`
- Create: `/Users/liuwei/workspace/sevens-duel-web/src/scene/pixi/layers/OpponentLayer.ts`
- Create: `/Users/liuwei/workspace/sevens-duel-web/src/scene/pixi/layers/SuitBoardLayer.ts`
- Create: `/Users/liuwei/workspace/sevens-duel-web/src/scene/pixi/layers/PlayerHandLayer.ts`
- Create: `/Users/liuwei/workspace/sevens-duel-web/src/scene/pixi/layers/TransientFeedLayer.ts`
- Modify: `/Users/liuwei/workspace/sevens-duel-web/src/scene/pixi/TableView.ts`
- Modify: `/Users/liuwei/workspace/sevens-duel-web/src/scene/pixi/GameScene.tsx`
- Modify: `/Users/liuwei/workspace/sevens-duel-web/src/ui/screens/GameScreen.tsx`

**Step 1: Write a failing structure test**

Update `/Users/liuwei/workspace/sevens-duel-web/src/ui/__tests__/flow.test.tsx` to assert that:

- the old `PlayerConsole` is gone
- the DOM no longer renders a large hand grid
- gameplay still starts and the canvas remains visible

Expected first run: FAIL.

**Step 2: Implement a scene layout model**

Create `/Users/liuwei/workspace/sevens-duel-web/src/scene/pixi/layout/tableLayout.ts` with pure functions to compute:

- top safe area
- four suit lane rectangles
- player hand rail rectangle
- transient message anchor
- opponent card anchor

This keeps responsive math out of rendering components.

**Step 3: Split the Pixi table into layers**

Implement:

- `TopStatusLayer.ts`
- `OpponentLayer.ts`
- `SuitBoardLayer.ts`
- `PlayerHandLayer.ts`
- `TransientFeedLayer.ts`

Each layer should receive only the state it needs. Do not keep all layout, drawing, and interaction inside one monolithic `TableView`.

**Step 4: Update `TableView.ts` to compose the layers**

Make `/Users/liuwei/workspace/sevens-duel-web/src/scene/pixi/TableView.ts` responsible only for:

- scene background
- layer composition
- z-order

**Step 5: Strip DOM-heavy gameplay UI**

Update `/Users/liuwei/workspace/sevens-duel-web/src/ui/screens/GameScreen.tsx` so the match page becomes a thin shell around the canvas. Remove:

- DOM-based action rack
- DOM-based hand grid
- large side event panel

Keep only minimal shell elements if absolutely required.

**Step 6: Run tests**

Run:

```bash
cd /Users/liuwei/workspace/sevens-duel-web
npx vitest run src/ui/__tests__/flow.test.tsx
npx playwright test e2e/smoke.spec.ts --project=desktop
```

Expected: PASS.

**Step 7: Commit**

```bash
cd /Users/liuwei/workspace/sevens-duel-web
git add src/scene/pixi src/ui/screens/GameScreen.tsx src/ui/__tests__/flow.test.tsx e2e/smoke.spec.ts
git commit -m "feat: move gameplay screen to pixi-first table scene"
```

### Task 4: Implement the Four Suit Lanes and Real Hand Rail Interaction

**Files:**
- Modify: `/Users/liuwei/workspace/sevens-duel-web/src/scene/pixi/layers/SuitBoardLayer.ts`
- Modify: `/Users/liuwei/workspace/sevens-duel-web/src/scene/pixi/layers/PlayerHandLayer.ts`
- Modify: `/Users/liuwei/workspace/sevens-duel-web/src/scene/pixi/layout/tableLayout.ts`
- Modify: `/Users/liuwei/workspace/sevens-duel-web/src/game/match/engine.ts`
- Test: `/Users/liuwei/workspace/sevens-duel-web/src/game/match/__tests__/engine.test.ts`
- Test: `/Users/liuwei/workspace/sevens-duel-web/src/ui/__tests__/child-mode.test.tsx`

**Step 1: Write a failing regression test for illegal hand interaction**

Add or update a test to assert:

- illegal clicks do not crash
- legal cards are still playable

If the existing `ignores illegal player clicks instead of crashing the match` test already covers this, extend UI-level tests to assert only legal cards are visually emphasized.

**Step 2: Implement the four-lane vertical suit layout**

Update `SuitBoardLayer.ts` so each suit lane:

- renders the `7` slot at center
- places smaller ranks upward
- places larger ranks downward
- shows restrained unopened placeholders

The lane must look like a table card position, not a boxed dashboard widget.

**Step 3: Implement the hand rail**

Update `PlayerHandLayer.ts` so:

- cards form a single bottom row
- cards slightly overlap
- legal cards lift and brighten
- illegal cards remain visible but quieter
- click hit areas remain generous enough for touch play

**Step 4: Keep the engine guard**

Ensure `/Users/liuwei/workspace/sevens-duel-web/src/game/match/engine.ts` still ignores illegal human play attempts and never throws.

**Step 5: Run targeted tests**

Run:

```bash
cd /Users/liuwei/workspace/sevens-duel-web
npx vitest run src/game/match/__tests__/engine.test.ts src/ui/__tests__/child-mode.test.tsx
```

Expected: PASS.

**Step 6: Commit**

```bash
cd /Users/liuwei/workspace/sevens-duel-web
git add src/scene/pixi/layers src/scene/pixi/layout/tableLayout.ts src/game/match/engine.ts src/game/match/__tests__/engine.test.ts src/ui/__tests__/child-mode.test.tsx
git commit -m "feat: add luxury suit lanes and hand rail interaction"
```

### Task 5: Add Cinematic Motion and Transient Table Feedback

**Files:**
- Create: `/Users/liuwei/workspace/sevens-duel-web/src/scene/pixi/animation/timings.ts`
- Create: `/Users/liuwei/workspace/sevens-duel-web/src/scene/pixi/animation/tweens.ts`
- Modify: `/Users/liuwei/workspace/sevens-duel-web/src/scene/pixi/layers/TransientFeedLayer.ts`
- Modify: `/Users/liuwei/workspace/sevens-duel-web/src/scene/pixi/layers/PlayerHandLayer.ts`
- Modify: `/Users/liuwei/workspace/sevens-duel-web/src/scene/pixi/layers/OpponentLayer.ts`
- Modify: `/Users/liuwei/workspace/sevens-duel-web/src/scene/pixi/GameScene.tsx`
- Modify: `/Users/liuwei/workspace/sevens-duel-web/src/game/core/events.ts`
- Test: `/Users/liuwei/workspace/sevens-duel-web/e2e/smoke.spec.ts`

**Step 1: Write a failing smoke expectation for in-table feedback**

Extend the smoke spec to assert that after a player action the table exposes one transient textual cue, for example:

- `轮到你`
- `你打出`
- `借到`

Expected first run: FAIL because the current scene does not yet manage short-lived table toasts.

**Step 2: Create small animation utilities**

Implement:

- `timings.ts` for shared durations and easing constants
- `tweens.ts` for simple Pixi tween helpers

Keep these lightweight and deterministic.

**Step 3: Add transient table feedback**

Update `TransientFeedLayer.ts` so it can render recent action summaries near the board center/top and auto-fade them out.

**Step 4: Add cinematic movement for key actions**

Implement restrained motion for:

- dealing
- card play from hand to lane
- borrow from opponent area
- result emphasis

Avoid heavy particles. The movement should improve comprehension, not clutter.

**Step 5: Run smoke verification**

Run:

```bash
cd /Users/liuwei/workspace/sevens-duel-web
npx playwright test e2e/smoke.spec.ts
```

Expected: PASS on desktop and mobile.

**Step 6: Commit**

```bash
cd /Users/liuwei/workspace/sevens-duel-web
git add src/scene/pixi src/game/core/events.ts e2e/smoke.spec.ts
git commit -m "feat: add cinematic table feedback and motion"
```

### Task 6: Unify Home, Rules, and Result Screens with the New Visual System

**Files:**
- Modify: `/Users/liuwei/workspace/sevens-duel-web/src/App.css`
- Modify: `/Users/liuwei/workspace/sevens-duel-web/src/index.css`
- Modify: `/Users/liuwei/workspace/sevens-duel-web/src/ui/screens/HomeScreen.tsx`
- Modify: `/Users/liuwei/workspace/sevens-duel-web/src/ui/screens/ResultScreen.tsx`
- Modify: `/Users/liuwei/workspace/sevens-duel-web/src/ui/components/RulesDialog.tsx`
- Modify: `/Users/liuwei/workspace/sevens-duel-web/src/ui/components/DifficultyPicker.tsx`
- Test: `/Users/liuwei/workspace/sevens-duel-web/src/smoke/app-shell.test.tsx`

**Step 1: Write a failing shell test for the new tone**

Extend `/Users/liuwei/workspace/sevens-duel-web/src/smoke/app-shell.test.tsx` to assert:

- the home screen still has `开始游戏`
- difficulty selection remains present
- the rules dialog remains reachable

Expected: may already pass, but keep it as a guard before visual restructuring.

**Step 2: Rework the page shells**

Update:

- `HomeScreen.tsx` to feel like a high-end card room invitation rather than a dashboard
- `RulesDialog.tsx` to read like a rules card
- `ResultScreen.tsx` to feel like a table-end resolution

**Step 3: Rebuild the CSS tokens**

Update `/Users/liuwei/workspace/sevens-duel-web/src/index.css` and `/Users/liuwei/workspace/sevens-duel-web/src/App.css` to replace cyber-heavy styling with:

- velvet-table background tokens
- ivory card palette
- restrained metallic accents
- consistent type scale
- consistent spacing and shadows

**Step 4: Run shell tests and build**

Run:

```bash
cd /Users/liuwei/workspace/sevens-duel-web
npx vitest run src/smoke/app-shell.test.tsx
npm run build
```

Expected: PASS.

**Step 5: Commit**

```bash
cd /Users/liuwei/workspace/sevens-duel-web
git add src/App.css src/index.css src/ui/screens/HomeScreen.tsx src/ui/screens/ResultScreen.tsx src/ui/components/RulesDialog.tsx src/ui/components/DifficultyPicker.tsx src/smoke/app-shell.test.tsx
git commit -m "feat: unify shell screens with luxury club visual system"
```

### Task 7: Full Verification and Final QA Sweep

**Files:**
- Verify only

**Step 1: Run unit and integration tests**

```bash
cd /Users/liuwei/workspace/sevens-duel-web
npm run test
```

Expected: PASS.

**Step 2: Run lint**

```bash
cd /Users/liuwei/workspace/sevens-duel-web
npm run lint
```

Expected: PASS.

**Step 3: Run production build**

```bash
cd /Users/liuwei/workspace/sevens-duel-web
npm run build
```

Expected: PASS.

**Step 4: Run browser smoke**

```bash
cd /Users/liuwei/workspace/sevens-duel-web
npx playwright test e2e/smoke.spec.ts
```

Expected: PASS on desktop and mobile.

**Step 5: Manual visual checks**

Manually confirm:

- the board reads as four clean suit areas
- cards look like actual poker cards
- the player hand is a single bottom rail
- top status is minimal
- recent actions are understandable without a persistent event column

**Step 6: Commit**

```bash
cd /Users/liuwei/workspace/sevens-duel-web
git add -A
git commit -m "feat: ship luxury club ui redesign"
```
