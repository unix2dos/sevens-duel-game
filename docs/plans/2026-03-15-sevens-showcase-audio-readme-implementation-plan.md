# Sevens Showcase Audio and README Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Add cinematic-but-controlled gameplay SFX, a showcase-first Chinese README with real screenshots and a GitHub-hosted demo video entry, and light product polish without changing the core game rules or AI behavior.

**Architecture:** Reuse the existing React/Vite application shell and current `useSound` integration instead of building a new audio engine. Add distributable runtime audio files under `public/assets/audio`, harden `src/audio` playback behavior and `src/App.tsx` event wiring, store README-only media under `docs/assets/showcase`, and rewrite the front half of `README.md` so it behaves like a product page before the developer docs.

**Tech Stack:** React 19, TypeScript, Vite, Howler, PixiJS 8, Vitest, React Testing Library, Playwright, npm

---

### Task 1: Lock the Showcase Audio Contract with Failing Tests

**Files:**
- Create: `/Users/liuwei/.codex/worktrees/d051/sevens-duel-game/src/audio/__tests__/sounds.test.ts`
- Create: `/Users/liuwei/.codex/worktrees/d051/sevens-duel-game/src/audio/__tests__/useSound.test.tsx`
- Modify: `/Users/liuwei/.codex/worktrees/d051/sevens-duel-game/src/test/setup.ts`

**Step 1: Write a failing source-definition test**

Create `/Users/liuwei/.codex/worktrees/d051/sevens-duel-game/src/audio/__tests__/sounds.test.ts` with assertions that every showcase sound has at least one local source file and a non-zero volume:

```ts
import { soundDefinitions } from "../sounds";

it("defines distributable sources for every showcase sound", () => {
  for (const [name, definition] of Object.entries(soundDefinitions)) {
    expect(definition.src?.length, `${name} should have at least one source`).toBeGreaterThan(0);
    expect(definition.src?.[0]).toMatch(/^\/assets\/audio\//);
    expect(definition.volume).toBeGreaterThan(0);
  }
});
```

**Step 2: Write a failing hook behavior test**

Create `/Users/liuwei/.codex/worktrees/d051/sevens-duel-game/src/audio/__tests__/useSound.test.tsx` and mock `howler` so the test can assert:

- `playSound()` does nothing when audio is disabled.
- `playSound("play")` calls the wrapped `Howl.play()` when audio is enabled.
- the hook does not throw if a sound definition is temporarily missing.

Suggested skeleton:

```tsx
import { renderHook } from "@testing-library/react";
import { vi } from "vitest";

const play = vi.fn();
const Howl = vi.fn(() => ({ play }));

vi.mock("howler", () => ({ Howl }));
```

**Step 3: Run the targeted tests and confirm failure**

Run:

```bash
cd /Users/liuwei/.codex/worktrees/d051/sevens-duel-game
npx vitest run src/audio/__tests__/sounds.test.ts src/audio/__tests__/useSound.test.tsx
```

Expected: FAIL because `soundDefinitions` currently has no `src`, and the hook contract is not yet covered.

**Step 4: Commit**

```bash
cd /Users/liuwei/.codex/worktrees/d051/sevens-duel-game
git add src/audio/__tests__/sounds.test.ts src/audio/__tests__/useSound.test.tsx src/test/setup.ts
git commit -m "test: lock showcase audio contract"
```

### Task 2: Add Distributable Audio Assets and Harden Playback

**Files:**
- Create: `/Users/liuwei/.codex/worktrees/d051/sevens-duel-game/public/assets/audio/ui-click.mp3`
- Create: `/Users/liuwei/.codex/worktrees/d051/sevens-duel-game/public/assets/audio/game-start.mp3`
- Create: `/Users/liuwei/.codex/worktrees/d051/sevens-duel-game/public/assets/audio/card-play.mp3`
- Create: `/Users/liuwei/.codex/worktrees/d051/sevens-duel-game/public/assets/audio/card-borrow.mp3`
- Create: `/Users/liuwei/.codex/worktrees/d051/sevens-duel-game/public/assets/audio/round-end.mp3`
- Create: `/Users/liuwei/.codex/worktrees/d051/sevens-duel-game/docs/assets/showcase/audio-attribution.md`
- Modify: `/Users/liuwei/.codex/worktrees/d051/sevens-duel-game/src/audio/sounds.ts`
- Modify: `/Users/liuwei/.codex/worktrees/d051/sevens-duel-game/src/audio/useSound.ts`

**Step 1: Collect and place the licensed sound files**

Add five short, redistributable audio files to `/Users/liuwei/.codex/worktrees/d051/sevens-duel-game/public/assets/audio/`.

Selection rules:

- short duration
- no loop dependency
- consistent loudness
- compatible with a “cinematic but controlled” card-table tone

**Step 2: Record attribution and license details**

Create `/Users/liuwei/.codex/worktrees/d051/sevens-duel-game/docs/assets/showcase/audio-attribution.md` with one row or bullet per asset:

