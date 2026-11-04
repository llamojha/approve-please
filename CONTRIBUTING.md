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
2. Run `npm run dev`, then open `/dev/templates`. Search the catalog and either choose **Create scenario** or duplicate a nearby example.
3. In `/dev/templates/new`, edit metadata, English/Spanish copy and diff rows. Diff rows use `number | + | code` for additions and `number | | code` for context. Select added rows in the player preview to annotate bugs.
4. Check the simulated approve/request-changes outcomes. The workshop saves a valid draft locally, recovers it after reload, and rejects invalid imported JSON without replacing the current draft.
5. Export `template.json` to `data/prTemplates/<language>/<template-id>/template.json`. The workshop shows the intended path; it never writes to the repository or production server.
6. Run `npm run generate:templates`, `npm test -- --maxWorkers=1`, and `npm run templates:report`. Open `/dev/templates/<template-id>` for the final English/Spanish rendering.

The worksheet and full format remain in [`docs/pr-template-guide.md`](docs/pr-template-guide.md). VS Code also provides schema autocomplete and inline validation. Development authoring routes return 404 in production.

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
