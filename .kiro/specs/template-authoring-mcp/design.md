# Approve Please Template Authoring MCP — Design

## Summary

Build a small project-local TypeScript MCP server that lets Kiro inspect, validate, and add pull-request cards through Approve Please's real content pipeline. The server communicates over stdio and exposes exactly three tools:

- `list_templates`
- `validate_template`
- `add_template`

The integration is real rather than simulated: it reads and writes `data/prTemplates/`, uses the same validation implementation as `npm run generate:templates`, and regenerates the manifests consumed by the game. No gameplay code changes are required.

## Goals

- Make the existing PR-template catalog available to Kiro as structured tool data.
- Validate Kiro-authored candidates with the project's enforced validation rules.
- Add valid templates safely to the real game data and regenerate manifests.
- Keep setup local, secret-free, and small enough for a weekend challenge project.
- Demonstrate an end-to-end flow from Kiro prompt to a playable PR card.

## Non-goals

- Live NPC or game-state integration.
- Importing or converting GitHub pull requests.
- Editing, overwriting, or deleting existing templates.
- Generating content inside the MCP server; Kiro authors the candidate.
- HTTP/SSE hosting, authentication, databases, or cloud infrastructure.
- Changes to gameplay, UI, scoring, template schema, or loading behavior.

## Existing system

Templates live at:

```text
data/prTemplates/<language>/<templateId>/template.json
```

`scripts/build-template-manifest.mjs` currently performs the canonical work:

1. Discovers every `template.json` under each language directory.
2. Validates required fields, enums, localization, files, lines, and bug patterns.
3. Enforces folder/`templateId` equality and repository-wide ID uniqueness.
4. Ensures bug line references exist and point to changed lines.
5. Generates `manifest.<language>.ts` and `templateManifest.ts`.

The generated manifests are exported through `data/prs.ts` and loaded by the game. The MCP must reuse this pipeline instead of maintaining a second validator.

## Architecture

```text
Kiro CLI
  │ MCP over stdin/stdout
  ▼
mcp/template-server.ts
  │ imports shared validation/generation functions
  ▼
scripts/build-template-manifest.mjs
  │ reads/writes
  ▼
data/prTemplates/**/template.json
  │ generates
  ▼
manifest.<language>.ts + templateManifest.ts
  │ consumed by
  ▼
Approve Please game
```

### Files

- `mcp/template-server.ts` — stdio MCP server and the three tool handlers.
- `scripts/build-template-manifest.mjs` — refactored only enough to export its existing discovery, validation, and manifest-generation functions while retaining its CLI behavior.
- `scripts/build-template-manifest.d.mts` — TypeScript declarations for the shared JavaScript module if required by strict type checking.
- `tests/templateMcp.test.ts` — focused tests for tool behavior and filesystem safety.
- `.kiro/settings/mcp.json` — project-local Kiro server configuration.
- `README.md` — challenge purpose, setup, tools, safety, and demo instructions.

No game runtime file is changed.

## Shared pipeline refactor

The current validator must remain the single source of truth. Export a minimal API from `scripts/build-template-manifest.mjs`, for example:

```ts
interface Diagnostic {
  file: string;
  message: string;
}

interface TemplateRecord {
  file: string;
  language: string;
  template: unknown;
}

validateTemplate(template: unknown, file: string, diagnostics: Diagnostic[]): void;
discoverAndValidateTemplates(languages: string[]): Promise<{
  diagnostics: Diagnostic[];
  templates: TemplateRecord[];
}>;
listLanguageFolders(): Promise<string[]>;
buildManifest(): Promise<void>;
```

Importing the module must not execute the CLI. The existing command remains supported by calling `buildManifest()` only when the file is the direct entry point. Existing validation messages, ordering, generated manifest format, `--report-only`, and exit behavior should remain unchanged.

## Tool contracts

All tools return one JSON object as MCP text content. Failures set `isError: true` and use concise, actionable messages. Responses expose repository-relative paths only—never absolute paths, stack traces, environment values, or raw internal errors.

### `list_templates`

Lists real templates from disk after repository validation.

Input:

```json
{
  "language": "typescript"
}
```

`language` is optional. If supplied, it must name an existing direct language folder.

