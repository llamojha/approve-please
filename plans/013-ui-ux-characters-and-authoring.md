# Plan 013: UI, UX, coworkers and scenario authoring

Status: IN PROGRESS. Phase 0/1 foundation milestone started 30 October 2026.

Goal: make Approve Please feel like a readable, responsive PR-review game with memorable developers, understandable consequences and a contribution workflow that does not require hand-authoring every JSON field.

Baseline: main `6497dc0`, reviewed 30 October 2026. All existing open PRs are excluded by owner direction. The original dirty `feat/re-design` checkout remains untouched. The current assessment and this plan live in `/Users/amllamojha/.codex/worktrees/main-assessment/approve-please`. Implementation must start on fresh named `codex/` branches from verified main, not from an open PR. Recheck main for drift before execution.

This plan is the active execution roadmap. It supersedes the earlier integration proposal and consolidates the proposed TODOs in `/Users/amllamojha/.codex/worktrees/main-assessment/approve-please/docs/2026-10-30-ui-assessment.md`. The owner authorized implementation and PR delivery on 30 October 2026, with a preview branch as the PR target. Implementation PRs target `codex/ui-refresh-preview`, never `main`. Merges and production deployment remain separate actions.

## Delivery shape

Use phases with parallel work inside them. Finish a small playable slice before multiplying screens, characters or authoring features. Keep one integrator plus at most three active sub-agents, matching the four available slots. Reserve a worker slot for independent review when a slice reaches its gate.

| Phase | Deliverable | Depends on | Parallel work | Exit gate |
| --- | --- | --- | --- | --- |
| 0 | Agreed behavior and interface contracts | Main audit | UX flow, character direction and contributor flow can be explored together | Decision matrix, ownership and scope written down |
| 1 | Shared content/evaluation foundation and visual concepts | 0 | Foundation code; desk concept; cast writing/two-character art study | Legacy scenarios remain valid; contracts frozen; visual treatment selected |
| 2 | One complete playable review loop | 1 | Gameplay state; desk UI; characters/three scenarios | Player understands three review outcomes; responsive browser proof |
| 3 | Complete UI, cast and contributor workshop | 2 | UI journey; character/content production; authoring editor | Three independently reviewed deliverables, integrated in sequence |
| 4 | Interruption/recovery UX and integration hardening | 3 for full integration; recovery design can start after 2 | Gameplay recovery; accessibility/locale audit; contributor usability | Pause/resume/restart safe; player and contributor tasks completed |
| 5 | Release candidate | 4 | Independent code review and final product QA | All gates satisfied; rollout and remaining limitations recorded |

Relative scope: 0 small; 1 medium; 2 large; 3 large across three tracks; 4 medium/large depending on recovery policy; 5 medium. These are not time estimates.

## Phase 0: settle behavior before styling it

The integrator owns the shared decisions. Use these proposed defaults for the prototype, record deviations, and obtain product feedback on a concrete playable result before scaling it:

- Keep normal and learning difficulty behavior unless explicitly changed. Guided onboarding can pause the simulation. Untimed practice is a separate future mode, not a silent rename of learning mode.
- A buggy PR rejected without tags is a correct rejection. Matching bug lines earn a separate precision bonus. Rejecting clean code is a false positive. Wrong tags on a genuinely buggy PR are inaccurate identification, not proof that the rejection itself was wrong.
- Preserve existing approval effects and base rejection cost initially. Keep precise-find counters distinct from any new correct-rejection count, so a UI fix does not silently redefine leaderboard scoring.
- Define a structured decision receipt: completed PR identity, verdict correctness, precision result, actual applied meter changes and optional character reaction. Store data, not a pre-rendered English message.
- Proposed authoring MVP: local development workshop with browser drafts, import/preview/validation/export. No accounts, hosted publishing or dependency on the excluded MCP PR.
- Proposed character target: ten recurring coworkers, developer-led. First playable slice uses Lucía Navarro and Diego Martín, with a contextual message from Riya.

