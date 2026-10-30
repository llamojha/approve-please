# Content compatibility contract

Status: additive foundation. All 390 existing templates remain in their original format. Two clean scenarios had duplicate closing-brace line numbers corrected (pr-083: 64→68; pr-090: 34→38), with code and verdicts unchanged. The manifest remains authoritative.

## Identity and localization

Keep required author text for guests. Optional authorId refers to a future character registry and remains stable across EN/ES. Unknown IDs must use the guest fallback when portraits are integrated. Optional reactions are keyed by clean-approval, buggy-approval, correct-rejection and false-positive, each containing optional en/es strings. Instantiation preserves and copies this metadata. Display consumers will use selected locale, then English, then omit absent text.

Each row can supply rowId and kind (addition or context). Legacy isNew=true means addition; false means context, never deletion. Omitted row IDs derive deterministically as line-N. IDs and numeric line numbers must be unique within a file; filenames unique within a PR. Explicit kind must agree with isNew. Removed rows are unsupported and rejected. No file is written using an authored filename.

A bug keeps lineNumbers for existing consumers and may also supply lineRefs, each {filename, rowId}. Their projected numbers must agree. A bug must reference added code. Runtime normalization rejects missing/ambiguous legacy references. The pure evaluator can distinguish identical line numbers in different files through explicit references, but catalog validation still rejects ambiguous numeric bug lines until the live game migrates. Do not advertise such scenarios as playable yet.

## Additive example

```json
{
  "author": "Lucía Navarro",
  "authorId": "lucia-navarro",
  "reactions": {
    "correct-rejection": {"en": "Good catch. Adding the keyboard case.", "es": "Bien visto. Añado el caso con teclado."}
  },
  "files": [{"filename": "button.ts", "language": "typescript", "lines": [
    {"lineNumber": 1, "rowId": "activate", "kind": "addition", "isNew": true, "content": "activate()"}
  ]}],
  "bugPatterns": [{"kind": "accessibility", "severity": "major", "lineNumbers": [1],
    "lineRefs": [{"filename": "button.ts", "rowId": "activate"}]}]
}
```

This is a field excerpt, not a complete template; retain title, templateId, description, tags and importance. Existing templates need no migration.

## Shared validation

The browser-safe validator returns path/code/message diagnostics and performs no filesystem access. The generator calls exactly that validator, then adds folder/template ID and whole-catalog uniqueness checks. A browser draft cannot certify unpublished repository state. JSON Schema provides editor assistance; cross-field relationships and reference existence are enforced by the shared validator.

Generator report-only mode remains diagnostic and may exit successfully with errors. Use normal generation as the validation gate. Neither generation nor this foundation adds a production write endpoint. Future workshop exports JSON and directory instructions; dev-only routes remain unavailable in production.

## TODO

- [ ] Migrate live and preview selection to file/row identities together, then lift the catalog ambiguity guard.
- [ ] Build player/author preview and draft export against these shared contracts.
- [ ] Add character registry and locale fallback UI in the vertical slice.