- file name
- source URL or source package
- license
- whether attribution is required

**Step 3: Wire the sources into `soundDefinitions`**

Update `/Users/liuwei/.codex/worktrees/d051/sevens-duel-game/src/audio/sounds.ts` so every sound has:

- a concrete `src`
- an intentionally chosen base volume
- short comments only if a mapping would otherwise be unclear

Target structure:

```ts
export const soundDefinitions: Record<SoundName, SoundDefinition> = {
  deal: { src: ["/assets/audio/game-start.mp3"], volume: 0.38 },
  play: { src: ["/assets/audio/card-play.mp3"], volume: 0.42 },
  borrow: { src: ["/assets/audio/card-borrow.mp3"], volume: 0.44 },
  result: { src: ["/assets/audio/round-end.mp3"], volume: 0.5 },
  ui: { src: ["/assets/audio/ui-click.mp3"], volume: 0.24 },
};
```

**Step 4: Harden `useSound`**

Update `/Users/liuwei/.codex/worktrees/d051/sevens-duel-game/src/audio/useSound.ts` so it:

- lazily creates `Howl` instances
- skips missing `src` cleanly
- catches playback errors without crashing the app
- exposes a stable `playSound()` API

Keep the surface area small. Do not build a general-purpose audio manager.

**Step 5: Run the targeted tests and confirm pass**

Run:

```bash
cd /Users/liuwei/.codex/worktrees/d051/sevens-duel-game
npx vitest run src/audio/__tests__/sounds.test.ts src/audio/__tests__/useSound.test.tsx
```

Expected: PASS.

**Step 6: Commit**

```bash
cd /Users/liuwei/.codex/worktrees/d051/sevens-duel-game
git add public/assets/audio docs/assets/showcase/audio-attribution.md src/audio/sounds.ts src/audio/useSound.ts
git commit -m "feat: add showcase audio assets and playback wiring"
```

### Task 3: Re-map Sound Triggers and Apply Small Product Polish

**Files:**
- Modify: `/Users/liuwei/.codex/worktrees/d051/sevens-duel-game/src/App.tsx`
- Modify: `/Users/liuwei/.codex/worktrees/d051/sevens-duel-game/src/ui/screens/HomeScreen.tsx`
- Modify: `/Users/liuwei/.codex/worktrees/d051/sevens-duel-game/src/ui/screens/ResultScreen.tsx`
- Modify: `/Users/liuwei/.codex/worktrees/d051/sevens-duel-game/src/ui/__tests__/flow.test.tsx`
- Modify: `/Users/liuwei/.codex/worktrees/d051/sevens-duel-game/src/smoke/app-shell.test.tsx`

**Step 1: Write a failing shell-copy test**

Extend `/Users/liuwei/.codex/worktrees/d051/sevens-duel-game/src/smoke/app-shell.test.tsx` or `/Users/liuwei/.codex/worktrees/d051/sevens-duel-game/src/ui/__tests__/flow.test.tsx` to lock the new showcase copy:

- home screen exposes a stronger one-line value proposition
- result screen still exposes a replay CTA
- sound toggle remains visible

Example assertions:

```tsx
expect(screen.getByText(/单机 AI 对战/i)).toBeInTheDocument();
expect(screen.getByRole("button", { name: /音效：开|音效：关/i })).toBeInTheDocument();
```

**Step 2: Run the targeted tests and confirm failure**

Run:

```bash
cd /Users/liuwei/.codex/worktrees/d051/sevens-duel-game
npx vitest run src/smoke/app-shell.test.tsx src/ui/__tests__/flow.test.tsx
```

Expected: FAIL because the current copy and event mapping are not yet aligned with the showcase spec.

**Step 3: Re-map sound triggers in `App.tsx`**

Update `/Users/liuwei/.codex/worktrees/d051/sevens-duel-game/src/App.tsx` so the semantics are explicit:

- `ui` for general button and toggle confirmations
- `deal` for new-round entry and replay start
- `play` for play-card actions, with AI actions allowed but not emphasized
- `borrow` for borrow actions, including automatic borrow when required
- `result` when the match transitions into the result screen

Implementation note: use a small `useEffect` keyed on the finished state transition so the result sound fires once.

**Step 4: Apply light copy polish to home and result screens**

Update:

- `/Users/liuwei/.codex/worktrees/d051/sevens-duel-game/src/ui/screens/HomeScreen.tsx`
- `/Users/liuwei/.codex/worktrees/d051/sevens-duel-game/src/ui/screens/ResultScreen.tsx`

Goals:

- sharpen the one-line product positioning for screenshot readability
- keep the page structure familiar
- avoid turning the screens into a marketing landing page

**Step 5: Run tests**

Run:

```bash
cd /Users/liuwei/.codex/worktrees/d051/sevens-duel-game
npx vitest run src/smoke/app-shell.test.tsx src/ui/__tests__/flow.test.tsx src/ui/__tests__/child-mode.test.tsx
```

Expected: PASS.

**Step 6: Commit**