Create `/Users/amllamojha/.codex/worktrees/main-assessment/approve-please/docs/review-behavior-contract.md` and `/Users/amllamojha/.codex/worktrees/main-assessment/approve-please/docs/content-contract.md` during execution. Include the clean/buggy × approve/reject × absent/correct/wrong/mixed tags matrix, multi-bug behavior, capped meter deltas, how tutorial timing works, and new/legacy content examples. Reject ambiguous annotations rather than silently scoring the wrong file.

Gate: a written decision matrix and a desk wireframe show the active code, verdict actions, last decision and access to queue/rules. Decisions still needed before relevant implementation: visual treatment, precise mixed-tag bonus policy, and leaderboard eligibility for resumed/practice runs. Do not block unrelated planning on these decisions.

## Phase 1: foundation and visual direction

### Track A: content and evaluation contracts

Foundation owner edits shared contracts once, before dependent workers branch:

- Modify `/Users/amllamojha/.codex/worktrees/main-assessment/approve-please/types/index.ts` and `/Users/amllamojha/.codex/worktrees/main-assessment/approve-please/utils/pr.ts`.
- Create `/Users/amllamojha/.codex/worktrees/main-assessment/approve-please/utils/decision.ts` for pure verdict evaluation and `/Users/amllamojha/.codex/worktrees/main-assessment/approve-please/utils/templateNormalization.ts` for the runtime content adapter.
- Extract browser-safe validation into `/Users/amllamojha/.codex/worktrees/main-assessment/approve-please/lib/templates/validation.mjs`, with `/Users/amllamojha/.codex/worktrees/main-assessment/approve-please/lib/templates/validation.d.mts` for TypeScript consumers. Keep filesystem discovery and manifest writes in `/Users/amllamojha/.codex/worktrees/main-assessment/approve-please/scripts/build-template-manifest.mjs`.
- Update `/Users/amllamojha/.codex/worktrees/main-assessment/approve-please/data/prTemplates/template.schema.json` and `/Users/amllamojha/.codex/worktrees/main-assessment/approve-please/docs/pr-template-guide.md` together.

Normalize line references to file plus stable line identity. Distinguish context, additions and removals in the new contract. Continue accepting existing `isNew`/numeric annotation data, interpreting false as context according to the documented authoring contract. Do not rewrite all 390 scenarios. Validate new IDs/paths and deterministic mapping; report ambiguous legacy data if encountered. Explicitly copy optional character/reaction fields during instantiation, which currently reconstructs objects field by field.

Keep a legacy-compatible facade until gameplay and preview consumers migrate together in Phase 2; every integrated milestone must still compile and run. The contract can reserve removed-line semantics, but the first editor must reject unsupported removal scenarios until display, identity and evaluation all support them. Do not expose a partially implemented feature.

Pure validation checks content shape and references and returns structured field paths/codes/messages. Filesystem folder checks and repository-wide uniqueness remain in the CLI wrapper; the browser can check against its loaded catalog but must not claim to have verified unpublished repository state. Use parity fixtures for the shared rules. The existing report-only mode is diagnostic, not a trustworthy success exit-code gate when validation errors are present.

Add optional character IDs and localized reaction metadata with guest-author fallback. UI and workshop must consume the same normalized PR representation and evaluator. Pure evaluation must not mutate the live game, play sound, advance time or submit leaderboard scores.

Implement first, then add focused tests in `/Users/amllamojha/.codex/worktrees/main-assessment/approve-please/tests/decision.test.ts`, `/Users/amllamojha/.codex/worktrees/main-assessment/approve-please/tests/templateNormalization.test.ts` and the existing template/PR tests. No TDD.

Gate: all legacy scenarios instantiate in both locales; generator/editor validation agree; same-number lines in different files cannot collide; decision matrix passes; manifest output is unchanged unless a deliberate content change warrants it.

### Track B: UI concept

