# Git & PR basics

Open `/learn` from the landing page's “New to pull requests?” card. This course teaches PR review using ordinary text. It introduces branches, diffs, approval, rejection and a simulated merge outcome. It does not teach Git commands or claim to replace a Git lab.

There are six lessons of ten PRs: first reviews, following a brief, accidental edits, completeness, multiple files and mixed practice. All 60 have English and Spanish briefs, file contents and explanations. Thirty are safe to approve; thirty need rejection. Each of the ten coworkers appears six times with both kinds of work.

There is no timer, queue penalty or leaderboard. Students can revisit any lesson, flag lines, read the explanation and retry. Lesson recaps retain the first decision even after a successful retry. Progress is stored locally under `approve-please:git-pr-basics:v1`; restarting the course does not reset the game save. Clearing browser data removes course progress. There are no accounts or teacher analytics.

## Add a learning PR

Edit the relevant lesson pack under `data/basics/`. These are separate from the programming-language catalog under `data/prTemplates/`; beginner PRs must never enter the timed game's random queue.

Each exercise has a stable, globally unique `id`, localized `title`, an explicit `brief`, `files`, `issues` and an `explanation`. Use `copy(en, es)` for prose and `textFile(filename, beforeEn, afterEn, beforeEs, afterEs)` for the complete old and proposed text of a small `.txt` file. Both versions must genuinely differ. The diff is computed from these two versions; do not write `+` or `−` into the text itself.

An empty `issues` array means approval is correct. For a flawed PR, use `issue(filename, 'after', line)` to flag a wrong added line, or `issue(filename, 'before', line)` to flag a removal that must be restored. Line numbers are **one-based within that version of the file**. Refer to the same semantic problem in both languages; keep translated lines aligned. Missing information can be tested by an unintended removal. Avoid an omission with no changed line to discuss.

The brief is the source of truth. Give every date, quantity and constraint needed to judge the diff. The explanation must say exactly why the change meets or violates that brief. No programming knowledge, external policy lookup or guessing should be needed. Review the actual before/after meaning in both languages: automated checks verify references and coverage, not teaching quality.

Coworkers are assigned through the lesson rotation in `data/basics/index.ts`. Keep IDs stable when editing existing content so saved attempts still refer to the same exercise. The course currently promises 60 PRs and ten per lesson: adding more requires updating those visible totals, tests and curriculum deliberately.

After editing, run the existing `test` script with `tests/basics.test.ts`, then typecheck and lint. Preview `/learn` in both languages: check the requirement, both sides of the diff, evidence flags, wrong and right decisions, retry and recap. New content belongs in a feature PR against `main`, with the expected verdict and a brief validation note for reviewers.

## Future work TODO

- [ ] Test the first lesson with actual IT beginners and revise any unclear wording before expanding the curriculum.
- [ ] Consider a separate Git-command lab if learners need branch creation, commits or conflict resolution. Those actions are outside this PR-review course.
