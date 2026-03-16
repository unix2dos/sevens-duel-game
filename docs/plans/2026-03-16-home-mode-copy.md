# Home Mode Copy Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Add clear `儿童 / 标准 / 挑战` mode descriptions to the home screen and README while removing any misleading mention of automatic child-mode actions.

**Architecture:** Keep the change copy-only. Extend the existing home screen difficulty area with a small explanatory section, then mirror the same wording in README so the app UI and repository docs stay aligned. Use TDD by first asserting the new copy appears on the home screen.

**Tech Stack:** React, TypeScript, Vitest, Testing Library, Markdown

---

### Task 1: Lock the homepage copy with a failing test

**Files:**
- Modify: `src/ui/__tests__/flow.test.tsx`

**Step 1: Write the failing test**

Add assertions that the home screen renders short descriptions for `儿童`、`标准`、`挑战`.

**Step 2: Run test to verify it fails**

Run: `npm run test -- src/ui/__tests__/flow.test.tsx`
Expected: FAIL because the new mode description copy is not rendered yet.

### Task 2: Render the mode descriptions on the home screen

**Files:**
- Modify: `src/ui/screens/HomeScreen.tsx`
- Modify: `src/App.css`

**Step 1: Add the copy block**

Render a short three-item description section directly under the difficulty picker.

**Step 2: Add minimal styling**

Style the new section to match the existing home hero and remain readable on desktop and mobile.

**Step 3: Run the focused test**

Run: `npm run test -- src/ui/__tests__/flow.test.tsx`
Expected: PASS.

### Task 3: Mirror the copy in README

**Files:**
- Modify: `README.md`

**Step 1: Add a “模式说明” subsection**

Document the current differences between `儿童 / 标准 / 挑战` in user-facing language.

**Step 2: Remove misleading wording if found**

Ensure README does not imply child mode auto-borrows or auto-plays for the player.

### Task 4: Final verification

**Files:**
- No code changes

**Step 1: Run targeted tests**

Run: `npm run test -- src/ui/__tests__/flow.test.tsx`
Expected: PASS.

**Step 2: Review diff**

Confirm only homepage copy, README copy, styles, and related docs/tests changed.