UI owner creates a reviewable desk concept and flow notes in `/Users/amllamojha/.codex/worktrees/main-assessment/approve-please/docs/ui-direction.md`. Show desktop and narrow layouts, light/dark reading surfaces, pending/selected/empty states and a completed-decision receipt. Start with the code-review surface, not a marketing landing page. Give code more space and reduce repeated instruction panels. No fake tabs or controls.

Gate: choose a concrete visual treatment before applying it to every screen. The initial target is meaningful diff content plus both verdict actions visible at 1280×720; long diffs scroll within a usable review surface. Narrow layouts must keep rules and queue reachable.

### Track C: cast and art study

Character owner writes `/Users/amllamojha/.codex/worktrees/main-assessment/approve-please/docs/character-guide.md` and `/Users/amllamojha/.codex/worktrees/main-assessment/approve-please/docs/art-direction.md`.

Roster: Lucía Navarro (frontend), Diego Martín (backend), Inés Romero (platform), Tessa (data), Ben (design engineering), Jonah (junior developer), Marta (QA automation), Evan (SRE), Noel (security), Riya (PM). Existing “Diego (Release Mgr)” is a distinct legacy cameo until deliberately mapped or renamed; do not conflate identities. Keep names stable across EN/ES.

Create only Lucía/Diego's art study first. Each gets neutral, pleased and concerned expressions, readable at avatar size and larger briefing size. Record asset dimensions, budgets, provenance and fallback requirements. Use the image-generation skill when actual raster art production begins. Do not produce the remaining eight sets before this treatment works in the desk.

## Phase 2: playable vertical slice

Three workers can now proceed against frozen contracts:

| Owner | Files and responsibility |
| --- | --- |
| Gameplay | `/Users/amllamojha/.codex/worktrees/main-assessment/approve-please/context/GameContext.tsx`, `/Users/amllamojha/.codex/worktrees/main-assessment/approve-please/constants/gameSettings.ts`, `/Users/amllamojha/.codex/worktrees/main-assessment/approve-please/hooks/useGameClock.ts`: apply evaluator result atomically, preserve last receipt, keep existing wave/tutorial behavior |
| Desk UI | `/Users/amllamojha/.codex/worktrees/main-assessment/approve-please/components/screens/WorkScreen.tsx`, `/Users/amllamojha/.codex/worktrees/main-assessment/approve-please/components/work/`, `/Users/amllamojha/.codex/worktrees/main-assessment/approve-please/styles/Desk.module.css`: header, continuous diff, file selection, queue/rules access and persistent actions/receipt |
| Characters/content | `/Users/amllamojha/.codex/worktrees/main-assessment/approve-please/data/characters.ts`, `/Users/amllamojha/.codex/worktrees/main-assessment/approve-please/utils/characterReactions.ts`, `/Users/amllamojha/.codex/worktrees/main-assessment/approve-please/components/common/CharacterAvatar.tsx`, `/Users/amllamojha/.codex/worktrees/main-assessment/approve-please/public/characters/`: two-character implementation and explicitly assigned scenario fixtures |

The integrator owns `/Users/amllamojha/.codex/worktrees/main-assessment/approve-please/constants/i18n.ts`, shared type amendments and generated manifests. Workers submit required key/interface additions for one serialized integration. Portrait components get their own style module; character workers do not edit desk CSS.

Gameplay also owns `/Users/amllamojha/.codex/worktrees/main-assessment/approve-please/hooks/usePRSpawner.ts` for a minimal shared simulation-pause API in this phase. Gate clock, aging, deliveries and verdict actions, including delayed pack loads, before Phase 3 onboarding consumes it. UI must not create an independent local pause mechanism. Saved-run restoration remains Phase 4 work.

Demonstrate three outcomes: clean approval, buggy rejection without tagging, precise rejection. Use isolated prototype fixtures or explicit dev selection; do not silently replace the mandatory tutorial PR pair. Riya supplies context. Reactions use the completed PR's receipt, never the next PR. No expression or character identity may reveal correctness before review.

