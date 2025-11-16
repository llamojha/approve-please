# PR Template Authoring Template

This markdown file is meant to be copy/pasted whenever someone wants to contribute a new PR template under `data/prTemplates/<language>/<your-template-id>/template.json`. Fill in each section, then translate it to JSON.

---

## 1. Template Overview

- **Template ID**: `pr-###-your-slug` (must be unique repository-wide; match the folder/file name).
- **Title**: Short, action-focused summary of the change.
- **Author**: Fictional teammate responsible for the PR.
- **Description**: 1–2 sentences describing what the PR attempts to do.
- **Tags**: 2–3 lowercase keywords (e.g., `security`, `cleanup`).
- **Importance**: `low`, `normal`, or `high`.
- **Primary Language**: `typescript`, `python`, `java`, etc. (matches `language` in the `files` entries).

```
Template ID: <replace>
Title: <replace>
Author: <replace>
Description: <replace>
Tags: <tag-1>, <tag-2>
Importance: <low|normal|high>
Primary Language: <language>
```

## 2. Files & Diffs

List each file touched by the PR. Every line needs:

- `lineNumber`: Match the line number in the hypothetical repo file.
- `content`: The full source line (2-space indentation for TS/JS content).
- `isNew`: `true` if the line was added/modified, `false` for unchanged context.

```
Filename: <path/to/file.ext>
Language: <language>
Lines:
  1. [lineNumber] <content>
     isNew: <true|false>
  2. ...
```

## 3. Bug Patterns (optional)

Each bug represents a real issue hidden inside the diff:

- `kind`: `logic`, `security`, `performance`, or `style`.
- `lineNumbers`: Array of the offending line numbers.
- `severity`: `minor`, `major`, or `critical`.
- `description`: Player-facing explanation of the bug.
- `localizedDescription` (optional): map of locale → translation.

```
Bug Kind: <logic|security|performance|style>
Severity: <minor|major|critical>
Line Numbers: [<n>, <n>]
Description: <why this is a bug>
Localized Description (optional):
  es: <traducción>
```

## 4. Localization (optional)

If you have ES copy for metadata, include it here. Leave blank to fall back to English.

```
Title (es): <replace or omit>
Description (es): <replace or omit>
Tags (es): <comma separated>
Author (es): <replace or omit>
```

## 5. Final JSON Skeleton

Paste your answers into this structure when creating `template.json`:

```json
{
  "templateId": "pr-###-your-slug",
  "title": "<Title>",
  "author": "<Author>",
  "description": "<Description>",
  "tags": ["tag-1", "tag-2"],
  "localized": {
    "es": {
      "title": "<optional>",
      "description": "<optional>",
      "tags": ["opcional"],
      "author": "<optional>"
    }
  },
  "importance": "normal",
  "files": [
    {
      "filename": "src/path/to/file.ts",
      "language": "typescript",
      "lines": [
        { "lineNumber": 10, "content": "  const example = true;", "isNew": true }
      ]
    }
  ],
  "bugPatterns": [
    {
      "kind": "security",
      "lineNumbers": [10],
      "severity": "major",
      "description": "<explain the bug>"
    }
  ]
}
```

## 6. Submission Checklist

1. Place your JSON file in `data/prTemplates/<language>/<template-id>/template.json`.
2. Keep TypeScript diffs two-space indented; wrap markdown code fences with two-space indentation inside the fence.
3. Run `npm run generate:templates` to refresh `data/prTemplates/templateManifest.ts`.
4. Verify the new template spawns in-game (set the landing language filter if needed).
