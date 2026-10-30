# Desk direction: prototype default

A fictional code-hosting application with an illustrated engineering team. This is a proposed treatment for the first playable slice; no new screen has been rendered or accepted yet.

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

- [ ] Meaningful diff and actions visible at 1280×720; test long content.
- [ ] Phone/tablet/desktop, light/dark, 200% zoom and long Spanish text.
- [ ] Keyboard-only selection, verdict, queue/rules and modal return.
- [ ] Three outcomes understandable without relying on color.
- [ ] Use real screenshots for acceptance; this wireframe is not browser proof.
