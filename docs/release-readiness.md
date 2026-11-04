# Preview release readiness — 4 November 2026

This change targets `codex/ui-refresh-preview`. It does not merge to `main` or deploy production.

## Release evidence

- Independent code, browser and accessibility review completed with no actionable findings remaining.
- Template generation validates all 390 templates; the contributor workshop export passes the same validator.
- The full test suite passes 549 tests across 18 files, followed by typecheck, lint and production build gates.
- Production-route probes keep `/dev/design`, `/dev/templates`, `/dev/templates/new` and template preview routes private with HTTP 404 responses.

## Rollout

1. Review the draft PR and Vercel preview.
2. Exercise the player journey and development-only workshop in a non-production checkout.
3. Promote through a separate reviewed PR only after owner approval.

## Rollback

- Revert the live desk commit to restore the prior `WorkScreen` adapter without changing template data or leaderboard storage.
- Revert the workshop files independently; production authoring routes remain 404 either way.
- Disable local run restoration by removing the resume controls and persistence effect; saved data is versioned and ignored by incompatible builds.
- Audio preferences are isolated from run state and can be removed without affecting gameplay.

## Known boundary

No cloud accounts, hosted publishing, server-side draft storage, AI authoring or Git patch parser is included. Human participant research remains useful after preview; the implemented release gate uses automated coverage plus an independent browser/accessibility review and records that distinction.
