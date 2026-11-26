# PR Template Authoring Guide

This guide is the human source of truth for authoring pull-request content. The machine-readable twin is [`data/prTemplates/template.schema.json`](../data/prTemplates/template.schema.json).

Each template lives at:

`data/prTemplates/<language>/<template-id>/template.json`

The `templateId` must be unique across the repository and exactly match its containing folder name. Keep contributions reviewable: submit no more than 10 templates in one pull request.

## Template format

Every template requires these top-level fields:

- `templateId`: unique string matching the containing folder.
- `title`, `author`, `description`: English metadata strings.
- `tags`: required string array. Prefer meaningful lowercase tags; do not omit the array.
- `importance`: `low`, `normal`, or `high`.
- `files`: required, non-empty array of file diffs.
- `bugPatterns`: required array. Use `[]` for a clean PR; do not omit it.
- `localized`: locale metadata. The schema keeps it optional for backward compatibility, but committed catalog templates must include Spanish (`localized.es`) metadata.

Every committed catalog template must select a coworker with `authorId`. Use one of the exact registry IDs: `lucia`, `diego`, `ines`, `tessa`, `ben`, `jonah`, `marta`, `evan`, `noel`, or `riya`. Set `author` to the matching canonical name in `data/characters.ts`; localized author names, when supplied, must match too. The development workshop's **Cast ID (optional)** field remains optional for external drafts, but must be filled before committing a catalog template. It previews the matching portrait and localized role. Catalog tests reject missing or unknown coworker IDs. Default character reactions are supplied automatically unless a template provides its own.

### Files and lines

Each `files` entry requires:

- `filename`: the hypothetical repository path.
- `language`: the language used by the diff.
- `lines`: a non-empty array of line objects.

Each line requires a positive integer `lineNumber`, string `content`, and boolean `isNew`. Set `isNew: true` only for a line added or modified by this PR; retained context must use `false`. Use two-space indentation in JSON and in template source content, including code inside Markdown fences.

### Bug patterns

Each bug requires:

- `kind`: one of `logic`, `security`, `performance`, `style`, or `accessibility`.
- `lineNumbers`: a non-empty array of offending line numbers.
- `severity`: `minor`, `major`, or `critical`.
- `description`: optional player-facing explanation.
- `localizedDescription`: optional locale-to-description map, such as `{ "es": "…" }`.

Every bug line number must exist in a file diff and point to a changed line with `isNew: true`. If context helps explain a bug, annotate the changed line that introduces the problem rather than the unchanged context.

## Example

```json
{
  "templateId": "typescript-081-missing-focus-name",
  "title": "Add icon-only export action",
  "author": "Ben",
  "authorId": "ben",
  "description": "Adds an export button to the report toolbar.",
  "tags": [
    "reports",
    "accessibility"
  ],
  "importance": "normal",
  "files": [
    {
      "filename": "components/ReportToolbar.tsx",
      "language": "tsx",
      "lines": [
        {
          "lineNumber": 18,
          "content": "export const ReportToolbar = () => (",
          "isNew": true
        },
        {
          "lineNumber": 19,
          "content": "  <button onClick={downloadReport}><DownloadIcon /></button>",
          "isNew": true
        },
        {
          "lineNumber": 20,
          "content": ");",
          "isNew": true
        }
      ]
    }
  ],
  "bugPatterns": [
    {
      "kind": "accessibility",
      "lineNumbers": [19],
      "severity": "major",
      "description": "The icon-only button has no accessible name. Add an aria-label or visible text."
    }
  ],
  "localized": {
    "es": {
      "title": "Agregar una acción de exportación solo con icono",
      "author": "Ben",
      "description": "Agrega un botón de exportación a la barra de herramientas de informes.",
      "tags": [
        "informes",
        "accesibilidad"
      ]
    }
  }
}
```

For a clean PR, keep the required field and write `"bugPatterns": []`.

## Validation and editor support

