# Approved desk → live game implementation plan

**Status:** IMPLEMENTED AND VERIFIED LOCALLY (3 November 2026). Landing and gameplay migration ship together in preview PR #12.

**Goal:** Play the real campaign through the approved Afterhours desk: actual clock, catalog PRs, optional file-scoped tags, immediate verdict feedback, swipe progression and recognizable coworkers.

**Scope:** `/game` work phase and the presentation needed to enter/leave it. Keep the current two-minute day, difficulties, language filtering, mandatory waves, tutorial pair, catalog and leaderboard API. Save/resume is Phase 4; the current game has no saved-run feature to migrate. Contributor workshop remains Phase 3.

**Approach:** GameContext owns simulation and decisions. Shared desk components receive data/actions; `/dev/design` becomes a fixture adapter over those components. Never transplant the preview's independent timer, replenishing ten-item queue or meter resets into the campaign. Implement first, then add/update focused tests, per the project workflow.

## 1. Extract presentation and character metadata
**Files:** create `components/work/ReviewDesk.tsx`, `components/work/CodeDiff.tsx`, `components/common/CharacterAvatar.tsx`, `styles/ReviewDesk.module.css`; modify `pages/dev/design.tsx`, `constants/designStudyTeam.ts`, `data/characters.ts`.

- [x] Extract the approved header, meters, queue, metadata/description, compact diff and verdict bar behind typed props. Keep cast/gallery fixtures outside the production component dependency tree.
- [x] Keep 16 px body/code, 14 px supporting labels, EN/ES, visible priorities, neutral portraits and initials fallback.
- [x] Consolidate the study's identity metadata into the production character registry introduced by the landing redesign. Preserve guest authors; resolve only explicit author IDs.
- [x] Render all files and context/addition rows using normalization; select by `{ filename, rowId }`, never by line number alone.
- [x] Compare the shared fixture route with existing screenshots; verify short snippets fit content, long diffs scroll and actions remain reachable.

**Gate:** Both fixture and live adapters can render the same component; production bundles do not import curated answers from `constants/designStudyTeam.ts`.

## 2. Connect verdicts to one atomic state transition
**Files:** modify `context/GameContext.tsx`, `types/index.ts`, `utils/decision.ts`, `components/screens/WorkScreen.tsx`, `components/work/ActionPanel.tsx`; update `tests/gameReducer.test.ts`, `tests/decision.test.ts`, `tests/templateNormalization.test.ts`.

- [x] Replace UI-side correctness calculations with the existing pure evaluator, preserving approval effects and base rejection cost.
- [x] Return/store structured receipts with completed PR identity, correctness, precision and actual capped meter changes. Localize at render time.
- [x] Make buggy untagged rejection correct; award precision only for valid bug tags without unrelated tags. Cover clean rejection, mixed tags and two files sharing line numbers.
- [x] Preserve the meaning of existing counters and leaderboard scoring; precise finds remain the existing `truePositives` score input.
- [x] Guard double clicks/keyboard repeats atomically by processed PR ID. Each verdict consumes exactly one PR and records incidents/false positives once.

**Gate:** Characterization tests preserve intended legacy effects, evaluator tests cover the full verdict matrix, and precision fixes have explicit expected counter behavior.

## 3. Wire the real clock, queue and pause ownership
**Files:** modify `components/screens/WorkScreen.tsx`, `context/GameContext.tsx`, `hooks/useGameClock.ts`, `hooks/usePRSpawner.ts`, `components/work/ClockDisplay.tsx`, `components/work/QueuePanel.tsx`; add `tests/simulationLifecycle.test.ts`.

- [x] Use context time/day/meters/queue; show `minutesToClock(currentTime)` with the existing game constants.
- [x] Preserve mandatory minutes 0, 60, 180 and 360, opening two tutorial PRs, hourly fallback and language-pack manifest loading.
- [x] Introduce one simulation pause state owned by context for handbook/settings. Clock, queue aging, spawning, deliveries and verdict shortcuts respect it. Opening the mobile queue does not pause.
- [x] Preserve pending PRs when browsing the queue. Handle arrivals during review, an empty queue, delayed loads and the 17:00 transition without fake replenishment.
- [x] Keep dev-only spawn-order logs.

**Gate:** Deterministic lifecycle tests verify exact wave order/counts, pause during asynchronous loading, no replay after resume, day changes and one active clock/spawner instance.

## 4. Complete fast review progression and coworker feedback
**Files:** modify `components/work/ReviewDesk.tsx`, `components/screens/WorkScreen.tsx`, `hooks/useAudioCue.ts`, `hooks/usePRArrivalNotice.ts`, `constants/i18n.ts`, `data/characters.ts`; add `tests/reviewProgression.test.ts`.

