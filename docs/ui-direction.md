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
│ Rules access   │ Last decision: verdict · precision · deltas    │
│                │ Request changes                Approve        │
└─────────────────────────────────────────────────────────────────┘
```

Prioritize code and both verdict buttons in the first viewport. A completed receipt persists when the next PR arrives, labels the previous PR, and may include a short coworker reaction. Show selection count near actions; tags remain optional. Queue and rules are real controls. Conversation appears only when authored content exists. Show context rows without deletion markers.

## Narrow layout

```text
Status · time · compact meters
Queue (count)     Rules
PR title · author
File selector
Diff (horizontal code scroll if needed)
Last decision (compact, expandable)
Request changes          Approve
```

Use sticky actions without covering the last code row or focus target. Queue/rules open accessible panels with Escape, focus return and clear close actions. Avoid stacking the entire queue before the active review. Empty queue explains the wait; disabled verdicts are obvious. Selection has pressed state and visible focus. Keyboard shortcuts are suspended in inputs, dialogs and pause.

## Prototype checks

- [x] Meaningful diff, verdict actions and receipt visible at 1280×720; diff scrolls independently.
- [x] Phone 390×844, tablet 768×1024 and desktop 1280×720; light/dark and Spanish checked. Reflow at 640×360 checked (equivalent CSS viewport reduction to 200% on 1280×720; not an OS zoom audit).
- [x] Keyboard selection and verdict; queue/rules access, Escape and focus return checked.
- [x] Clean approval, untagged buggy rejection and precise rejection have distinct text receipts and applied deltas. Comprehension testing with first-time players remains Phase 4.
- [x] Browser evidence saved under `docs/design-study/`; screenshots show the implemented concept.

## Scope boundary

The study uses local, replayable fixtures and the pure evaluator. The preview-state selector demonstrates a real empty state with disabled actions. Completed samples are labeled Reviewed and cannot be submitted twice without replay. Locale copy goes through the shared translation table. Native dialogs provide focus containment, Escape and focus return. The page returns 404 in production. Existing `/game`, its timing, tutorial and leaderboard remain unchanged.

The selected visual direction is warm ivory, violet accents and editorial portraits, with a slate dark variant. Lucía and Diego's six expression assets are present in the study, not placeholders. Review this concrete direction before applying it across the game.
