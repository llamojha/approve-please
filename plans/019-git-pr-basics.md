# Git & PR basics

Goal: introduce PR review to IT students who do not know a programming language. Ship 60 distinct bilingual plain-text scenarios, ten per lesson, with the existing ten coworkers.

Scope: reading diffs, reviewing against an explicit brief, catching unintended edits, completeness, cross-file consistency and mixed practice. This teaches PR review; it is not a Git command-line course. No timer, pressure meters or leaderboard. Existing game saves and behavior remain independent.

Implementation TODO:
- [x] Author six lesson packs in `data/basics/`, with requirements, before/after text, issue references and explanations in English and Spanish. Aim for 30 safe / 30 flawed PRs.
- [x] Add a pure text-diff and review/progress model in `utils/basics.ts`, including safe restore of separate learning progress.
- [x] Reuse `components/work/ReviewDesk.tsx` with an optional custom diff slot; add `components/basics/PlainTextDiff.tsx`, `/learn` in `pages/learn.tsx`, localized copy and responsive styles. Include onboarding, feedback, retries and lesson recaps.
- [x] Add a visible entry from `pages/index.tsx`; document learning content contribution in `docs/git-pr-basics.md`.
- [x] After implementation, test all 60 scenarios and both locales, diff correctness, progression and persistence. Run targeted tests, typecheck, lint/build, browser checks on desktop/mobile, and publish a PR from `codex/git-pr-basics` to `main`.

Validation: no programming language assumptions; every answer follows from the brief. All coworkers have safe and flawed PRs. Wrong decisions remain visible in recaps even after retry. Removed lines are actual removals, never disguised as context. Keyboard actions ignore typing/feedback and respect reduced motion. Verify main-game regression coverage and no shared save-key writes.

Risks: beginner content must not leak answers through author or title. Progress is local to a browser and can be restarted explicitly. The shared desk extension defaults to its existing behavior. Rollback is a normal feature revert; main game save format remains unchanged.

Validation completed: 627 tests in 21 files passed with one worker; typecheck, full lint, template generation and production build passed. Browser playthrough reviewed all 60 unique PRs through completion. Verified wrong first decision → correct retry → retained recap, reload retaining 60/60, removal tagging, Spanish copy and HTML language, keyboard R, light/dark themes, 320 px with no page overflow, landing entry and course reset preserving a meaningful game save. Screenshots are local review artifacts outside the repository. Delivery branch: `codex/git-pr-basics`, base: `main`.
