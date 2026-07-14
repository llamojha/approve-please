# Generate PR Templates

Use this prompt to create reviewable `template.json` batches for Approve Please.

## Inputs

Ask for or use these inputs before generating anything:

- **Language pack:** one existing folder under `data/prTemplates/` (for example `typescript`, `python`, `css`, or `generic`)
- **Bug kind(s):** one or more of `logic`, `security`, `performance`, `style`, and `accessibility`
- **Difficulty and severity:** the intended learner difficulty plus `minor`, `major`, or `critical` severity for every bug
- **Count:** number of templates requested
- Optional theme, product domain, or localization requirements

If the requested count is greater than 10, split the work into independently reviewable batches of **at most 10 templates**. Never generate a bulk template change larger than that.

## Output contract

Generate one complete file per template at:

`data/prTemplates/<language>/<templateId>/template.json`

Every file must validate against `data/prTemplates/template.schema.json`. Provide JSON only for each file unless the requester also asks for explanations. Use **two-space indentation everywhere**, including JSON embedded in fenced Markdown code blocks.

Every template requires these fields and arrays:

- `templateId`, `title`, `author`, `description`, `importance`
- `tags`: required array (it may be empty only if the schema permits it; prefer meaningful tags)
- `files`: required, non-empty array; every file has `filename`, `language`, and a non-empty `lines` array
- `bugPatterns`: required array; use `[]` for a clean PR, never omit it

A file line has `lineNumber`, `content`, and `isNew`. Make `isNew` honest: `true` only for lines added by the PR and `false` only for retained context. Every `bugPatterns[].lineNumbers` value must point to an existing line where `isNew` is `true`. Do not annotate a context line as the bug merely because it helps explain the issue.

`templateId` must be globally unique and must exactly match its containing folder name. For example, `css-081-missing-focus-ring` belongs in `data/prTemplates/css/css-081-missing-focus-ring/template.json`.

Use only valid enum values:

- `importance`: `low`, `normal`, `high`
- bug `kind`: `logic`, `security`, `performance`, `style`, `accessibility`
- bug `severity`: `minor`, `major`, `critical`

Make the diff realistic, concise, and reviewable. The bug description must explain the concrete problem and the safe remediation. For `accessibility`, include issues such as keyboard focus, semantic controls, labels, contrast, or screen-reader behavior when appropriate; do not mislabel a general visual preference as accessibility.

Add optional `localized.es` metadata and `localizedDescription.es` for bug patterns when confident in the translation. Spanish localization is encouraged but not required; never produce inaccurate Spanish just to fill the field.

## File shape example

```json
{
  "templateId": "typescript-081-missing-focus-name",
  "title": "Add icon-only export action",
  "author": "Avery N.",
  "description": "Adds an export button to the report toolbar.",
  "tags": [
    "reports",
    "toolbar"
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
      "description": "The icon-only button has no accessible name. Add an aria-label or visible text describing the export action.",
      "localizedDescription": {
        "es": "El botón con solo un icono no tiene nombre accesible. Agrega un aria-label o texto visible que describa la acción de exportar."
      }
    }
  ],
  "localized": {
    "es": {
      "title": "Agregar acción de exportación solo con icono",
      "description": "Agrega un botón de exportación a la barra de herramientas de informes.",
      "tags": [
        "informes",
        "barra de herramientas"
      ],
      "author": "Avery N."
    }
  }
}
```

## Required workflow

For each batch, follow this sequence before presenting it for human review:

1. Create the folder and `template.json` files with unique folder-matching IDs.
2. Run `npm run generate:templates`. This runs the template validator and regenerates the manifest; fix every reported schema, enum, duplicate-ID, line-reference, or `isNew` error.
3. Run `npm test` to verify every template instantiates in English and Spanish.
4. Run `npm run templates:report` and report which language × bug-kind, severity, and Spanish-localization coverage cells the batch changes.
5. Start the dev server if needed and inspect each template at `/dev/templates/<templateId>`. Confirm the gallery filters find it, bug lines are highlighted in the real `PRViewer`, descriptions read correctly in English and Spanish when supplied, and clean PRs show no bug details.
6. Present the validated batch for human review, listing the created IDs, bug kinds, severities, localization status, and command results. Do not claim success for commands or previews that were not run.

When a requested concept would require a bug on an unchanged context line, redesign the diff so the faulty behavior is introduced on a changed line instead.
