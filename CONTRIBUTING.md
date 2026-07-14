# Contributing to Approve, Please

The easiest way to contribute is to add your own pull-request review scenarios. Code, documentation, accessibility, localization, and gameplay improvements are also welcome.

## Setup

- Install Node 20 (use `nvm use` if available).
- Install dependencies with `npm install`.

## Common scripts

- `npm run dev` — validate and regenerate templates, then start the Next.js development server.
- `npm run build` — validate and regenerate templates, then create a production build.
- `npm run generate:templates` — optionally validate templates and regenerate manifests without starting or building the app.
- `npm run templates:report` — report coverage by language, bug kind, severity, clean PRs, and missing Spanish metadata.
- `npm test` — run the test suite, including English and Spanish template instantiation.
- `npm run lint` — lint the codebase.
- `npm run typecheck` — run the TypeScript type check.

Template generation runs automatically before `npm run dev` and `npm run build`; manual generation is only needed for immediate feedback.

## Contribute your own PRs

1. Choose an underserved language or bug kind with `npm run templates:report`.
2. Author `data/prTemplates/<language>/<template-id>/template.json` using the worksheet and complete format in [`docs/pr-template-guide.md`](docs/pr-template-guide.md). For AI-assisted drafting, use [`.kiro/prompts/generate-pr-template.md`](.kiro/prompts/generate-pr-template.md). VS Code provides autocomplete and inline validation through the repository schema mapping.
3. Run `npm run dev`. The automatic validator names every affected file and problem before the app starts.
4. Open `/dev/templates/<template-id>` to review the real game rendering. Bug lines begin highlighted, the English/Spanish toggle checks localized content, and edits to template JSON hot-reload. This route is development-only and returns 404 in production.
5. Run `npm test` to prove every template instantiates in English and Spanish, then run `npm run templates:report` to note the coverage improved by your contribution.

Content house rules:

- Submit batches of 10 or fewer templates per pull request.
- Use a globally unique `templateId` that exactly matches its folder name.
- Use two-space indentation everywhere, including code inside Markdown fences.
- Annotate bugs only on changed lines where `isNew` is `true`.
- Spanish `localized.es` metadata and localized bug descriptions are encouraged but optional.

## Pull request expectations

- Keep changes scoped and explain what changed and why.
- Run `npm run typecheck`, `npm run lint`, and `npm test` before submitting.
- For gameplay tuning, adjust values in `constants/gameSettings.ts` and describe the intended effect.
