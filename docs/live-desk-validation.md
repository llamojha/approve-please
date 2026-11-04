# Live desk migration validation — 4 November 2026

The approved Afterhours review design now powers the real `/game` work phase. Shared presentation components render GameContext state; `/dev/design` remains a fixture adapter and stays unavailable in production.

## Implemented behavior

- Real 09:00–17:00 two-minute shift clock, meters, queue and day state.
- Mandatory day-one clean README/exposed-key tutorial pair before later waves, with the existing 0/60/180/360 cadence and dev-only spawn logs retained.
- Atomic decisions through the pure evaluator. The reducer applies counters, capped meter deltas, incidents, false positives, queue removal and a structured receipt once.
- File-scoped row tags. Equal line numbers in separate files cannot collide.
- Correct untagged buggy rejection; precision credit only for exact bug rows without unrelated tags. Leaderboard score inputs remain unchanged.
- Immediate decision followed by a 200 ms directional outgoing snapshot. The completed coworker and reaction remain attached during the animation; reduced motion skips it. No receipt acknowledgement or next arrow.
- A/R shortcuts ignore repeat/modifier keys, editable controls, dialogs, paused state and the outgoing lock.
- Handbook and audio dialogs pause clock, queue aging, deliveries and verdicts. The phone queue dialog remains live and gives no timing advantage.
- Ten explicit catalog scenarios—one per established coworker—use the portrait/reaction registry. The opening pair are Lucía and Noel. All other catalog guests keep their authored names and initials fallback.
- Landing, briefing, summary and game-over use the light Afterhours system. Game-over leaderboard copy is localized and final false positives remain reviewable.

## Browser evidence

- Landing → briefing → live work in EN and ES.
- A complete Day 1 shift reaches one summary; continuing opens the Day 2 briefing and starts a fresh 09:00 shift with the correct new queue.
- Opening clean approval and precise security rejection, including the outgoing title, pleased portrait, selected row and localized coworker message.
- Later wave appears only after the two tutorial reviews leave the queue.
- Handbook holds the same clock value across 700 ms; closing resumes without wall-clock catch-up.
- Mobile queue remains open while the clock advances.
- 390×844 phone and 320×740 doubled-text checks report no document horizontal overflow. Verdict labels reflow vertically at the narrow breakpoint.
- Queue selection, Escape/close/focus return, A/R guards, adaptive audio controls and visible/polite arrival notices exercised in Chromium.

Screenshots: `docs/design-study/live-desk-desktop.png`, `docs/design-study/live-desk-mobile.png`, and `docs/design-study/live-desk-200-percent.png`.

## Automated gates

- Focused reducer/evaluator/normalization/lifecycle/template checks cover atomic decisions, pause, duplicate/stale actions, file identity, tutorial gating, generic eligibility, full coworker assignment and both locales.
- All 390 templates validate and generated manifests remain structurally valid.
- All 549 tests pass across 18 files; typecheck, lint and the optimized production build pass.
- Production probes return 200 for `/` and `/game`, and 404 for `/dev/design` and `/dev/templates`.

## Limits

Versioned local save/resume and persistent audio preferences are now included. Hosted author publishing and database changes remain outside scope. Independent keyboard, reflow, forced-colors, reduced-motion and programmatic-label checks have browser coverage; human participant research remains distinct follow-up evidence. Rollback is the previous `WorkScreen` adapter; scoring and content contracts remain independently testable.
