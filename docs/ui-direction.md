# Desk direction: prototype default

A fictional code-hosting application with an illustrated engineering team. Phase 1 now renders this selected treatment at `/dev/design`: a development-only, interactive concept with sample PRs. Owner visual acceptance remains the checkpoint before live Phase 2 integration.

Use warm off-white or deep slate reading surfaces, restrained borders, compact metadata and one violet product accent. Reserve green/red for additions and outcomes, with text/icons as redundant cues. Keep code monospace, body text familiar and legible, and portraits expressive. Avoid transparent panels over busy art, repeated rounded cards and decorative tabs.

## Desktop wireframe, 1280 × 720

```text
┌ Repository · Day/time ───── stability · velocity · satisfaction ┐
│ Queue (compact) │ PR title · author portrait/name/role            │
│ Avatar/title   │ Description · changed files                    │
│ Waiting state  │ ┌ File header ───────────────────────────────┐ │
│                │ │ Gutter · selection · readable diff         │ │
│                │ │ Code scrolls within this region            │ │
│                │ └────────────────────────────────────────────┘ │
│ Rules access   │ Tags are optional; verdict advances the queue  │
│                │ Request changes                Approve        │
└─────────────────────────────────────────────────────────────────┘
```

Prioritize code and both verdict buttons in the first viewport. Approve/reject updates meters once and advances automatically after a 200 ms directional swipe. There is no visible last-review panel or next button; feedback must not interrupt the speed-based loop. Reduced motion skips the swipe. Show selection count near actions; tags remain optional. Queue and rules are real controls. Conversation appears only when authored content exists. Show context rows without deletion markers.

## Narrow layout

```text
Status · time · compact meters
Queue (count)     Rules
PR title · author
File selector
Diff (horizontal code scroll if needed)
Request changes          Approve
```

Use sticky actions without covering the last code row or focus target. Queue/rules open accessible panels with Escape, focus return and clear close actions. Avoid stacking the entire queue before the active review. Empty queue explains the wait; disabled verdicts are obvious. Selection has pressed state and visible focus. Keyboard shortcuts are suspended in inputs, dialogs and pause.

## Prototype checks

- [x] Meaningful diff and verdict actions visible at 1280×720; diff scrolls independently.
- [x] Phone 390×844, tablet 768×1024 and desktop 1280×720; light/dark and Spanish checked. Reflow at 640×360 checked (equivalent CSS viewport reduction to 200% on 1280×720; not an OS zoom audit).
- [x] Keyboard selection and verdict; queue/rules access, Escape and focus return checked.
- [x] Clean approval, untagged buggy rejection and precise rejection evaluate independently; applied deltas update meters without a blocking receipt. Comprehension testing with first-time players remains Phase 4.
- [x] Browser evidence saved under `docs/design-study/`; screenshots show the implemented concept.

## Scope boundary

The study uses local, replayable fixtures and the pure evaluator. Development controls do not belong in the player-facing layout. Verdicts are locked during transitions to prevent duplicate scoring. Locale copy goes through the shared translation table. Native dialogs provide focus containment, Escape and focus return. The page returns 404 in production. The existing `/game` keeps its current desk, timing, tutorial and leaderboard; shared opt-in audio and incoming-PR notices are now integrated.

The selected visual direction is warm ivory, violet accents and editorial portraits, with a slate dark variant. The full ten-person roster uses neutral, pleased and concerned portraits. The preview establishes the selected visual treatment before live-game integration.

## Full-team presentation

The fictional studio is **Afterhours**, building **Small Hours** in `afterhours / small-hours`. Pull-request numbers identify pending requests, starting at #1042. Selecting a request preserves the others; each verdict removes only that request and appends the next unused ID. All ten coworkers share the established editorial portrait treatment. This presentation remains a development route until the live integration gates below pass.

## Production readiness TODO

- [ ] Integrate the real two-minute shift clock, queue delivery/aging and tutorial into the redesigned desk.
- [ ] Wire evaluator/scoped selection into GameContext atomically; verify scoring and leaderboard compatibility.
- [ ] Verify empty queue, end of shift, restart, navigation and pause using real game state.
- [ ] Complete keyboard/screen-reader, mobile and first-time-player checks across the live loop.
- [ ] Ship through the preview branch review; no main merge or deployment is implied by polished presentation.


## Readability and sound
Use 16 px body/code/actions and 14 px supporting labels, with rem units and no phone-specific shrinking. See docs/readability-audit.md for measured contrast, enlargement/reflow checks and limits. Background music and PR sounds have separate opt-in toggles and volume under Sound. The original instrumental rhythm follows the weakest meter from 72 to 144 BPM; a two-note chime plus visual/polite notice announces new queue IDs. The legacy live desk receives these audio/arrival features without changing the shift/spawner/scoring rules.
