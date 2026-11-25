# Landing refresh and live-desk migration plan

The `/` landing page now uses the approved ivory/violet system, existing coworker portraits, an illustrative PR card, a three-meter explanation, compact language/difficulty setup and a ten-person team roster. The hero CTA jumps directly to setup; Start navigates to the existing `/game` briefing. The illustration has no pretend verdict buttons.

Public identity metadata lives in `data/characters.ts`; the landing imports no curated scenario code or answers. The existing study registry will be consolidated with it in migration stage 1. All new copy is EN/ES through `constants/i18n.ts` and `constants/landingPageCopy.ts`.

Learning mode is accurately described as timed with queue penalties disabled. Language selection retains the existing minimum-one behavior and documentation/config eligibility. No simulation, scoring, wave, tutorial PR, leaderboard API or database changes are included.

The six existing guide lessons now use a native dialog with keyboard focus containment, Escape and focus return, replacing the old screenshot-placeholder carousel presentation. The shared leaderboard dialog also uses native modal behavior, the new styling, localized labels/date formatting and existing read-only API. Its existing game-over entry point receives these presentation improvements too.

## Browser evidence

- Desktop 1440×900 / 1280×720, tablet 768×1024 and phones 390×844 / 320×740: no document horizontal overflow.
- Root text enlarged to 200% at 320 px in EN and ES: no horizontal document overflow after correcting narrow-grid text wrapping. This is CSS text enlargement, not a claim of full OS/browser zoom certification.
- All ten team portrait images decode successfully.
- Six guide slides, first-slide Previous disabled, final dismissal, Escape and opener focus return pass.
- Setup anchor, language toggling/minimum selection, learning radio, bilingual copy and Start → real Spanish Day 1 briefing pass.
- Leaderboard populated table, translated column labels, dismissal and keyboard behavior pass using mocked API responses. No public scores were submitted.
- The existing redesigned desk remains at `/dev/design`; this request plans its migration rather than performing it.

Screenshots in `docs/design-study/`: `landing-desktop.png`, `landing-setup.png`, `landing-mobile-es.png`, `landing-setup-mobile-es.png`, `landing-guide-es.png`.

## Validation and limits

526 tests pass with one worker; typecheck and production build pass; 390 templates validate with manifests unchanged. Lint has no errors and four pre-existing warnings (the former landing image warning is removed).

Full screen-reader/observed usability audits and the production work-desk migration remain pending. The detailed implementation checklist and rollback considerations are in `plans/014-live-desk-migration.md`; the broader roadmap remains `plans/013-ui-ux-characters-and-authoring.md`.
