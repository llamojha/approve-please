# Phase 1 rendered study

Open `/dev/design` on the development server. This is a replayable design study, not the production game. The production route returns 404. It shares the pure decision evaluator but has no live timer, spawning, save or leaderboard writes.

Implemented and browser-checked on 31 October 2026:

- Desktop 1280×720: visible code, both verdicts and persistent receipt; independent diff/sidebar scrolling.
- Phone 390×844: Spanish copy, horizontally scrollable code, sticky actions, reachable queue and handbook.
- Tablet 768×1024: active/empty layouts; disabled actions in empty state.
- Constrained 640×360 reflow: no document horizontal overflow. This checks CSS reflow, not actual OS/browser zoom behavior.
- Clean approval, buggy rejection without tags and precise rejection produce expected sample deltas; receipt retains previous author on switching.
- Keyboard Space tags a row; Enter submits; repeated submission is disabled. Native modal Escape returns focus to its trigger.
- Light/dark portraits and six-expression study; every referenced image loads. Alpha PNGs are256×256 and31–33 KB each.
- Light secondary text contrast corrected to5.76:1 on paper,5.18:1 on receipt and5.56:1 on additions.

Evidence: desktop-light.png, desktop-dark.png, mobile-es.png, tablet-empty.png, characters.png. Prompt set and asset manifest accompany the images. Independent review findings on contrast and completed-state clarity were addressed before this delivery.

Owner visual approval remains the checkpoint before Phase 2. Observed-user comprehension, exhaustive screen-reader testing and OS zoom checks are not claimed here; they remain in the later integration audit.

Validation:506 tests pass (single worker), typecheck and build pass,390 templates validate without manifest changes. Lint has five pre-existing warnings and no errors. A production-server browser request to `/dev/design` displayed404.

## Speed-first revision
Owner feedback removes the visible Last review panel and next arrow. Verdicts now update meters and automatically advance after a 200 ms directional swipe (instant with reduced motion). Desktop-light evidence is updated; other screenshots above record the earlier study. Verified both verdicts, cleared tags, reduced motion and phone overflow in a real browser; 13 targeted tests, typecheck and lint pass (five existing warnings).
