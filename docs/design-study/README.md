# Afterhours desk preview

Open `/dev/design` on the development server. The page presents the Afterhours studio's Small Hours repository with ten coworkers and twenty curated review editions. Each coworker submits both clean and flawed code. PR numbers start at #1042 and increase with the sequence; selecting a later item opens it while preserving earlier pending requests. A verdict removes only the reviewed PR, then opens the oldest pending item and replenishes the queue. The twenty editions repeat cyclically.

Approve/reject updates meters once and advances automatically after a 200 ms directional swipe. Reduced motion skips the animation. Optional tags clear on the next PR. There is no Last review panel, manual next arrow, Reset study control, study banner or arbitrary sample label. Structured results are announced to assistive technology. The header reports actual completed reviews rather than a simulated clock.

The team view shows neutral, pleased and concerned illustrated portraits, localized roles and personality lines for Lucía, Diego, Inés, Tessa, Ben, Jonah, Marta, Evan, Noel and Riya. Unknown/missing assets have an initials fallback with accessible names.

## Integration boundary

This is a development-only preview. Production requests return 404. It uses local state and the pure evaluator; it has no real clock, incoming queue delivery, tutorial, shift completion, save or leaderboard writes. The actual `/game` is still the existing implementation. Production readiness tasks are explicit in `docs/ui-direction.md` and the roadmap.

## Verification

The initial Phase 1 evidence remains in Git history. Current screenshots cover desktop light/dark, Spanish phone/tablet and the complete team. All thirty portrait files decode in the browser, are 256×256 alpha PNGs, total 948,846 bytes and remain below 80 KB each. Automated coverage verifies every coworker has clean/flawed editions and that every edition normalizes and scores correctly. Browser checks cover automatic sequence advancement, cleared tags, the ten-person cast, keyboard dialogs and phone overflow.

Prompts: `docs/design-study/prompts.md`. Asset provenance: `public/characters/studies/manifest.json`.

Final gates: 510 tests pass (single worker), typecheck/build pass, 390 templates validate without generated changes, lint has zero errors and five pre-existing warnings. Production HTTP probe confirms 404. Independent review findings on queue preservation and missing-account handling are fixed. The phone and tablet retain reachable verdicts; the tablet/desktop queue scrolls independently with handbook access fixed in place.