```bash
cd /Users/liuwei/.codex/worktrees/d051/sevens-duel-game
git add src/App.tsx src/ui/screens/HomeScreen.tsx src/ui/screens/ResultScreen.tsx src/smoke/app-shell.test.tsx src/ui/__tests__/flow.test.tsx
git commit -m "feat: refine showcase sound triggers and shell copy"
```

### Task 4: Produce Showcase Media and Rewrite README

**Files:**
- Create: `/Users/liuwei/.codex/worktrees/d051/sevens-duel-game/docs/assets/showcase/home.png`
- Create: `/Users/liuwei/.codex/worktrees/d051/sevens-duel-game/docs/assets/showcase/gameplay.png`
- Create: `/Users/liuwei/.codex/worktrees/d051/sevens-duel-game/docs/assets/showcase/result.png`
- Create: `/Users/liuwei/.codex/worktrees/d051/sevens-duel-game/docs/assets/showcase/demo-cover.png`
- Create: `/Users/liuwei/.codex/worktrees/d051/sevens-duel-game/docs/assets/showcase/sevens-duel-demo.mp4`
- Modify: `/Users/liuwei/.codex/worktrees/d051/sevens-duel-game/README.md`

**Step 1: Capture the three real screenshots**

Create and save:

- `/Users/liuwei/.codex/worktrees/d051/sevens-duel-game/docs/assets/showcase/home.png`
- `/Users/liuwei/.codex/worktrees/d051/sevens-duel-game/docs/assets/showcase/gameplay.png`
- `/Users/liuwei/.codex/worktrees/d051/sevens-duel-game/docs/assets/showcase/result.png`

Capture rules:

- real game UI only
- no browser chrome
- balanced composition
- text readable at README scale

**Step 2: Produce the video cover and short demo file**

Create:

- `/Users/liuwei/.codex/worktrees/d051/sevens-duel-game/docs/assets/showcase/demo-cover.png`
- `/Users/liuwei/.codex/worktrees/d051/sevens-duel-game/docs/assets/showcase/sevens-duel-demo.mp4`

The clip should show:

- entering a match
- at least one play-card action
- at least one borrow or state change
- result or replay transition

Keep the file short and small enough to live comfortably in the repository.

**Step 3: Rewrite the top half of `README.md`**

Update `/Users/liuwei/.codex/worktrees/d051/sevens-duel-game/README.md` so the order becomes:

1. project title + one-line positioning
2. core selling points
3. screenshot section
4. demo video entry
5. feature / gameplay summary
6. development, test, and build commands

Suggested screenshot block:

```md
## 游戏截图

![首页](docs/assets/showcase/home.png)
![对局中](docs/assets/showcase/gameplay.png)
![结果页](docs/assets/showcase/result.png)
```

Suggested video entry:

```md
## 演示视频

[![演示视频封面](docs/assets/showcase/demo-cover.png)](docs/assets/showcase/sevens-duel-demo.mp4)
```

**Step 4: Preview README paths locally**

Open the repository preview or inspect the Markdown rendering to confirm:

- every image resolves
- the video link points to the committed file
- the README still reads naturally in Chinese

**Step 5: Commit**

```bash
cd /Users/liuwei/.codex/worktrees/d051/sevens-duel-game
git add README.md docs/assets/showcase
git commit -m "docs: turn readme into a showcase page"
```

### Task 5: Run Full Verification Before Claiming Completion

**Files:**
- Verify only: `/Users/liuwei/.codex/worktrees/d051/sevens-duel-game/package.json`
- Verify only: `/Users/liuwei/.codex/worktrees/d051/sevens-duel-game/e2e/smoke.spec.ts`
- Verify only: `/Users/liuwei/.codex/worktrees/d051/sevens-duel-game/README.md`

**Step 1: Run unit and component tests**

Run:

```bash
cd /Users/liuwei/.codex/worktrees/d051/sevens-duel-game
npm run test
```

Expected: PASS.

**Step 2: Run the Playwright smoke test**

Run:

```bash
cd /Users/liuwei/.codex/worktrees/d051/sevens-duel-game
npm run test:e2e
```

Expected: PASS on both desktop and mobile projects, or document any existing unrelated failures before continuing.

**Step 3: Run a production build**

Run:

```bash
cd /Users/liuwei/.codex/worktrees/d051/sevens-duel-game
npm run build
```

Expected: PASS and emit a production bundle.

**Step 4: Perform manual verification**

Check all of the following in a local browser session:

- first user interaction unlocks sound successfully
- sound toggle disables and re-enables playback globally
- play / borrow / result / UI sounds map to the correct moments
- README screenshots load correctly
- the README video entry opens the committed demo file
- audio attribution file is present and complete

**Step 5: Commit the verification-safe final state**

```bash
cd /Users/liuwei/.codex/worktrees/d051/sevens-duel-game
git status --short
git add -A
git commit -m "feat: add showcase audio and readme presentation"
```

Only create this final commit if the working tree contains uncommitted implementation work after the task-level commits.