Gate: one coherent browser-playable loop. Receipt remains legible when the next PR loads; each action updates state once; file selection is correct; EN/ES works; keyboard and narrow-layout smoke pass. Review the slice with the owner and adjust the chosen direction here, before larger asset production.

## Phase 3: parallel expansion

### Track A: the full player journey

UI owner extends the selected system to `/Users/amllamojha/.codex/worktrees/main-assessment/approve-please/pages/index.tsx`, `/Users/amllamojha/.codex/worktrees/main-assessment/approve-please/components/screens/BriefingScreen.tsx`, `/Users/amllamojha/.codex/worktrees/main-assessment/approve-please/components/screens/SummaryScreen.tsx`, `/Users/amllamojha/.codex/worktrees/main-assessment/approve-please/components/screens/GameOverScreen.tsx`, tutorial/common modal components and their styles.

Keep Start visible, compact language/difficulty setup, teach actions in the actual opening scenarios, and clearly distinguish daily rules from flavor. Show summary explanations linked to code and decisions. Add functioning conversation content only where authored messages exist. UI agent owns shared presentation components and global tokens; other workers request changes rather than editing them concurrently.

Gate: landing → briefing → work → summary/game over → next day/restart is coherent in EN/ES. Existing two-minute timing is accurately described. No misleading controls, hidden critical rules or inaccessible modal flows.

Ownership exception: `/Users/amllamojha/.codex/worktrees/main-assessment/approve-please/components/common/CharacterAvatar.tsx` and its own style module stay with the character owner. The desk and workshop consume that component; requested changes go through its owner. Onboarding uses the Phase 2 pause API, with gameplay corrections serialized by the integrator if needed.

### Track B: cast and content production

Character owner expands the approved treatment to all ten identities under `/Users/amllamojha/.codex/worktrees/main-assessment/approve-please/public/characters/`, maintains the registry/reaction modules and updates explicitly assigned entries in `/Users/amllamojha/.codex/worktrees/main-assessment/approve-please/data/dayQuotes.ts` and scenario JSON.

Use batches of ten or fewer templates. Give recurring submitters both clean and flawed work; preserve guest authors. Prioritize developer personalities and reaction quality before office decorations or animation. Do not bulk reassign the existing 239 author strings.

Gate: portraits recognizable in small/large contexts, asset paths valid, no layout shift from missing images, EN/ES dialogue consistent, every recurring submitter represented without correctness stereotypes. Remaining decorative assets are optional.

### Track C: contributor workshop

Authoring owner edits `/Users/amllamojha/.codex/worktrees/main-assessment/approve-please/pages/dev/templates/index.tsx`, `/Users/amllamojha/.codex/worktrees/main-assessment/approve-please/pages/dev/templates/[id].tsx`, `/Users/amllamojha/.codex/worktrees/main-assessment/approve-please/styles/DevTemplates.module.css`, and creates `/Users/amllamojha/.codex/worktrees/main-assessment/approve-please/pages/dev/templates/new.tsx`, `/Users/amllamojha/.codex/worktrees/main-assessment/approve-please/components/authoring/` and `/Users/amllamojha/.codex/worktrees/main-assessment/approve-please/utils/templateDraft.ts`.

Deliver in small steps: text search/compact browse and duplicate; draft metadata/author editing; diff entry/import and bug annotation; inline errors and locale editing; player/author preview and outcome simulation; recoverable drafts and validated JSON export. MVP diff input can use a structured line editor with paste support; a full Git patch parser is optional follow-up, not a hidden prerequisite.

Reuse the stable PR viewer; do not build a second renderer. Player preview hides answers. Simulation uses the pure evaluator without live game/leaderboard side effects. Export includes intended directory instructions; no production server filesystem writer. Keep dev routes unavailable in production. Update `/Users/amllamojha/.codex/worktrees/main-assessment/approve-please/CONTRIBUTING.md` with the actual workflow.

