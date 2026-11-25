# Complete coworker coverage

Goal: assign the remaining 380 legacy catalog templates to the existing ten coworkers; preserve the ten explicit assignments and every gameplay scenario.

Approach: edit template identity metadata (`authorId`, canonical `author`, localized author when present), favouring role-appropriate subject areas without looking at bug answers. Keep assignment stable in authored JSON. Preserve guest compatibility for external drafts. Generate a lightweight template-to-coworker index so saved queues also pick up corrected identities without loading all scenario code.

Tasks:
- [x] Migrate the 380 template identities under `data/prTemplates/`.
- [x] Generate `data/prTemplates/coworkerManifest.ts` through `scripts/build-template-manifest.mjs` and use it when reading saved queues in `utils/runPersistence.ts`.
- [x] After implementation, strengthen `tests/templates.test.ts` and add saved-run migration coverage in `tests/runPersistence.test.ts`.
- [x] Update `docs/content-contract.md` and `docs/pr-template-guide.md` with built-in catalog identity requirements.
- [x] Validate template generation, targeted tests, typecheck, lint and browser rendering; publish to the same preview PR and check CI.

Risks: avoid changing code, bugs, priorities or localized scenario text. Do not assign coworkers by whether a PR is correct; each coworker must have clean and flawed work. Saved-run migration changes queued PR identity/reactions only and preserves time, scoring and progress. Historical decision records remain historical. Rollback is a normal revert of this change, preserving the v1 save format.

Validation: 390 templates generated without errors; 417 targeted tests passed; typecheck and targeted ESLint passed. Browser gameplay verified Diego, Evan and Inés portraits loaded in the next delivery after onboarding. Existing saved sessions were left untouched during the browser check. Preview PR: #12, `codex/refresh-foundations` → `codex/ui-refresh-preview`; CI status tracked on the PR.