Opening any `data/prTemplates/**/template.json` file in VS Code uses the repository mapping in [`.vscode/settings.json`](../.vscode/settings.json) and [`template.schema.json`](../data/prTemplates/template.schema.json) for autocomplete and inline errors.

The manifest generator performs the enforced validation. It collects all violations, prints each affected path, and exits non-zero before writing manifests when it finds:

- invalid JSON or a non-object template root;
- missing fields or incorrect string, array, object, integer, or boolean types;
- invalid `importance`, bug `kind`, or bug `severity` values;
- an empty `files` array or an empty `files[].lines` array;
- a duplicate repository-wide `templateId` or an ID that differs from its folder;
- empty or invalid bug line-number arrays;
- bug line numbers that are missing from the diff or refer to `isNew: false` context lines;
- invalid optional localization metadata or localized bug descriptions.

`npm run dev` and `npm run build` automatically run `npm run generate:templates` first through the `predev` and `prebuild` hooks. Run `npm run generate:templates` manually only when you want immediate validation and manifest regeneration without starting or building the app. Never hand-edit generated `manifest.<language>.ts` files or `templateManifest.ts`.

## Test, coverage, and preview workflow

1. Choose a coverage gap by running `npm run templates:report`. The report shows template counts by language and bug kind (including clean PRs), bug-pattern severity counts, and templates missing `localized.es`.
2. Create `data/prTemplates/<language>/<template-id>/template.json`, following the format above. For AI-assisted drafting, use [`.kiro/prompts/generate-pr-template.md`](../.kiro/prompts/generate-pr-template.md).
3. Run `npm run generate:templates` for immediate validation, or let `npm run dev` run it automatically. Fix every reported problem.
4. Run `npm test`. [`tests/templates.test.ts`](../tests/templates.test.ts) instantiates every generated template in both English and Spanish and verifies non-empty playable output.
5. In development, open `/dev/templates` to browse and filter the catalog, find missing Spanish metadata, and select a template. Open `/dev/templates/<template-id>` for the real `PRViewer`, pre-highlighted bug lines, bug descriptions, and the English/Spanish toggle. Editing imported template JSON hot-reloads the preview.
6. Review the rendered diff, metadata, bug annotations, and any Spanish copy before submitting.

The preview gallery is intentionally development-only. Both `/dev/templates` and `/dev/templates/<template-id>` return 404 when `NODE_ENV` is `production`; use `npm run dev` for this workflow.

## Submission checklist

- [ ] The template ID is unique and exactly matches its folder.
- [ ] `tags` and `bugPatterns` are present; clean PRs use an empty `bugPatterns` array.
- [ ] JSON and source content use two-space indentation, including Markdown fences.
- [ ] Every annotated bug line exists and has `isNew: true`.
- [ ] Only the five supported bug kinds and valid importance/severity values are used.
- [ ] Optional Spanish metadata and bug descriptions are accurate when included.
- [ ] `npm run generate:templates` and `npm test` pass.
- [ ] The template was reviewed at `/dev/templates/<template-id>`.
- [ ] The pull request contains at most 10 templates.

## Refresh foundation metadata

Committed catalog templates include a valid authorId and canonical author. The underlying schema still accepts guest authors for external drafts and backward compatibility. Localized reactions, rowId/kind on rows, and file-qualified lineRefs on bugs remain optional. Keep author, isNew and numeric lineNumbers for compatibility. false without kind means context, not deletion. Explicit kind=removal with isNew=false represents a removed row and can be flagged. Explicit lineRefs must project to the same lineNumbers. Without explicit references, bug numbers must remain unambiguous across the PR; file-qualified references disambiguate equal numbers in different files. Character portraits, localized roles, reactions, file-scoped selection and the new review semantics are active in the live desk and contributor workshop.

The shared browser-safe validator returns field paths, diagnostic codes and messages. Normal generation additionally checks folder names and repository-wide uniqueness. Report-only output is diagnostic, not an exit-code validation gate. See the adjacent content-contract.md and review-behavior-contract.md for examples and the migration boundary.
