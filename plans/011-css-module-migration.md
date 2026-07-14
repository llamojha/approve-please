# Plan 011: Finish the CSS migration — extract the landing page's styled-jsx block

> **Executor instructions**: Follow this plan step by step. Run every
> verification command and confirm the expected result before moving to the
> next step. If anything in the "STOP conditions" section occurs, stop and
> report — do not improvise. When done, update the status row for this plan
> in `plans/README.md` — unless a reviewer dispatched you and told you they
> maintain the index.
>
> **Drift check (run first)**: `git diff --stat c3d71a4..HEAD -- pages/index.tsx styles/ components/common/HydrationErrorBoundary.tsx components/common/RunStatsCards.tsx components/screens/GameOverScreen.tsx .kiro/steering/tech.md`
> If any in-scope file changed since this plan was written, compare the
> "Current state" excerpts against the live code before proceeding; on a
> mismatch, treat it as a STOP condition.

## Status

- **Priority**: P2
- **Effort**: M
- **Risk**: LOW (styling only; no game logic touched)
- **Depends on**: none (001's test suite is the verification gate, already merged)
- **Category**: refactor / structure
- **Planned at**: commit `c3d71a4`, 2026-07-14

## Why this matters

The project began as an itch.io build where everything was compressed into
single files. That constraint is gone (plan 002 removed the static-export
pipeline), and the codebase has since standardized on CSS Modules in
`styles/` — but the landing page still carries the last big remnant: a
~507-line `<style jsx>` block inside `pages/index.tsx` (lines 299–806 of an
811-line file). `.kiro/steering/tech.md` explicitly tracks this as "CSS
Migration (In Progress)". This plan finishes that migration and closes the
steering doc item.

## Current state

- `pages/index.tsx` (811 lines): component code ends at line 298; lines
  299–806 are one `<style jsx>{...}</style>` block styling two BEM families:
  `.landing*` (locale toggle, card, intro, primer, language picker,
  difficulty picker, actions, CTA) and `.tutorial*` (the "How to play" modal:
  backdrop, content, image, text, controls, dots) plus one `@media
  (max-width: 800px)` block at the end.
- This is the **only** styled-jsx usage in the repo
  (`grep -rln "style jsx" pages/ components/` → only `pages/index.tsx`).
- Repo CSS convention (see `styles/Screen.module.css`, `styles/Desk.module.css`,
  `styles/Leaderboard.module.css`, `styles/LeaderboardModal.module.css`):
  CSS Modules in `styles/`, **camelCase** class keys (`.screenShell`,
  `.screenCard`), imported as `import styles from "../styles/X.module.css"`.
  Theme tokens (`--bg`, `--accent`, `--border`, `--muted`, …) and a global
  `.muted` class live in `styles/globals.css`.
- Known static inline styles that the tech.md migration note says belong in
  CSS Modules (dynamic values stay inline — that's explicitly allowed):
  - `components/common/HydrationErrorBoundary.tsx:51–64` — five static
    `style={{}}` objects (full-viewport centering grid, muted text, button).
    The component imports **no** CSS module today.
  - `components/common/RunStatsCards.tsx:60` — `style={{ marginTop: '2rem' }}`
    on a div that already uses `styles.summaryGrid` from `Screen.module.css`.
  - `components/screens/GameOverScreen.tsx:138` — `style={{ fontSize: "0.85em" }}`
    on a `<p className="muted">`; the file already imports `Screen.module.css`.
  - **Leave alone** (dynamic, allowed): `MeterBar.tsx:32` (width/color from
    meter value), `ClockDisplay.tsx:22` (progress width), `QueuePanel.tsx:147`
    (importance hue lookup).
- `.kiro/steering/tech.md:38–40` — the "CSS Migration (In Progress)" section
  to update when this lands.
- A stale `out/` directory (old static-export artifact, gitignored) sits at
  the repo root.

## Migration gotchas (read before writing code)

1. **Relative asset URL breaks under CSS Modules.** `pages/index.tsx:335`
   has `background: url("social-card-no-title.jpg") …`. Under styled-jsx the
   browser resolves this against the page URL (`/`), so it works. In a CSS
   Module, webpack resolves `url()` against the CSS file's own directory
   (`styles/`) and the **build fails** because no such file exists there.
   Write it as `url("/social-card-no-title.jpg")` (public-root absolute).
2. **Bare element selectors are not pure.** The block styles a bare `h1`
   (line 388). CSS Modules reject selectors with no local class ("Selector
   'h1' is not pure"). Scope it under the class of its parent, e.g.
   `.intro h1 { … }` (the `h1` lives inside `.landing__intro`).
3. **State classes must come from the module too.** The JSX builds strings
   like `className={locale === value ? "active" : ""}` and
   `` `tutorial__dot ${active ? "active" : ""}` ``. After migration, `active`
   / `disabled` must be `styles.active` / `styles.disabled` — a bare string
   `"active"` will not match the hashed module selector
   (`.localeToggle button.active` etc.). Every conditional class expression
   in the file needs this treatment; missing one produces a silent visual
   bug, not a build error.
4. **Keep selector structure otherwise identical.** This is a mechanical
   port, not a redesign: same properties, same values, same media query.
   Only the class *names* change (BEM → camelCase per repo convention, e.g.
   `.landing__locale-toggle` → `.localeToggle`,
   `.tutorial__image-placeholder` → `.tutorialImagePlaceholder`).

## Scope

**In scope**:
- New file `styles/Landing.module.css` (the entire ported block, both
  `.landing*` and `.tutorial*` families plus the media query).
- `pages/index.tsx` — swap every `className` to `styles.*`, delete the
  `<style jsx>` block (file should shrink to roughly 300 lines).
- `components/common/HydrationErrorBoundary.tsx` + new
  `styles/HydrationErrorBoundary.module.css` (or classes appended to
  `Screen.module.css` if the executor judges that cleaner — either is
  acceptable; pick one and say which).
- `components/common/RunStatsCards.tsx`, `components/screens/GameOverScreen.tsx`
  — replace the two static inline styles with classes in
  `styles/Screen.module.css` (which both already import).
- `.kiro/steering/tech.md` — rewrite the "CSS Migration (In Progress)"
  section to reflect completion (state the convention: CSS Modules only;
  inline styles only for dynamic values).
- Delete the stale `out/` directory (gitignored build artifact).
- `plans/README.md` (status row).

**Out of scope** (do NOT do these, even if tempting):
- Extracting the tutorial modal into its own component
  (`components/tutorial/TutorialModal.tsx`) — worthwhile, but a separate
  structural change; keep this diff reviewable as a pure style migration.
- The hardcoded English strings on the landing page that bypass
  `constants/i18n.ts` (`"PRs will include code from selected languages"`,
  `"{n} selected"`, `"🏆 Leaderboard"`, `"At least one language required"`)
  — real issue, separate (i18n) plan.
- Any visual redesign, token changes, or `globals.css` edits.
- The dynamic inline styles listed above (MeterBar, ClockDisplay, QueuePanel).

## Git workflow

- Branch: `advisor/011-css-module-migration`
- Conventional commits, e.g. `refactor(css): extract landing page styles to CSS Module`
- Do NOT push or open a PR unless the operator instructed it.

## Steps

### Step 1: Port the style block to `styles/Landing.module.css`

Create the module with every rule from `pages/index.tsx:299–806`, renamed
BEM → camelCase, with the two fixes from the gotchas section (absolute
`url("/social-card-no-title.jpg")`, `h1` scoped under `.intro`). Keep the
`@media (max-width: 800px)` block. Suggested name map (complete it for all
~45 classes):

| styled-jsx | module key |
|---|---|
| `.landing` | `.landing` |
| `.landing__locale-toggle` | `.localeToggle` |
| `.landing__card` | `.card` |
| `.landing__intro` | `.intro` |
| `.landing__blurb` | `.blurb` |
| `.landing__primer(-header/-stats)` | `.primer`, `.primerHeader`, `.primerStats` |
| `.landing__language(-header/-hint/-options)` | `.language`, `.languageHeader`, `.languageHint`, `.languageOptions` |
| `.landing__difficulty(-header/-options)` | `.difficulty`, `.difficultyHeader`, `.difficultyOptions` |
| `.landing__actions` / `__secondary` / `__cta` | `.actions`, `.secondary`, `.cta` |
| `.tutorial`, `.tutorial__backdrop`, … | `.tutorial`, `.tutorialBackdrop`, `.tutorialContent`, `.tutorialClose`, `.tutorialBody`, `.tutorialImage`, `.tutorialImageImg`, `.tutorialImagePlaceholder`, `.tutorialText`, `.tutorialEyebrow`, `.tutorialControls`, `.tutorialNav`, `.tutorialDots`, `.tutorialDot` |
| `.active`, `.disabled` (state) | `.active`, `.disabled` |

**Verify**: `npm run build` → exit 0 (catches non-pure selectors and the
`url()` resolution; the module isn't imported yet, so also run
`npx stylelint` only if the repo configures it — it doesn't today, so build
is the gate).

### Step 2: Rewire `pages/index.tsx` and delete the block

Add `import styles from "../styles/Landing.module.css"`, convert every
`className` (including all conditional/compound ones — see gotcha 3), delete
the `<style jsx>` block. Grep the file afterward: `grep -n '"active"\|"disabled"\|landing__\|tutorial__\|style jsx' pages/index.tsx`
must return nothing.

**Verify**: `npm run typecheck && npm run lint && npm test` → all green;
`npm run build` → exit 0.

### Step 3: Migrate the three static inline styles

- `HydrationErrorBoundary.tsx`: move the five static objects into classes
  (new module or `Screen.module.css` — executor's call, state it in the
  commit message). Note this component renders during hydration failure, so
  keep it dependency-free beyond the CSS import.
- `RunStatsCards.tsx:60`: replace `style={{ marginTop: '2rem' }}` with a
  class (e.g. `.summaryGridSpaced`) in `Screen.module.css`.
- `GameOverScreen.tsx:138`: replace `style={{ fontSize: "0.85em" }}` with a
  class (e.g. `.mutedSmall`) in `Screen.module.css` alongside the global
  `muted` it already combines with.

**Verify**: `grep -rn "style={{" components/ pages/` → only the three
dynamic call sites remain (MeterBar, ClockDisplay, QueuePanel); full suite
green.

### Step 4: Close out the docs and artifacts

- Update `.kiro/steering/tech.md` "CSS Migration (In Progress)" → completed
  convention statement.
- `rm -rf out/` (stale static-export artifact; confirm it is still
  gitignored before and untracked after: `git status --porcelain` clean of
  `out/`).

**Verify**: `git status` shows only intended changes.

## Test plan

Automated: full suite — `npm run typecheck && npm run lint && npm test && npm run build`
(92 tests expected green; none of them assert on landing-page classes, so no
test edits should be needed — if one fails, that's a STOP, not a fix-up).

Manual (required — this is a visual-parity change): `npm run dev`, then on
`http://localhost:3000`:
1. Landing page renders identically: dotted background overlay, hero card
   with the `social-card-no-title.jpg` background image (this is the
   likeliest regression — gotcha 1), locale toggle pinned top-right.
2. Locale toggle: active pill highlights and switches en/es.
3. Language picker: selected pills highlight; the last selected pill can't
   be deselected; hover states work.
4. Difficulty picker: active state toggles between normal/learning.
5. Tutorial modal: opens, backdrop blurs, slides advance (dots update,
   active dot highlighted), close button works; narrow the window below
   800px and confirm the modal collapses to one column.
6. Game-over and summary screens unaffected (`Screen.module.css` additions
   are additive only).

## STOP conditions

- The drift check shows in-scope files changed since `c3d71a4`.
- `npm run build` fails on the CSS Module for any reason other than the two
  documented gotchas (non-pure selector, url resolution) — investigate, do
  not delete rules to make it pass.
- Any pre-existing test fails.
- Visual parity is off in a way you cannot map to a missed class rename —
  report the specific element and selector instead of restyling.
- You find additional `<style jsx>` blocks or new inline styles not listed
  in "Current state" (drift — the plan's inventory is stale).

## Done criteria

- Zero `<style jsx>` in the repo; zero static inline `style={{}}` outside
  the three dynamic call sites.
- `pages/index.tsx` contains no CSS.
- Full verification suite green; manual checklist above passes.
- `.kiro/steering/tech.md` no longer lists the migration as in progress.
- `out/` removed.