Gate: a new collaborator creates a valid guest or cast scenario, identifies the correct file/line, tries both verdicts, reloads a draft and exports it without touching manifests. Import invalid JSON and show actionable errors without losing the draft. Existing gallery and production 404 behavior remain intact.

## Phase 4: interruptions, accessibility and integration

Gameplay/recovery owner serializes delivery history and any pool/ID state needed for reliable continuation before adding save/resume. The current spawner has module-level and ref state; saving the context object alone would permit replay or inconsistency.

Modify `/Users/amllamojha/.codex/worktrees/main-assessment/approve-please/hooks/usePRSpawner.ts`, the clock/context and create `/Users/amllamojha/.codex/worktrees/main-assessment/approve-please/utils/runPersistence.ts` with focused tests. Proposed default: versioned local saves, explicit resume, no offline time advancement. Resolve leaderboard eligibility before exposing resumed/practice score submission; do not change production data or policies as part of this work without a separate reviewed decision.

Pause must stop clock, aging, new deliveries and verdict shortcuts, including late asynchronous template loading. Resume must not duplicate tutorial or scheduled waves. Restart clears prior history; corrupt/incompatible saves recover without a crash. Warn only before losing meaningful progress, not before every review.

In parallel, rotate another worker into independent UX/accessibility review: keyboard-only loop, focus trap/return/Escape, selection semantics, 200% zoom, phone/tablet/desktop, light/dark, reduced motion, mute and long Spanish text. Verify global A/R shortcuts do not fire while editing, in dialogs or paused.

Run observed first-time player and contributor sessions. Record where participants hesitate; do not treat automated tests as usability evidence. If participants are unavailable, label these gates pending rather than claiming success.

## Phase 5: verification and release readiness

Implement each coherent change first, then add/update meaningful tests. Run targeted tests with one worker, then typecheck/lint. At integrated milestone boundaries, run template generation and check the manifest diff, full single-worker tests and production build. Browser verification is mandatory for visual work. Commands are existing package scripts; `vitest run --help` was checked during planning.

From the chosen implementation checkout, relevant gates are `npm run generate:templates`, `npm run templates:report`, `npm run typecheck`, `npm run lint`, `npm test -- --maxWorkers=1`, and `npm run build`. Run them sequentially as appropriate; do not launch several builds or full suites from parallel workers. Future test paths must exist before being passed to targeted commands.

Final acceptance: all retained legacy content works; new verdict matrix passes; mandatory wave/tutorial behavior survives pause/resume and day changes; author/player preview agree; ten-character assets have fallbacks; end-to-end player and contributor paths pass; production keeps authoring routes private; no unreviewed leaderboard/deployment changes. Independent reviewer checks full diff and unresolved findings. Record known limitations and a rollout/rollback note before requesting any publishing action.

## Agent operating rules

1. Integrator controls shared contracts, translation keys, dependency/lock changes, manifest regeneration, roadmap status and integration order. Never allow concurrent edits to these files.
2. Use a separate managed worktree per implementation worker when changes overlap or span multiple turns. All worktrees derive from the same verified milestone. Workers are not alone and must not revert others' changes.
3. Every assignment states allowed files, input contract, acceptance checks and exclusions. If a worker needs another owner's file, it proposes the change to the integrator.
4. Integrate one completed slice at a time, review its diff and run relevant gates before dependent workers update. The owner has authorized implementation PR delivery to `codex/ui-refresh-preview`. Commit and push only reviewed, validated milestone files to their named feature branch. Do not merge or deploy automatically.
5. Reviewers report actionable issues with evidence, not just approval. When a slot is needed, finish a worker and reuse that slot for review; do not exceed three sub-agents.
6. Update this plan's TODOs after verified milestones. Distinguish implemented, locally verified, usability-validated and released states.

## Risks, rollback and scope control

