# UI Context Restoration Implementation Plan

**Status:** IMPLEMENTED AND VERIFIED (5 November 2026).

**Goal:** Restore the useful gameplay context lost during the live-desk migration without bringing back the old crowded rail layout, and document why the remaining legacy UI stays unported.

**Scope:** Add queue-pressure feedback, live shift statistics, display settings with a usable light/dark Afterhours theme, PR tags and file-language metadata. Create a standalone HTML decision record. Keep automatic verdict progression, consolidated guidance and the code-first layout unchanged.

**Approach:** Extend the existing top-bar dialogs and compact metadata treatments rather than reintroducing permanent panels. Reuse the existing counter data, queue-pressure calculation and UI preference context. Preserve bilingual copy, simulation pause ownership, keyboard behavior and reduced-motion behavior.

**Validation:** Add focused component/copy coverage after implementation, then run targeted tests, type-check, lint, the full low-concurrency test suite, production build and browser checks at desktop and phone widths in both themes.

### Task 1: Restore causal and PR context
**Files:**
- Modify: `components/screens/WorkScreen.tsx`
- Modify: `components/work/ReviewDesk.tsx`
- Modify: `components/work/CodeDiff.tsx`
- Modify: `constants/designStudyCopy.ts`
- Modify: `styles/LiveDesk.module.css`
- Modify: `styles/ReviewDesk.module.css`
- Test: `tests/liveDeskRestoration.test.tsx`

- [x] Surface queue pressure beside Velocity and Team trust only when normal-mode aging is active.
- [x] Render PR tags as compact metadata and each file language beside its filename.
- [x] Verify the context remains readable without pushing the verdict controls out of the first desktop viewport.

### Task 2: Restore live statistics and display settings
**Files:**
- Modify: `components/screens/WorkScreen.tsx`
- Modify: `context/UIPreferencesContext.tsx`
- Modify: `constants/designStudyCopy.ts`
- Modify: `styles/LiveDesk.module.css`
- Test: `tests/liveDeskRestoration.test.tsx`

- [x] Add Shift stats and Settings to the existing modal system and pause the simulation while either is open.
- [x] Show the six existing counters with localized labels and descriptions.
- [x] Wire a persisted Afterhours light/dark control to the live desk, retaining sufficient contrast and a light default for new players.

### Task 3: Record deliberate non-ports
**Files:**
- Create: `docs/ui-restoration-decisions.html`
- Modify: `plans/015-ui-context-restoration.md`

- [x] Compare old and new surfaces and explain each intentionally unported panel or behavior.
- [x] Separate permanent product decisions from possible future research, and record the restored items.
- [x] Keep the document standalone, responsive and readable without a build step.

### Task 4: Verify and deliver on the preview PR
**Files:**
- Modify: `plans/015-ui-context-restoration.md`

- [x] Run targeted tests, `npm run typecheck`, `npm run lint`, `npm test -- --maxWorkers=1` and `npm run build`.
- [x] Inspect the real game at 1440×900 and 320×800, in English and Spanish, with light/dark themes and open dialogs. The 320 px pass found and resolved top-bar overflow; final document width equals viewport width.
- [x] Commit the scoped files and push `codex/refresh-foundations` to PR #12, leaving unrelated working-tree files untouched.

## Risks and Rollback

- Additional controls could recreate the original clutter. Keep them in the top bar/dialog system and avoid a permanent third column.
- Theme restoration could flash or override the approved paper palette. Use the existing persisted preference and make the paper theme the default for new players.
- Queue-pressure wording could imply penalties in Learning mode. Hide the indicator when queue penalties are disabled.
- Metadata may become noisy for templates with many tags. Cap the visible treatment through wrapping and compact typography rather than truncating data.
- Each restoration is isolated to presentation and can be reverted without changing scoring, templates or saved-game data.