Success:

```json
{
  "ok": true,
  "count": 1,
  "templates": [
    {
      "templateId": "security-sql",
      "language": "typescript",
      "title": "Add user lookup",
      "relativePath": "data/prTemplates/typescript/security-sql/template.json",
      "bugKinds": ["security"]
    }
  ]
}
```

Results are sorted by language and then `templateId`. If the existing repository is invalid, the tool reports the pipeline diagnostics instead of returning a misleading partial catalog.

### `validate_template`

Validates a candidate without writing any file.

Input:

```json
{
  "language": "typescript",
  "template": {
    "templateId": "typescript-hidden-auth-bypass"
  }
}
```

The full candidate object follows `data/prTemplates/template.schema.json`. Validation uses the virtual destination path so the existing folder/ID rule applies, and it also checks the candidate ID against all templates on disk.

Valid success:

```json
{
  "ok": true,
  "valid": true,
  "templateId": "typescript-hidden-auth-bypass",
  "language": "typescript",
  "targetPath": "data/prTemplates/typescript/typescript-hidden-auth-bypass/template.json",
  "diagnostics": []
}
```

Invalid result:

```json
{
  "ok": false,
  "valid": false,
  "diagnostics": [
    {
      "path": "data/prTemplates/typescript/typescript-hidden-auth-bypass/template.json",
      "message": "bugPatterns[0].lineNumbers[0] references unchanged line 14; bug lines must be new."
    }
  ]
}
```

This tool is read-only: it must not create target directories, temporary files, or manifests.

### `add_template`

Validates and adds one candidate to the real game data.

Input is identical to `validate_template`.

Success:

```json
{
  "ok": true,
  "created": true,
  "templateId": "typescript-hidden-auth-bypass",
  "language": "typescript",
  "relativePath": "data/prTemplates/typescript/typescript-hidden-auth-bypass/template.json",
  "manifestsRegenerated": true
}
```

Behavior:

1. Validate the existing repository.
2. Validate the candidate and repository-wide ID uniqueness.
3. Reject an existing destination; overwriting is never allowed.
4. Write two-space-indented JSON with a trailing newline to a temporary sibling directory.
5. Atomically rename the staged directory to the final destination.
6. Call the shared manifest generator directly.
7. If manifest generation fails, remove the newly added directory and report that the add was rolled back.

The handler serializes `add_template` calls within the server process to prevent two simultaneous calls from racing. Cross-process filesystem transactions are outside this small server's scope; the README instructs authors not to run another template-generation command during an add.

## Input and path safety

The caller supplies only a language and template object—never a filesystem path or repository root.

- Resolve the project root from the MCP module location, not the caller's working directory.
- `language` must match `^[a-z][a-z0-9-]*$` and an existing direct directory under `data/prTemplates/`.
- `templateId` must match `^[a-z0-9](?:[a-z0-9-]*[a-z0-9])?$` and be no longer than 120 characters.
- Reject path separators, dot segments, absolute paths, symlinks at the destination, and existing targets.
- Confirm every derived destination remains inside `data/prTemplates/`.
- Limit serialized candidate size to 256 KiB to avoid accidental oversized tool calls.
- Do not read `.env` files or require credentials.

## MCP implementation

Use pinned development dependencies:

- `@modelcontextprotocol/sdk` `1.29.0`
- `tsx` `4.23.1`

The server uses `McpServer` and `StdioServerTransport`, registers exactly the three tools, and connects once. Standard output is reserved exclusively for MCP protocol messages; diagnostics go to standard error.

Package script:

```json
{
  "scripts": {
    "mcp:templates": "tsx mcp/template-server.ts"
  }
}
```

## Kiro configuration

Project-local configuration belongs at `.kiro/settings/mcp.json`:

```json
{
  "mcpServers": {
    "approve-please-templates": {
      "command": "npm",
      "args": ["run", "--silent", "mcp:templates"],
      "timeout": 120000,
      "disabled": false
    }
  }
}
```

`--silent` prevents npm banners from mixing with stdio protocol output. The configuration contains no absolute paths, environment variables, or secrets. Kiro should prompt before the mutating `add_template` call; the repository config does not globally auto-approve MCP tools.

## Error handling