- Contract migration: retain legacy parsing and use normalization at a boundary. Do not silently migrate the entire catalog. Version new formats and saves; make rollback behavior explicit before writing them.
- Scoring: distinguish corrected semantics from rebalancing and leaderboard changes. Compare receipts to actual capped state changes.
- Spawning/persistence: use deterministic delivery markers and inspect restoration across day transitions and lazy loading. If inherited wave behavior blocks the slice, create a bounded main-based fix task; do not require an excluded PR.
- Art cost: approve two characters in context before expanding. Static portraits are sufficient for the first release; relationship meters, animated characters and branching stories are deferred.
- Scope: hosted collaboration, cloud accounts, AI/MCP authoring, full Git import and production publishing are outside the initial workshop.
- Rollback: keep phases as separately reviewable changes. Preserve original assets and data until replacement is accepted; disable new flows or revert the relevant change through normal Git procedures once committed, without destructive resets. Reopen legacy authoring if workshop rollout fails.

## Milestone TODOs

- [x] M0: behavior/content contracts and owner/file allocation recorded.
- [ ] M1: legacy-compatible evaluator/validator/normalizer ready; desk direction and two-character treatment selected.
- [ ] M2: three-scenario playable loop accepted in browser.
- [ ] M3a: full player journey ready.
- [ ] M3b: ten-character cast and balanced scenario batches ready.
- [ ] M3c: contributor workshop produces valid playable exports.
- [ ] M4: pause/recovery and integration checks pass; usability observations recorded.
- [ ] M5: independent review, release gates and rollout/rollback note complete.

Suggested change boundaries, each independently reviewable: compatibility/validator; evaluator and decision matrix; character registry and two portraits; desk/receipt integration; onboarding and remaining screens; gallery search/duplicate; editor/drafts; preview/export; remaining cast batches; pause/save; final accessibility/localization fixes. Do not bundle all these into one large PR when publishing is later authorized.

Recommended first execution assignment: Phase 0 followed by the three Phase 1 tracks. Stop expansion at the Phase 2 product checkpoint until the concrete loop has been reviewed. Do not start by generating all portraits or rewriting every screen.

## Execution log: foundation milestone

- Repository: `llamojha/approve-please`; main reverified at `6497dc0c7f301b855c32233cfbd3ad808f036365`.
- Integration base: `codex/ui-refresh-preview`, created at that main commit.
- First PR head: `codex/refresh-foundations`; target: `codex/ui-refresh-preview`.
- Bounded first delivery: shared validator, normalized line identity, pure decision evaluation and behavior/content/design contracts. Live gameplay migration belongs to Phase 2.
- Parallel ownership: validation worker owns pure validator, CLI wrapper and validation tests; evaluation worker owns types, normalization, evaluation, schema and contracts; design worker owns UI/cast/art direction documents. Integrator owns roadmap and verification. These disjoint files use the existing assessment worktree; later overlapping implementation uses separate worktrees.
- Prototype default: mixed correct/incorrect tags receive no precision bonus. This does not change current live scoring; verify the policy in the Phase 2 playable review.
- [x] Validate and independently review the foundation changes before PR delivery.
- [ ] Finish the two-character art study and choose the visual treatment in context.
- [ ] Begin Phase 2 only after the foundation contracts are integrated into the preview branch.

Verification: 504 tests pass with one worker, including 22 new foundation tests and all 390 scenarios normalized in EN/ES. Typecheck and production build pass. Lint has zero errors and five pre-existing warnings. Generation validates 390 scenarios and leaves manifests unchanged. Two pre-existing duplicate closing-brace numbers were corrected in a two-template batch; both previewed in English/Spanish with independent closing-line selection. Independent review found the numeric identity compatibility gap; fixed and re-reviewed without remaining blockers.

M1 is partially complete: evaluator, normalizer, shared validator and design briefs are ready. Actual two-character art study, rendered desk and owner acceptance remain pending. No live evaluator migration, UI refresh or portrait production is claimed in this foundation PR. Production publication is not part of this milestone.
