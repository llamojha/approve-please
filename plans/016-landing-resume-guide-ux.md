# Landing, Resume, and Guide UX Implementation Plan

**Goal:** Make starting, practising, resuming, and resetting a run immediately understandable, and teach the game with real interface imagery.

**Scope:** Landing-page copy and controls, saved-run presentation, tutorial imagery/layout, and bilingual regression coverage. Gameplay rules and save compatibility remain unchanged.

**Approach:** Keep the existing `discardSavedRun` reset contract, but present it as an explicit secondary action that starts at Day 1. Replace the guide's repeated coworker portrait with six screenshots captured from the live game in dark mode. Preserve existing light/dark and EN/ES behavior.

**Validation:** Focused copy tests, full Vitest suite, type-check, lint, production build, and Chromium checks for fresh start, saved Day 2 resume/reset, guide navigation, screenshot rendering, and mobile layout.

### Task 1: Clarify start, practice, resume, and reset language

**Files:**
- Modify: `constants/landingPageCopy.ts`
- Modify: `pages/index.tsx`
- Modify: `styles/Landing.module.css`
- Test: `tests/uiRestoration.test.ts`

1. Rename the hero and setup CTAs around starting a work shift.
2. Rename learning mode to an explicit practice mode and describe its exact queue-pressure behavior.
3. Show the saved day clearly and promote “start over from Day 1” to a properly aligned secondary action with a reset explanation.
4. Cover the bilingual copy contract with focused assertions.

### Task 2: Teach with six real game screenshots

**Files:**
- Modify: `pages/index.tsx`
- Modify: `styles/Landing.module.css`
- Replace legacy placeholder assets with: `public/tutorial-slide-1.png` through `public/tutorial-slide-6.png`

1. Capture queue, diff, actions, meters, audio, and day-summary states from the running game.
2. Render the corresponding screenshot for each guide slide with its localized alt text.
3. Keep screenshots useful at desktop and mobile sizes without hiding them on small screens.

### Task 3: Verify and ship on the preview PR

**Files:**
- Modify: `docs/release-readiness.md`

1. Exercise fresh-start and saved-run flows in Chromium, including an actual Day 2 fixture and reset to Day 1.
2. Verify guide navigation and responsive layout at desktop and 390 px.
3. Run all project gates, update release evidence, commit, push `codex/refresh-foundations`, and wait for PR checks.

## Risks and Rollback

- Screenshot content can become stale when the desk changes; keeping one asset per documented mechanic makes later replacement isolated.
- Reset remains intentionally destructive, so its label and helper text must explicitly say that saved progress is cleared and Day 1 restarts.
- Rollback is a single commit; no save-schema or gameplay migration is introduced.