Use a small stable set of error codes:

- `INVALID_ARGUMENT` — malformed language or tool input.
- `INVALID_TEMPLATE` — candidate fails canonical validation.
- `DUPLICATE_TEMPLATE` — ID or destination already exists.
- `PIPELINE_INVALID` — existing repository templates fail validation.
- `PIPELINE_FAILED` — manifest generation failed after staging an add.
- `IO_ERROR` — sanitized filesystem failure.

Example:

```json
{
  "ok": false,
  "error": {
    "code": "DUPLICATE_TEMPLATE",
    "message": "Template 'security-sql' already exists.",
    "diagnostics": []
  }
}
```

## Testing

### Shared-validator regression

- Run the existing generator before and after refactoring and confirm generated manifests are unchanged.
- Verify `npm run generate:templates -- --report-only` still writes no manifests.
- Keep all existing template tests passing.

### Tool tests

Use temporary template roots or exported handler factories so tests never modify real content.

- List all templates and filter by language.
- Reject unknown and traversal-like language values.
- Validate a valid candidate without any filesystem writes.
- Return all canonical diagnostics for malformed candidates.
- Reject duplicate IDs, including IDs in another language pack.
- Reject folder/ID mismatch, bad bug-line references, unsafe IDs, and oversized candidates.
- Add a valid template with exact JSON formatting and regenerated manifests.
- Reject existing files/directories/symlinks without overwrite.
- Roll back the candidate when generation is deliberately made to fail.
- Serialize simultaneous adds of the same ID so only one succeeds.

### Stdio smoke test

Start `npm run --silent mcp:templates` with an MCP client, then:

1. Initialize the connection.
2. Confirm exactly three tools are advertised.
3. Call `list_templates` against the real repository.
4. Close cleanly.
5. Confirm no non-protocol banner was written to stdout.

### Project validation

Run:

```bash
npm run generate:templates
npm run typecheck
npm run lint
npm test
npm run build
```

Also verify Kiro discovery with `kiro-cli mcp list` and the MCP status command available in the installed Kiro CLI.

## README and submission content

The README addition must explain:

- What the MCP connects to: Approve Please's local, real template filesystem and validator/manifest pipeline.
- Why Kiro could not do this as a first-class capability before the MCP.
- Node 20+ setup with `npm ci`.
- How `.kiro/settings/mcp.json` starts the server and how to reload/check it in Kiro.
- Inputs and outputs of all three tools.
- No-overwrite, validation, rollback, and no-secrets behavior.
- How to preview the added card at `/dev/templates/<templateId>` and then play it in the game.
- GitHub-to-game conversion and live NPC behavior as future work only.

Before publication, inspect tracked files for secrets and confirm the public repository includes the MCP source, `.kiro` configuration, and setup documentation.

## Demo flow (30–60 seconds)

Use a prepared candidate so the recording shows integration rather than typing:

1. Show `.kiro/settings/mcp.json` and state that it is a local stdio server with no keys.
2. Ask Kiro to list TypeScript templates; show real catalog entries from `data/prTemplates/`.
3. Ask Kiro to create a sneaky PR with a hidden security bug.
4. Show an intentionally invalid draft fail `validate_template` on a real rule, such as a bug annotation pointing to an unchanged line.
5. Correct it, run validation again, and call `add_template` after approving the mutation.
6. Show the created `template.json` and regenerated manifest entry.
7. Refresh/open `/dev/templates/<templateId>` or the game and display the playable card.

This demonstrates the complete required path: Kiro → custom MCP → real validator/filesystem → generated game content → rendered result.

## Acceptance criteria

- Kiro discovers exactly the three tools from the checked-in project configuration.
- The MCP and CLI use one canonical validator implementation.
- `list_templates` returns real repository content, not hardcoded data.
- `validate_template` performs no writes and returns canonical diagnostics.
- `add_template` cannot traverse or overwrite and regenerates the real manifests.
- A generation failure removes the newly staged template.
- No gameplay code or template schema changes are introduced.
- MCP stdout remains protocol-only and no secrets are required or committed.
- Targeted tests and the project's generation, typecheck, lint, test, and build commands pass.
- The public README and 30–60 second demo show the end-to-end integration.
