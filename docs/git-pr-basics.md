# Beginner shifts: PR basics

Choose **PR basics** in the landing page's normal shift setup. This is the same game with a different content track: the same briefing, 09:00–17:00 clock, three meters, coworker inbox, incoming-PR audio, shortcuts, approve/reject swipe and day summaries. `/learn` renders the real game screens and reducer; it is not a separate course dashboard.

Sixty English/Spanish text PRs cover rosters, timetables, inventories and instructions across six shifts of ten. Thirty are safe; thirty need rejection. All ten coworkers have both safe and flawed work. The focus progresses through first reviews, following a brief, accidental edits, completeness, multiple files and mixed practice. This introduces branches, diffs and a simulated review/merge flow; it does not teach Git commands.

## Playing

Both difficulties use the original two-minute shift clock. Practice, the beginner default, disables waiting-queue drain; normal retains queue pressure. Decisions affect Stability, Velocity and Team trust in either mode. PRs are scheduled for simulated minutes 0, 60, 180 and 300. Clearing the inbox brings the next undelivered batch forward immediately. Once all ten PRs are reviewed, the shift ends after the final swipe; otherwise it ends at 17:00. Saved delivery identities stay stable so older runs do not receive duplicate batches. There is no next-exercise button.

Each PR displays an explicit task above the shared diff. Added and removed lines can be flagged, including accidental deletions. The optional **Last review** control opens an explanation in a clock-pausing game dialog. **How reviews work** explains the beginner rules and also pauses the clock. Shortcuts are Alt+A and Alt+R, matching the original game.

Day summaries explain every reviewed PR, expand incorrect decisions, identify the correct decision and list PRs still waiting at 17:00 without pretending they were reviewed. Advancing starts the next day's briefing. Shift six finishes the campaign and offers another beginner run or a return to the desk. Beginner scores do not enter the code-review leaderboard.

Beginner runs use `approve-please.basics-run.v1`; code runs keep `approve-please.run.v1`. Both support the game's save/resume flow independently. Older code saves without a content-track field restore as code. The initial standalone prototype's browser progress is not promoted into game scores; its former storage key is left untouched.

## Contributing scenarios

Edit the relevant pack in `data/basics/`. These scenarios remain separate from the programming-language catalog in `data/prTemplates/` and never enter a code-review run.

An exercise has a stable, globally unique `id`, bilingual `title`, an explicit `brief`, complete `files`, `issues` and an `explanation`. `copy(en, es)` stores prose. `textFile(filename, beforeEn, afterEn, beforeEs, afterEs)` supplies the full old and proposed text of a short `.txt` file; the renderer computes the diff. Do not insert `+` or `−` into file contents.

An empty `issues` array means approval is correct. For a flawed PR, use `issue(filename, 'after', line)` for a wrong added line or `issue(filename, 'before', line)` for a removal that must be restored. These numbers are **one-based in that version of the source file**. Keep translated lines aligned and refer to the same semantic problem in both languages. The game adapter projects these locations into explicit file/row references, so equal numbers in different files cannot collide.

Give every date, quantity and constraint needed to judge the diff in the brief. Explain exactly why the proposed change meets or violates it. Avoid guessing, external policies or programming knowledge. Review meaning in both languages: automated checks verify valid references and engine behavior, not teaching quality. Keep exercise IDs stable and preserve balanced assignments to the ten coworkers through the lesson rotation in `data/basics/index.ts`.

After editing, run the existing test script with `tests/basics.test.ts`, then typecheck and lint. Preview a real beginner shift in both languages, including a removed-line rejection, wrong approval, automatic advancement, paused explanation and day recap. The integration suite runs all 60 PRs through the real reducer and checks separate saves. A seventh shift or more than ten PRs per shift requires an explicit curriculum and delivery-schedule update.

## Future work TODO

- [ ] Test the first shift with actual IT beginners and revise unclear wording before expanding the curriculum.
- [ ] Consider a separate Git-command lab only if learners need branch creation, commits or conflict resolution.
