# Plan 012: Template authoring pipeline — auto-manifest, validation, preview, coverage

> **Executor instructions**: Follow this plan step by step. Run every
> verification command and confirm the expected result before moving to the
> next step. If anything in the "STOP conditions" section occurs, stop and
> report — do not improvise. When done, update the status row for this plan
> in `plans/README.md` — unless a reviewer dispatched you and told you they
> maintain the index.
>
> **Drift check (run first)**: `git diff --stat 04c0ce6..HEAD -- scripts/ package.json .github/ data/prTemplates/templateManifest.ts tests/ pages/ .vscode/settings.json docs/pr-template-guide.md CONTRIBUTING.md README.md`
> If any in-scope file changed since this plan was written, compare the
> "Current state" excerpts against the live code before proceeding; on a
> mismatch, treat it as a STOP condition.

## Status

- **Priority**: P2
- **Effort**: M
- **Risk**: LOW-MEDIUM (new validation may flag existing content — handled by a
  report-only first pass in step 2; no game-logic changes)
- **Depends on**: none (001's suite is the gate; already merged)
- **Category**: DX / content pipeline
- **Planned at**: commit `04c0ce6`, 2026-07-14 (rebased after Plan 011)

## Why this matters

Authoring a PR template today means hand-writing a diff as JSON (maintaining
`lineNumber` sequences and `isNew` flags by hand), remembering to run
`npm run generate:templates` (forgetting it means the template silently never
spawns), getting no validation beyond a TypeScript `as` assertion (enum typos
like `"kind": "secruity"` compile fine), and verifying by booting the game
and waiting for a wave to spawn the template. This plan turns that folder
convention into a pipeline: the manifest regenerates itself, mistakes fail
the build with a message, any template can be previewed in seconds, and a
coverage report says what content is missing. A deliberate **non-goal** is a
scaffolder CLI — once validation enforces id uniqueness, folder creation is
the only thing left to automate and it isn't worth a tool.

This also unblocks scale authoring: the learning-mode build-out
(`docs/learning-mode-curriculum.md`, plan 010) needs a large annotation and
generation pass, which is only sane with validation + coverage reporting in
place.

## Current state

- ~390 templates at `data/prTemplates/<language>/<template-id>/template.json`
  across 7 language packs (css, generic, java, javascript, python, rust,
  typescript).
- `scripts/build-template-manifest.mjs` walks the tree and regenerates
  `manifest.<language>.ts` + `templateManifest.ts` (generic eager, rest
  lazy). It performs **no validation**: it JSON-parses only to read
  `templateId` (falling back to the folder name on parse failure!) and emits
  `as PullRequestTemplate[]` assertions.
- `package.json` scripts: `dev`, `build`, `start`, `lint`, `typecheck`,
  `test` (vitest), `generate:templates`. **No `predev`/`prebuild` hooks.**
- `.github/workflows/ci.yml`: single `check` job — npm ci → typecheck →
  lint → test → build. No manifest-drift check.
- `.vscode/settings.json` exists (no `json.schemas` mapping today).
- Enums (from `types/index.ts` / `docs/pr-template-guide.md`): bug `kind`:
  `logic|security|performance|style|accessibility`; `severity`: `minor|major|critical`;
  `importance`: `low|normal|high`; optional `localized.es` metadata.
- `utils/pr.ts:16` — `instantiatePullRequest(template, day, index, locale)`
  → `PullRequest`; this is the only path templates take into the game.
- `components/work/PRViewer.tsx:8` — props `{ pr, selectedLines,
  onToggleLine, actionSlot? }`; `selectedLines` already renders line
  highlights, so a preview page can highlight bug lines **without modifying
  the component**.
- **Known data wrinkle**: at least one folder/id mismatch exists —
  `generic/pr-000-onboarding-readme/` holds `templateId`
  `pr-000-onboarding-readme-update` (visible in `manifest.generic.ts:3`).
  There may be others; step 2 discovers them before enforcement.
- `docs/pr-template-guide.md` — the authoring worksheet (step 6 references
  the manual regenerate step; update it as steps land).
- `.kiro/steering/product.md` references a generation prompt at
  `.kiro/prompts/generate-pr-template.md` that **does not exist** (the
  similarly named `content-templates.md` belongs to a different project —
  do not touch it).
- `CONTRIBUTING.md` has an "Adding a new PR template" section describing the
  **old** workflow (manual regenerate, no validation/preview/test); its
  "Common scripts" list omits `npm test` entirely. `README.md:338` claims a
  "hard-coded pool of ~20 PR templates" (there are ~390 auto-discovered
  ones) and `README.md:379` documents `generate:templates` as a manual step.
  `.github/` contains only `workflows/` — no pull-request template.
- Non-negotiables that bind this plan (`agent.md`): #3 all templates flow
  through the manifest system (we automate it, never bypass it); #5/#6
  two-space indentation in template code; #7 bulk edits to templates only in
  small reviewed batches.

## Scope

**In scope**:
- `package.json` (`predev`/`prebuild` hooks, `templates:report` script)
- `.github/workflows/ci.yml` (manifest drift step)
- `scripts/build-template-manifest.mjs` (validation pass)
- New: `data/prTemplates/template.schema.json`, `scripts/template-report.mjs`,
  `tests/templates.test.ts`, `pages/dev/templates/index.tsx`,
  `pages/dev/templates/[id].tsx`, `.kiro/prompts/generate-pr-template.md`
- `.vscode/settings.json` (`json.schemas` mapping only)
- `docs/pr-template-guide.md` (reflect the new workflow)
- `CONTRIBUTING.md`, `README.md` (contributor-facing docs — step 7)
- New: `.github/PULL_REQUEST_TEMPLATE.md` (step 7)
- Template content **only** as narrowly required by step 2 findings (e.g.
  one folder rename), each as its own commit
- `plans/README.md` (status row)

**Out of scope** (do NOT do these):
- A scaffolder CLI (deliberately rejected — see "Why this matters").
- The diff importer (paste a unified diff → template JSON) — approved
  direction but a separate follow-up plan.
- `difficultyTier` schema/validation — belongs to the learning-mode
  build-out (plan 010 piece 1); design the validator so adding a field
  check later is one line, nothing more.
- Any change to spawn logic, waves, `usePRSpawner`, or `PRViewer`.
- Bulk edits to template content (indentation normalization, adding
  `$schema` keys to 390 files — editor mapping via `.vscode` makes the
  latter unnecessary).

## Git workflow

- Branch: `advisor/012-template-authoring-pipeline`
- Conventional commits per step, e.g. `build(templates): regenerate manifest automatically`,
  `feat(templates): validate template JSON during manifest build`
- Do NOT push or open a PR unless the operator instructed it.

## Steps

### Step 1: Make the manifest regenerate itself

- `package.json`: add `"predev": "npm run generate:templates"` and
  `"prebuild": "npm run generate:templates"`.
- `ci.yml`: after `npm ci`, add a drift step:
  `npm run generate:templates && git diff --exit-code -- data/prTemplates`
  (fails CI if a committed manifest is stale or someone hand-edited one).
- `docs/pr-template-guide.md` step 6: note the manifest now regenerates on
  `dev`/`build`; running it manually remains optional for instant feedback.

**Verify**: `npm run dev` output shows the generator ran before Next starts;
`npm run build` exit 0; deliberately touch a manifest file, run the CI drift
command locally, confirm non-zero exit, then restore.

### Step 2: Validation — schema for editors, checks in the build script

1. Write `data/prTemplates/template.schema.json` (JSON Schema draft-07):
   required fields (`templateId`, `title`, `author`, `description`, `tags`,
   `importance`, `files`, `bugPatterns`), enum constraints (`kind`, `severity`,
   `importance`), `files[].lines[]` item shape (`lineNumber` integer ≥1,
   `content` string, `isNew` boolean), optional `localized`. `tags` and
   `bugPatterns` are required arrays because `instantiatePullRequest` consumes
   both directly; `bugPatterns` may be empty. Map it in `.vscode/settings.json` via `json.schemas` with
   `fileMatch: ["data/prTemplates/**/template.json"]` — this gives
   autocomplete + inline errors in-editor **without touching any template
   file**.
2. Extend `scripts/build-template-manifest.mjs` with a validation pass
   (hand-rolled, **no new dependencies** — the checks are simple and a dep
   would drift from the schema anyway; keep schema and script in sync
   manually, they change rarely):
   - JSON parses (parse failure is now an **error**, not a silent fallback);
   - required fields present with correct primitive types;
   - enum membership for `kind` / `severity` / `importance`;
   - `templateId` unique repo-wide;
   - `templateId` matches its folder name;
   - every `bugPatterns[].lineNumbers` entry exists in some
     `files[].lines[].lineNumber` **and** that line has `isNew: true`
     (a bug annotated on an unchanged context line is an authoring error);
   - `files` and each `files[].lines` non-empty.
   Collect **all** violations and print them with file paths before exiting
   non-zero — authors fix in one round, not one error at a time.
3. **Report-only first pass**: run
   `node scripts/build-template-manifest.mjs --report-only` over the existing
   ~390 templates. This mode prints all diagnostics, performs no manifest
   writes, and exits zero despite validation errors. Record every violation
   in the commit message / report. Expected: the `pr-000-onboarding-readme` folder/id
   mismatch, possibly a few more. For each finding: trivially mechanical
   fixes (a folder rename — safe: only the generated manifests reference
   paths, and they regenerate) are applied as **individual commits**; if a
   rule produces violations in more than ~10 existing templates, do not fix
   content and do not enforce that rule — downgrade it to a warning and
   record it as a follow-up (non-negotiable #7: no bulk template edits).
4. Flip enforcement on for the clean rules.

**Verify**: `npm run generate:templates` exit 0 on the repo as it stands
after fixes; corrupt a scratch copy of one template (bad enum, duplicate id,
bug pointing at an `isNew: false` line) and confirm each produces a clear
error and non-zero exit; restore. Open a `template.json` in VS Code and
confirm the schema mapping resolves (autocomplete on `kind`).

### Step 3: Instantiation test

New `tests/templates.test.ts`: statically import every
`manifest.<language>.ts` pack, and for each template call
`instantiatePullRequest(template, 1, 0, 'en')` and `(…, 'es')`; assert it
returns an object with a non-empty id, title, and at least one file with at
least one line, and that no call throws. This is the runtime backstop for
whatever the structural validator can't see. Keep it one `describe` with a
per-template `it` name (`templateId`) so failures identify the file.

**Verify**: `npm test` → green, test count increases by ~2×template-pack
count or per-template (either granularity is fine; state which).
Deliberately break a scratch template and confirm the failing test names it;
restore.

### Step 4: Coverage report

New `scripts/template-report.mjs` + `"templates:report"` script: walk the
same tree (reuse the walker from the manifest script if trivially
extractable — do not over-engineer a shared module for two ~100-line
scripts) and print, as aligned text tables:
- template count per language × bug kind, with a clean-PR (no
  `bugPatterns`) column;
- count per severity per language;
- localization: count of templates missing `localized.es` per language.

**Verify**: `npm run templates:report` exit 0; totals sum to the number of
`template.json` files (`find data/prTemplates -name template.json | wc -l`).

### Step 5: Dev-only preview route + gallery

Two pages, both hard-gated out of production via `getServerSideProps`
returning `{ notFound: true }` when `process.env.NODE_ENV === 'production'`
(server deployment is canonical since plan 002, so this gate is reliable):

- `pages/dev/templates/index.tsx` — the gallery: loads `eagerTemplates` +
  every `templateLoaders` pack client-side, lists all templates with
  language / bug-kind / severity filters and a missing-ES badge; each row
  links to the preview page.
- `pages/dev/templates/[id].tsx` — the preview: finds the template by id,
  runs it through `instantiatePullRequest(template, 1, 0, locale)`, and
  renders the real `PRViewer` with `selectedLines` set to the union of
  `bugPatterns[].lineNumbers` (bug lines pre-highlighted), a noop-or-toggle
  `onToggleLine`, an en/es toggle via the existing `LocaleContext`, and the
  bug descriptions listed under the viewer. No changes to `PRViewer`
  itself. Because template JSON files are webpack module imports, editing a
  `template.json` hot-reloads the preview — near-live editing.

Styling: minimal, CSS Module (`styles/DevTemplates.module.css`) — this is a
dev tool, not a designed surface; do not add inline styles (plan 011's
convention) and do not spend effort on visuals.

**Verify**: `npm run dev` → `/dev/templates` lists all templates and filters
work; a template with bugs shows highlighted lines and descriptions on its
preview page; edit that template's JSON and confirm the page hot-reloads;
`npm run build && npm run start` → both routes return 404. Full suite green.

### Step 6: Write the generation prompt

Create `.kiro/prompts/generate-pr-template.md` (the file `product.md`
already claims exists): inputs = language, bug kind(s) (including `accessibility`), difficulty/severity,
count; instructions = produce `template.json` files valid against
`data/prTemplates/template.schema.json`, two-space indentation (fenced
markdown included — non-negotiables #5/#6), realistic diffs with honest
`isNew` flags, bug `lineNumbers` only on `isNew` lines, unique ids matching
folder names, optional `localized.es`; workflow = generate in small batches
(≤10, non-negotiable #7), then run `npm run generate:templates` (validator)
and `npm test` (instantiation) and fix anything flagged before presenting
for human review in `/dev/templates`.

**Verify**: the referenced paths in the prompt all exist; `product.md`'s
existing reference is now accurate (no edit to `product.md` needed).

### Step 7: Documentation — internal guide and open-source contributor path

Two audiences, three files. Write this step **last** so every command and
route it documents already exists.

1. **`CONTRIBUTING.md`** — make "contribute your own PRs" the headline
   contributor path, since content is the easiest way in for outsiders:
   - Fix "Common scripts": add `npm test` and `npm run templates:report`;
     note `generate:templates` now runs automatically on `dev`/`build`.
   - Rewrite "Adding a new PR template" around the new loop: author the
     JSON (worksheet at `docs/pr-template-guide.md`, or AI-assisted via
     `.kiro/prompts/generate-pr-template.md`; editor autocomplete comes from
     the schema mapping) → validation runs on `npm run dev` and names any
     problem → preview live at `/dev/templates/<id>` (bug lines highlighted,
     en/es toggle, hot-reloads on edit) → `npm test` proves it instantiates →
     `npm run templates:report` to see which language/bug-kind cells need
     content, i.e. where a contribution helps most.
   - State the content house rules in contributor terms: two-space
     indentation (including inside markdown fences), bugs only on changed
     (`isNew`) lines, unique id matching the folder, Spanish `localized`
     copy encouraged but optional, batches of ≤10 templates per pull
     request.
2. **`README.md`** — surgical edits only, no restructure: fix the stale
   "~20 PR templates" claim at line 338 (~390, auto-discovered from
   `data/prTemplates/`); update the `generate:templates` note at line 379
   (auto-runs; manual invocation optional); add a short **"Add your own
   PRs"** subsection (3–5 lines) near the scripts section that pitches
   contributing a template and links to `CONTRIBUTING.md` and the guide.
3. **`.github/PULL_REQUEST_TEMPLATE.md`** — new, short, two sections: a
   general one (what/why, `lint`/`typecheck`/`test` run), and a
   "Content templates" checklist for template PRs (validator passes on
   `npm run generate:templates`, `npm test` green, previewed at
   `/dev/templates/<id>`, ≤10 templates, two-space indentation, ES copy
   considered). Do **not** add issue-form templates — out of scope.

Keep `docs/pr-template-guide.md` the single source of truth for the JSON
format: CONTRIBUTING links to it rather than duplicating field tables, so
the format is documented in exactly one place (the guide) with the schema as
its machine twin.

**Verify**: every command, path, and route mentioned in the three files
exists and works as described (run each command once); no remaining mention
anywhere in `README.md`/`CONTRIBUTING.md` of the manual-only regenerate
workflow; `grep -rn "20 PR templates" README.md` → empty.

## Test plan

Automated: `npm run typecheck && npm run lint && npm test && npm run build`
after every step (92 tests baseline + step 3's additions). CI drift step
exercised locally in step 1.

Manual: the step 5 checklist (gallery, filters, highlight, hot reload,
production 404), plus one end-to-end authoring dry run: create a scratch
template by hand following the updated guide, watch the validator catch a
seeded mistake, fix it, preview it at `/dev/templates/<id>`, then delete the
scratch template and regenerate.

## STOP conditions

- Drift check shows in-scope files changed since `04c0ce6`.
- The report-only pass (step 2.3) finds violations in **more than ~10%** of
  existing templates for any single rule — the rule is probably wrong for
  this content; report findings instead of fixing content or enforcing.
- Renaming the `pr-000-onboarding-readme` folder breaks the day-1 scripted
  tutorial wave (it must not — the wave references `templateId`, not the
  folder — but if any test or playtest says otherwise, stop; non-negotiable
  #2).
- Any pre-existing test fails, or step 3's instantiation test fails on
  existing templates (that's a real content bug — report it, fix only if
  it's isolated and mechanical).
- You find yourself wanting to add a dependency (ajv, glob, chalk, a table
  printer) — the plan says hand-rolled; stop and report if that genuinely
  seems wrong.

## Done criteria

- Forgetting `generate:templates` is impossible in `dev`/`build` and caught
  by CI otherwise.
- An invalid template (bad enum, duplicate id, bug on a context line) fails
  `npm run generate:templates` with a message naming the file; editors get
  schema autocomplete via the `.vscode` mapping.
- Every template instantiates in both locales under `npm test`.
- `npm run templates:report` prints the coverage tables.
- `/dev/templates` (gallery) and `/dev/templates/[id]` (preview with bug
  highlights + locale toggle) work in dev and 404 in production.
- `.kiro/prompts/generate-pr-template.md` exists and matches `product.md`'s
  description.
- `docs/pr-template-guide.md` describes the new workflow; full suite green.
- An outside contributor can go from `git clone` to a previewed, validated
  template following `CONTRIBUTING.md` alone; `README.md` pitches template
  contributions and contains no stale content claims; template PRs get the
  `.github/PULL_REQUEST_TEMPLATE.md` checklist.
