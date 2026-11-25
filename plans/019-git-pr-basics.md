# PR basics in the shift game

Goal: give IT beginners the actual Approve Please game with plain-text PRs instead of programming-language changes. Sixty bilingual scenarios, six shifts, the same ten coworkers.

Approach: `/learn` renders the shared `GamePage`. The same provider/reducer, screens, clock, meters, inbox, audio, priority tags, shortcuts, swipe and day recaps run both tracks. The landing setup selects code review or PR basics. Both modes use the regular two-minute clock. Practice disables waiting penalties; normal retains queue pressure. Decisions retain consequences in either difficulty. No detached course dashboard, manual next-exercise button or retry workflow.

Implementation TODO:
- [x] Author 60 bilingual scenarios, half safe and half flawed; give every coworker both kinds of work.
- [x] Add the beginner content track and separately keyed game save, preserving old code saves as the code track.
- [x] Deliver two/three/three/two PRs at simulated minutes 0/60/180/300 over six shifts through atomic, replay-safe reducer delivery.
- [x] Support explicit removed rows in normalization, shared validation and the actual diff viewer. Keep legacy false-without-kind as context; use file/row references across files.
- [x] Add beginner briefings, per-PR tasks and paused last-review explanations. Add a full day review log with incorrect decisions expanded, unreviewed queue entries and a six-shift finish.
- [x] Use the task text as the PR description, replacing the placeholder author note and removing the separate task panel. Keep optional last-review explanations available.
- [x] Remove the standalone course UI, keeping the content, and update the contributor documentation.
- [x] Finish integrated browser checks and prepare the same PR #14 for publication and CI verification.

Validation: all 60 scenarios pass bilingual content validation and real decision-engine checks. The integration test plays all six timed shifts through the actual reducer, verifying duplicate delivery protection, consequences, pressure, pausing, reset and isolated saves. The real summary screen has regression coverage for wrong approvals, unreviewed work, the six-shift finish and unchanged code progression. Full suite: 632 tests in 22 files; typecheck, lint, generation and production build passed.

Production-build browser proof: played a timed first shift into the recap and day-two briefing; intentionally approved the removed roster member, rejected a flagged wrong shelf location and left one PR unreviewed. Verified the three corresponding outcomes in the recap. Also verified translated active PRs, 320 px without page overflow, practice meters with no waiting drain, shared landing setup, separate reset/save behavior and resuming the original code PR. Screenshots live outside the repository as local review artifacts. GitHub checks on PR #14 are the publication gate.

Risks and compatibility: student runs use `approve-please.basics-run.v1`, code runs retain `approve-please.run.v1`. Legacy code saves restore with contentTrack=code. Restarting one track never clears the other. Student runs do not submit to the code leaderboard. The earlier prototype's progress key remains untouched and is not converted into game scores. Rollback is a normal revert of the feature PR; do not delete saved data.

Delivery: PR #14 in `llamojha/approve-please`, source `codex/git-pr-basics`, base `main`. The learning content guide tracks testing with actual beginners before curriculum expansion.

Pacing correction: bring the next undelivered batch forward when the inbox is cleared, preserve existing delivery identities, and end a completed ten-review shift after the final swipe. No empty-queue wait at 10:00 and no three-times-slower beginner clock. Regression coverage checks scheduled arrival, early refill, old markers, no duplicates, completion guards and preservation of the original code-game behavior.

Production browser pacing proof: resumed an existing practice save, reviewed ten unique PRs without waiting for scheduled waves and reached the summary automatically. On day two, clearing the opening pair delivered three fresh PRs at 09:03. Screenshot saved outside the repository as `instant-refill.jpg`.