- [x] Apply the verdict immediately, animate the outgoing PR for 200 ms, then show the next pending PR automatically. Reduced motion skips animation.
- [x] Keep a snapshot of the completed PR during animation so incoming state cannot attach its portrait/reaction to the next author. Announce the outcome without a manual acknowledgement or next button.
- [x] Clear tags on PR change; restore useful keyboard focus. Ignore A/R in editable controls, dialogs, paused state and while a verdict is locked.
- [x] Resolve author/description/reactions from real PR metadata, with neutral portraits before decisions. Priority never signals correctness.
- [x] Feed real meters into adaptive audio and real newly arrived IDs into notifications. Queue selection and merely removing a reviewed PR stay silent.

**Gate:** Rapid actions, arrival during swipe, out-of-order selection, final PR, shift ending mid-animation, reduced motion and keyboard flows all process once and show the correct author.

## 5. Integrate the actual opening and day boundaries
**Files:** modify `pages/game.tsx`, `components/screens/BriefingScreen.tsx`, `components/screens/SummaryScreen.tsx`, `components/screens/GameOverScreen.tsx`, `components/tutorial/TutorialHint.tsx`, `styles/Screen.module.css`, `constants/i18n.ts`.

- [x] Run the real clean README/exposed-key opening pair through the new desk. Do not substitute the study scenarios.
- [x] Align briefing, summary and game-over typography/actions with the landing/desk, retaining rules, incident review, false positives, restart and next-day actions.
- [x] Validate summary/game-over ownership in context; keep the preview's local shift reset outside the production adapter.
- [x] Keep leaderboard submission behavior and difficulty eligibility intact. Existing API tests use mocked/local requests; no public QA scores were created.

**Gate:** Landing → briefing → work → summary → next day, plus game-over → restart, works in both locales and difficulties. Meters/counters/history match decisions.

## 6. Verify and deliver on preview
**Files:** update `docs/design-study/README.md`, `docs/readability-audit.md`, `plans/013-ui-ux-characters-and-authoring.md`; create `docs/live-desk-validation.md`.

- [x] Run targeted tests first, then `npm run typecheck`, `npm run lint`, `npm test -- --maxWorkers=1`, `npm run generate:templates`, `npm run build`. All 539 tests pass; typecheck, lint and production build pass; 390 templates validate without generated-manifest changes.
- [x] Browser proof: complete a shift, show mandatory arrivals, optional/precise rejection, multi-file tagging, day transition, empty queue, game-over/restart, audio opt-in and notice behavior. Campaign transitions and interaction behavior have browser coverage; reducer tests cover terminal and restart state without publishing leaderboard QA data.
- [x] Check 320 px phone, tablet, desktop, 200% text/zoom, long Spanish copy, keyboard-only, focus return, contrast and reduced motion. Browser checks are complete; observed usability, screen-reader and forced-colors sessions remain release research.
- [x] Keep `/dev/design` and authoring routes 404 in production; `/game` uses the real desk. Production-server probes return 200 for `/` and `/game`, and 404 for `/dev/design` and `/dev/templates`.
- [x] Update the existing preview-target PR with screenshots, test evidence and remaining limitations. No main merge or deployment is part of this task.

## Risks and rollback

- Highest risk: simulation/decision changes, not CSS. Land extraction, evaluator wiring, simulation wiring and journey changes as separate commits so each is reviewable and revertible.
- Delayed language packs can enqueue after pause/day change. Validate generation/day ownership before committing deliveries.
- Legacy PRs lack author IDs and may reuse line numbers across files. Preserve guest display and normalize file-scoped references before enabling precision tagging.
- The fixture timer pauses in all dialogs; production must implement the explicit shared pause policy above instead of inheriting that behavior accidentally.
- Roll back the production WorkScreen adapter to the existing work UI if integration gates fail; retain the approved fixture route and assets. Keep scoring/counter amendments independently revertible. No database migration is planned.

## Immediate landing work (this request)

- [x] Inspect existing start, language, difficulty and tutorial flows.
- [x] Redesign `pages/index.tsx` / `styles/Landing.module.css` using existing portraits and the approved palette.
- [x] Add localized landing copy and a production-safe coworker registry; keep fixture answers out of the landing dependency tree.
- [x] Preserve actual start/settings/leaderboard entry points and use native tutorial/leaderboard dialogs with focus return and Escape.
- [x] Verify browser interactions, EN/ES, mobile reflow and production build. Evidence: `docs/landing-refresh-validation.md`.
- [x] Include the plan, landing screenshots and validation evidence in the existing preview-target change.
