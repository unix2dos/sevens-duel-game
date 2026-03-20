# Home CTA Priority Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Reorder and restyle the home screen so the `开始游戏` CTA is visible in the first viewport across phone, tablet, and desktop widths without changing the existing start-button validation rules.

**Architecture:** Keep the change localized to the existing home screen and global app-shell CSS. First lock the intended DOM order and viewport behavior with tests, then move the CTA block ahead of the mode guide and relax the home-screen scroll constraints so wider tablet layouts no longer trap content below the fold.

**Tech Stack:** React, TypeScript, CSS, Vitest, Testing Library, Playwright

---

### Task 1: Lock the homepage CTA structure with failing tests

**Files:**
- Modify: `src/ui/__tests__/flow.test.tsx`
- Modify: `e2e/smoke.spec.ts`

**Step 1: Write the failing unit test**

Assert that the `开始游戏` button is rendered after the difficulty picker and before the mode guide section in the home-screen DOM order.

**Step 2: Write the failing viewport test**

Add a Playwright test that checks `开始游戏` is visible in the initial viewport for four sizes: `390x844`, `768x1024`, `1024x768`, and `1440x900`.

**Step 3: Run tests to verify they fail**

Run: `npm run test -- src/ui/__tests__/flow.test.tsx`
Expected: FAIL because the CTA still renders after the mode guide.

Run: `npm run test:e2e -- --grep "home CTA"`
Expected: FAIL on at least the tablet landscape viewport before the layout fix.

### Task 2: Reorder the home screen content

**Files:**
- Modify: `src/ui/screens/HomeScreen.tsx`

**Step 1: Move the CTA block**

Render the `hero-actions` block immediately after the difficulty picker and before the mode guide.

**Step 2: Preserve existing controls**

Keep the existing `开始游戏 / 规则说明 / 音效` buttons and the current `playerName` validation behavior unchanged.

**Step 3: Keep all existing copy blocks**

Retain the title, hero copy, mode guide, home tableau, and footer.

### Task 3: Fix homepage scroll and breakpoint behavior

**Files:**
- Modify: `src/App.css`
- Modify: `src/index.css`

**Step 1: Allow homepage vertical overflow**

Update the shared app-shell styles so the home screen can grow beyond the viewport height and scroll vertically on tablet and desktop widths when needed.

**Step 2: Tune the home breakpoints**

Adjust the home-shell grid and spacing rules so tablet widths do not force a cramped desktop-style layout that pushes the CTA below the fold.

**Step 3: Preserve gameplay constraints**

Limit the scroll and touch-action changes to the home screen so the game table remains full-screen and non-scrolling.

### Task 4: Verify the fix end-to-end

**Files:**
- No code changes

**Step 1: Run focused unit tests**

Run: `npm run test -- src/ui/__tests__/flow.test.tsx src/smoke/app-shell.test.tsx`
Expected: PASS.

**Step 2: Run focused E2E tests**

Run: `npm run test:e2e -- --grep "home CTA|user can start a game"`
Expected: PASS.

**Step 3: Run full relevant verification**

Run: `npm run test`
Expected: PASS.

**Step 4: Review diff**

Confirm only the planned homepage files, tests, and design docs changed.
