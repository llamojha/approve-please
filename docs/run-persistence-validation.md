# Run persistence validation — 4 November 2026

Game runs now use a versioned local save. The player explicitly resumes or starts over; elapsed wall time never advances the game clock.

## Stored state

- Campaign phase, day, clock, queue/current PR, meters, counters and history.
- Decision receipts, incidents and false positives.
- Scheduled delivery markers and already spawned template IDs, preventing tutorial/wave replay and unintended pool repeats after reload.
- Language/difficulty and current day flavor.

Corrupt, incomplete or incompatible versions are discarded safely. Restored runs always resume unpaused. A resumed run becomes practice-only and cannot submit a leaderboard score; a fresh restart is eligible again.

Music, notification and volume preferences use a separate versioned preference. Enabled channels restore after the next pointer or keyboard gesture, respecting browser autoplay policy.

## Evidence

- Focused tests cover round-trip state, invalid versions, no offline clock movement, delivery-marker idempotence, restored pause state and audio preference fallback.
- Chromium verifies saved clock/queue/markers, home and direct `/game` resume choices, no single-letter verdicts, Alt+A/Alt+R operation and no duplicate opening delivery.
- Independent accessibility review covers 320 px, 200% text, forced colors, reduced motion, handbook keyboard Escape/focus return and workshop editing.
