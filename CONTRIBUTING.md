# Contributing to Approve, Please

Thanks for helping improve the game! This guide covers local setup, development workflow, and how to add new PR templates.

## Setup
- Install Node 20 (use `nvm use` if available).
- Install deps: `npm install`.

## Common scripts
- `npm run dev` – start the Next.js dev server.
- `npm run lint` – lint the codebase.
- `npm run typecheck` – TypeScript type check.
- `npm run build` – production build.

## Adding a new PR template
1. Copy `docs/pr-template-guide.md` and fill in the sections for your scenario.
2. Save the JSON as `data/prTemplates/<language>/<template-id>/template.json` (folder and file name match the `templateId`).
3. Run `npm run generate:templates` to refresh `data/prTemplates/templateManifest.ts`.
4. Verify in-game: start `npm run dev`, filter/select the new template language, and ensure the diff/bugs appear as expected.

Tips:
- Keep line numbers consistent and indent TS/JS with two spaces.
- Provide `bugPatterns` for any hidden issues (kind, severity, line numbers, description).
- Add optional `localized` entries for ES copy if you have them.

## Pull request expectations
- Keep changes scoped and include context in your PR description.
- Run `npm run lint` and `npm run typecheck` before submitting.
- For gameplay tuning, adjust values in `constants/gameSettings.ts` and describe the intended effect.
