# Identity, queue and briefing polish

## Goal

Bring the live game’s naming, pressure feedback, decision controls and shift briefing into the same production-ready visual language as the refreshed review desk.

## Implementation

- [x] Replace the unexplained Afterhours / Small Hours fiction with the clearer Mergeworks / Launchpad identity in active UI and design references.
- [x] Show queue drain as repeated chevrons, with plain-language help that explains what the count means.
- [x] Give request and approve actions restrained red and green semantic treatments in both themes.
- [x] Rename the review handbook to “How reviews work” and keep it available from the desk.
- [x] Rewrite shift quotes around the ten established coworkers and attach each quote to its portrait.
- [x] Restructure the briefing so the day, focus, guidance, coworker note and start action have a readable hierarchy.
- [x] Turn the end-of-day screen into a learning recap with successful calls, missed PRs, decision labels and line-level evidence.
- [x] Update targeted tests, run the project gates and verify the affected flows in a real browser.
- [x] Commit and push the completed change to the existing PR branch, then confirm CI.

## Acceptance checks

- Queue drain is visible at low pressure and the number of chevrons matches the calculated drain level.
- Approve and request actions remain readable in light and dark themes and are not encoded by color alone.
- The briefing fits at desktop and mobile widths without the heading dominating the page.
- Every briefing quote belongs to one of the ten visible coworkers and is localized in English and Spanish.
- No active player-facing screen refers to Afterhours, Small Hours or a review handbook.
