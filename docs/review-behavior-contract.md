# Review behavior contract

Status: foundation implemented; live gameplay migration pending Phase 2. Prototype defaults below are proposed for the playable slice, not evidence of player acceptance.

## Verdict and precision

Verdict correctness depends on whether the PR contains bugs. Tag precision is a separate result. Existing approval weights and rejection velocity cost come from gameSettings; the evaluator returns requested and actual capped changes without dispatching, playing sound, advancing time or submitting scores.

| PR | Verdict | Tags | Correct | Precision | Bonus | False positive |
| --- | --- | --- | --- | --- | --- | --- |
| Clean | Approve | Any valid selection or none | Yes | Not applicable | No | No |
| Buggy | Approve | Any valid selection or none | No | Not applicable | No | No |
| Clean | Request changes | None | No | Untagged | No | Yes |
| Clean | Request changes | Any valid selection | No | Inaccurate | No | Yes |
| Buggy | Request changes | None | Yes | Untagged | No | No |
| Buggy | Request changes | Only bug rows | Yes | Precise | Yes | No |
| Buggy | Request changes | Only unrelated rows | Yes | Inaccurate | No | No |
| Buggy | Request changes | Bug and unrelated rows | Yes | Mixed | No | No |

For multiple bugs, tagging at least one real bug row with no unrelated rows earns one precision bonus per PR. It does not assert that every bug was found. The receipt reports matchedBugCount and totalBugCount separately. Duplicate selected rows do not multiply rewards. Unknown file/row selections throw rather than scoring a stale annotation. Approval ignores valid tags for scoring.

Prototype mixed-tag policy: no bonus. Review this policy at the playable checkpoint. truePositives remains a count of precise PR reviews; it is not renamed to all correct rejections. No leaderboard formula changes are included in this foundation.

## Effects and receipt

Clean approval requests +4 velocity and +2 satisfaction. Buggy approval requests +2 velocity, subtracts the sum of severity weights (5/12/20) from stability, and subtracts ceil(severity total / 4) from satisfaction. Each bug counts as one escaped bug. Rejection requests -3 velocity; precise rejection requests +5 satisfaction. Meters clamp to 0–100. A meter at 99 that requests +4 reports an applied change of +1.

Receipt fields identify the completed PR, author, verdict, outcome, correctness, precision, bonus, bug counts, counter deltas, requested/applied meter changes and resulting meters. No pre-rendered English message is stored. Optional reactions are selected later from the completed PR, never from the newly selected PR. Pure evaluation does not mutate its inputs.

## Live integration boundary

Current GameContext behavior is intentionally unchanged in this PR. In Phase 2, replace its evaluation and line-selection consumers together, apply one decision atomically, retain structured outcome data without blocking progression, and translate assistive outcome labels. Until then, catalog validation requires unambiguous numeric bug references even when explicit file/row references are supplied.

Preserve the opening clean README and exposed-key tutorial pair. No ordinary PR arrives before both are processed. Mandatory waves remain at minutes 0, 60, 180 and 360; minute 0 has two PRs. A shift lasts two real minutes. Guided onboarding must pause the shared simulation, including clock, aging, delivery, delayed loads and verdicts; a local UI timer is insufficient.

## TODO

- [ ] Integrate evaluator, scoped selection and automatic swipe progression atomically in Phase 2.
- [ ] Verify three outcomes in the browser and review mixed-tag policy with the owner.
- [ ] Add shared pause API before guided onboarding.
- [ ] Resolve resumed/practice leaderboard eligibility before persistence delivery.
