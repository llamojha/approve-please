# Afterhours desk preview

Open `/dev/design` on the development server. The page presents the Afterhours studio's Small Hours repository with ten coworkers and twenty curated review editions. Each coworker submits both clean and flawed code. PR numbers start at #1042 and increase with the sequence; selecting a later item opens it while preserving earlier pending requests. A verdict removes only the reviewed PR, then opens the oldest pending item and replenishes the queue. The twenty editions repeat cyclically.

Approve/reject updates meters once and advances automatically after a 200 ms directional swipe. Reduced motion skips the animation. Optional tags clear on the next PR. There is no Last review panel, manual next arrow, Reset study control, study banner or arbitrary sample label. Structured results are announced to assistive technology. The header shows the current time and a shift-progress bar alongside the completed-review count. The clock shares the game’s 09:00–17:00 window and two-minute real-time pace. It pauses in dialogs and the team view, stops at 17:00, and disables verdicts until the player starts the next shift. Pending PRs carry forward; local meters reset for the next preview shift.

The team view shows neutral, pleased and concerned illustrated portraits, localized roles and personality lines for Lucía, Diego, Inés, Tessa, Ben, Jonah, Marta, Evan, Noel and Riya. Unknown/missing assets have an initials fallback with accessible names.

## Integration boundary

This is a development-only preview. Production requests return 404. It uses local state and the pure evaluator; it has a local advancing clock and shift boundary, but no live GameContext clock, timed wave delivery, tutorial, campaign progression, save or leaderboard writes. The actual `/game` retains its existing desk/game loop and now shares the new audio controls and arrival notice. Production readiness tasks are explicit in `docs/ui-direction.md` and the roadmap.

## Verification

The initial Phase 1 evidence remains in Git history. Current screenshots cover desktop light/dark, Spanish phone/tablet and the complete team. All thirty portrait files decode in the browser, are 256×256 alpha PNGs, total 948,846 bytes and remain below 80 KB each. Automated coverage verifies every coworker has clean/flawed editions and that every edition normalizes and scores correctly. Browser checks cover automatic sequence advancement, cleared tags, the ten-person cast, keyboard dialogs and phone overflow.

Prompts: `docs/design-study/prompts.md`. Asset provenance: `public/characters/studies/manifest.json`.

Final gates: 510 tests pass (single worker), typecheck/build pass, 390 templates validate without generated changes, lint has zero errors and five pre-existing warnings. Production HTTP probe confirms 404. Independent review findings on queue preservation and missing-account handling are fixed. The phone and tablet retain reachable verdicts; the tablet/desktop queue scrolls independently with handbook access fixed in place.


## Readability and adaptive audio
The desk now uses 16 px code/body/actions and 14 px supporting text, with relative sizing, larger controls and wrapping at narrow widths. Detailed checks and limitations are in docs/readability-audit.md.

Open Sound to enable background music and/or PR chimes. Both start off; volume starts at 25%. The instrumental rhythm speeds up as the lowest meter falls (72–144 BPM). New PR IDs produce a short two-note chime when enabled, and a visual/polite notice regardless of audio. Selecting an already queued PR is silent. The same controls are available in the existing live WorkScreen.

Latest follow-up gates: 524 tests pass with one worker; typecheck/build pass; lint retains five existing warnings. Audio controls are shown in audio-settings.png; pr-arrival.png shows the non-blocking notice.


## Clock and PR priority restoration
All queue cards and the active review display localized Low/Medium/High priority badges (Baja/Media/Alta). Priority remains the existing `low | normal | high` contract and is independent of clean/flawed editions. Badges use readable text as well as color, at 14 px minimum. The shared middle-priority label now reads Medium/Media in the existing live queue too.

Verification: 525 tests pass with one worker; typecheck and production build pass; all 390 templates validate with manifests unchanged. Lint has zero errors and five existing warnings. Browser clock checks exercise 09:00 → 10:00 in 15 real seconds, pause/resume in settings, automatic advance, the 17:00 boundary, disabled verdicts, next-shift reset and preservation of pending PRs. Live tutorial/waves/scoring migration remains Phase 2.


## Compact diff sizing
Short snippets now determine the panel height instead of stretching to fill the viewport. The verdict bar follows the diff directly; long snippets retain an independent scroll area capped at 50vh/30rem and shrink further when needed. The code remains 16 px. Browser checks at 1440×1000, 1280×720 and 768×1024 reduced the five-line sample’s trailing gap from 334 px to 3 px, with the actions on screen. Long-diff scrolling, line selection, automatic rejection advance and 390 px mobile reflow remain working. See compact-diff.png.
