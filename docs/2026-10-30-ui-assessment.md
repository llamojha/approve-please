# UI assessment and refresh direction

Execution roadmap: `/Users/amllamojha/.codex/worktrees/main-assessment/approve-please/plans/013-ui-ux-characters-and-authoring.md` consolidates the proposed work below into phased milestones and explicit parallel-agent ownership. Foundation implementation has started; the roadmap records current progress and preview-branch delivery.

Reviewed main at `6497dc0`, 30 October 2026. Open PRs are excluded by the owner's direction. This document supersedes the previous recommendation to build on the open redesign. No PR integration is a prerequisite for this proposal.

The game has a clear premise and usable mechanics. Its presentation currently reads like a prototype dashboard: many similarly weighted panels, little character presence, and a code snippet that occupies less space than the surrounding explanation. The refresh should make reviewing code the visual center and make the people behind it memorable.

## Current UI findings

| Area | Observation | Effect | Proposed change |
| --- | --- | --- | --- |
| Landing | At 1280×720, the start action falls below the initial view. Mission text, three meter explanations, language selection and difficulty all come first. | The player must read and scroll before trying the premise. | Lead with a short premise, visible Start action and a small review example. Keep settings compact; teach meters during the first shift. |
| Visual identity | The landing illustration sits behind translucent text-heavy panels. The desk switches to gray cards with large rounded borders, green meters and blue accents. | The illustration is obscured and the two screens feel loosely connected. | Use one coherent application shell. Put art in dedicated character/scene areas with solid reading surfaces for text and code. |
| Work desk | Clock, queue, metrics, hints and theme settings take substantial space. Three tutorial diff lines sit inside several layers of panels. | The actual decision feels secondary. | Give the diff most of the working area. Consolidate time/meters into one compact bar; move detailed statistics and settings into disclosures. |
| Instructions | Line-tagging help appears above the diff and again around the actions, alongside tooltips and shortcut legends. | Experienced players repeatedly scan tutorial copy. | Show progressive first-run guidance, then retain a compact hint and an accessible help control. |
| PR realism | Title, author, tags and file names exist. Lines are individually rounded buttons; there is no PR identity, branch context, meaningful conversation or file-navigation model. | It resembles a code quiz more than a review tool. | Use a continuous diff with a gutter, explicit change markers, active-line state, compact PR header and real conversation/file navigation. |
| Coworkers | A briefing contains a name, role and quote; a PR contains a separate author string. No portrait or relationship between those appearances. | Players have little reason to remember who sent a PR. | Connect a stable character identity to avatar, role, authored scenarios and reactions. |
| Decision feedback | Approving moved directly to the next PR and changed counters, without a persistent result in the observed UI. The work screen clears feedback when the PR changes. | The consequence is easy to miss, and there is no human response. | Keep a short review receipt tied to the completed PR, with meter deltas and a brief coworker reaction. Do not block the next review. |
| Briefing | A large mantra and a quote dominate the screen. Daily flavor does not itself implement daily policy changes. | Flavor can sound like instructions that the simulation does not enforce. | Separate actual objectives from workplace banter. Present enforced rules only when backed by game behavior. |
| Responsive behavior | Source collapses all three desk columns into one below 1100px. | Queue comes before the diff and actions; frequent scrolling is likely. | Prioritize the active PR, compact queue selector and sticky actions. Keep rules and colleagues reachable through drawers. Verify this at real device sizes during implementation. |
| Contributor gallery | Useful filters and previews, but 390 cards, long template IDs, no text search, no create/duplicate path. | Good for inspection; cumbersome for creating or finding a particular scenario. | Add search, compact list view, starter scenarios and a guided creation flow. |

Keep the strong parts: approve/request-changes is understandable, line tagging is optional, keyboard shortcuts already exist, the queue is explicit, and previews reuse the game renderer. The first tutorial PR pair is a useful base for interactive onboarding. Existing tutorial image files do exist and display; their filenames alone do not imply missing art.

## Proposed visual direction

Interpret “more 2026” as a sharper, more responsive product with its own identity. This is a design recommendation, not a claim about market trends.

Use a believable fictional code-hosting application inhabited by an illustrated workplace cast. Neutral ink/slate surfaces, crisp typography, restrained borders and one product accent can support readable code. Reserve red/green for actual changes, warnings and outcomes. Add warmth through portraits, messages and moments outside the diff.

The desktop information order should be:

1. Compact global bar: company/repository, day/time and the three game meters.
2. Left: scannable incoming PR list with avatar, title, urgency and waiting state.
3. Center: PR title, author/branch context, description, working Files/Conversation navigation, and a large diff.
4. Right: contextual coworker messages and current rules, collapsible when space is constrained.
5. Persistent review actions plus a small receipt for the last decision.

On a phone, preserve that priority rather than stacking desktop panels: status, current PR, diff and actions; queue/rules/messages open on demand. Avoid controls that look clickable but do nothing. Syntax highlighting must not conceal change markers, and status must remain understandable without color.

## Coworkers and assets

The initial six-character sketch below is retained for voice exploration. The developer-led roster in the follow-up section supersedes it following owner feedback. All characterization is proposed, not existing behavior:

| Character | Proposed voice | Visual cue | Example response |
| --- | --- | --- | --- |
| Riya, PM | Deadline-focused and persuasive | Calendar and release notes | “That unblocks the launch. I owe you one.” |
| Evan, SRE | Dry humor, protective of uptime | Pager and incident mug | “Good catch. I'd prefer to sleep tonight.” |
| Marta, QA | Precise, asks for evidence | Annotated notebook | “Reproduced it. Adding the regression case.” |
| Noel, Security | Brief and skeptical | Security key and checklist | “Internal traffic is still traffic. Validate it.” |
| Jules, CTO | Balances delivery with responsibility | Worn engineering notebook | “Ship the safe part. We can revisit the shortcut.” |
| Jonah, intern | Earnest and curious | Heavily annotated notes | “Oh. I only tested the happy path.” |

Give each a recognizable silhouette, outfit, voice and three useful expressions: neutral, pleased and frustrated/concerned. Use the same assets for a small avatar and a larger briefing/reaction portrait. Keep a fallback avatar for community authors. Portrait identity must never become a reliable clue that a PR is clean or buggy.

First asset set: six portraits with three expressions each, one team/office illustration for the landing or briefing, and a small consistent set of status/reaction icons. Add a few restrained arrival/decision/incident cues; generated audio cues already exist, so this is refinement rather than introducing sound from scratch. Provide mute and reduced-motion behavior. Decorative desk objects and extensive animation can follow once the core loop benefits from the first assets.

A portrait alone will not create personality. Characters must recur, speak differently, and react to specific decisions. Begin with authored event-driven lines; defer simulation-heavy happiness meters and branching relationships until the simpler cast has been playtested.

## Contributor experience

Keep the 390 existing JSON scenarios and their validator. Build an authoring interface over that foundation rather than requiring contributors to learn every field up front.

Proposed flow: choose a starter or duplicate a scenario → choose author and PR metadata → paste a diff or edit before/after code → click offending lines → explain the bug and expected verdict → add optional character responses/Spanish copy → preview as a player → validate and export a contribution.

The editor should show actionable errors beside the offending field, keep drafts, and offer two preview modes: player mode with answers hidden, and author mode with annotations visible. Let contributors test both approve and request-changes outcomes. Export should include the expected folder/file layout and a short checklist; generated manifests remain automatic. Hosted publishing and account integration are separate decisions, not needed for a first local editor.

Technical groundwork is small but important: introduce optional stable author IDs while preserving existing strings; use file-qualified bug/selection references before expanding multi-file content; distinguish added/context/removed lines explicitly if removal scenarios are supported. Character comments and outcomes should be optional so existing scenarios stay playable. The authoring UI and game must share the renderer and validation rules.

## Proposed TODOs and acceptance criteria

- [ ] Design one review screen and one coworker treatment from main. At 1280×720, show meaningful diff content and both actions without page scrolling; validate narrow viewports and zoom.
- [ ] Prototype one complete loop with two characters and three scenarios: arrival, inspection, decision, reaction and end-of-day consequence. A player should be able to explain why their meters changed.
- [ ] Establish the portrait/style guide and shared character identities, then expand to the six-character cast. Test recognition at avatar size and consistent EN/ES voice.
- [ ] Simplify landing/onboarding: visible Start action, compact setup and guidance on the first two live PRs. Preserve an optional tutorial/help path.
- [ ] Add contributor search/duplicate and the guided authoring flow. Have a collaborator unfamiliar with the schema create one valid, playable scenario without editing generated manifests; observe where they get stuck.
- [ ] Verify context/deletion display, file-qualified line selection, keyboard focus, modal focus behavior, color-independent statuses, readable light/dark themes and localized copy.
- [ ] Redesign the summary around decisions and consequences, retaining useful incident detail. Treat this as a follow-up to the core desk rather than the first visual task.

## Evidence and boundaries

Browser inspected: main landing, tutorial modal, briefing, work desk, approve interaction, contributor gallery and template preview. Desktop screenshots were 1280×720. Responsive recommendations also use the CSS; this turn did not complete a controlled mobile breakpoint sweep. Summary recommendations use source inspection, not a fresh full-day playthrough. This is an expert review, not user research or a measured accessibility audit.

Screenshots:

- `/Users/amllamojha/.codex/worktrees/main-assessment/approve-please/docs/ui-review-main-landing.png`
- `/Users/amllamojha/.codex/worktrees/main-assessment/approve-please/docs/ui-review-main-desk.png`

Relevant implementation:

- `/Users/amllamojha/.codex/worktrees/main-assessment/approve-please/pages/index.tsx`
- `/Users/amllamojha/.codex/worktrees/main-assessment/approve-please/components/screens/WorkScreen.tsx`
- `/Users/amllamojha/.codex/worktrees/main-assessment/approve-please/components/work/PRViewer.tsx`
- `/Users/amllamojha/.codex/worktrees/main-assessment/approve-please/data/dayQuotes.ts`
- `/Users/amllamojha/.codex/worktrees/main-assessment/approve-please/pages/dev/templates/index.tsx`
- `/Users/amllamojha/.codex/worktrees/main-assessment/approve-please/docs/pr-template-guide.md`

Only assessment documents and screenshots changed. No application redesign or asset production was performed.

## Follow-up: developer-led cast and UX review

Owner feedback: include more developers and similar roles, include Spanish names, and review UX alongside visual design. Open PRs remain excluded. The ten-character roster below replaces the six-person production target above; earlier TODOs referring to six characters should use this roster. Introduce characters gradually rather than showing ten biographies during onboarding.

### Proposed cast

| Character | Role | Voice and recurring situations |
| --- | --- | --- |
| Lucía Navarro | Senior frontend developer | Direct and attentive to users; component changes, keyboard behavior, accessibility. |
| Diego Martín | Backend developer | Pragmatic, dry humor; APIs, validation, authorization and data boundaries. |
| Inés Romero | Platform developer | Calm and systems-minded; CI, deployments, configuration and observability. |
| Tessa | Data engineer | Precise about assumptions; imports, transformations, queries and boundary cases. |
| Ben | Design engineer | Visual craft with implementation depth; CSS, responsive layouts and component behavior. |
| Jonah | Junior developer | Curious and candid; asks useful questions and develops across repeated encounters. |
| Marta | QA automation engineer | Wants reproducible evidence; tests, flaky behavior and regression coverage. |
| Evan | SRE | Protective of uptime; incidents, load and operational consequences. |
| Noel | Security engineer | Concise and skeptical; threat boundaries, credentials and privacy. |
| Riya | Product manager | Deadline pressure and user impact; explains why work matters. |

Lucía, Diego and Inés are proposed new Spanish names. Tessa, Ben and Marta build on existing roles, with proposed role clarification. Jules can remain an occasional leadership cameo. These are fictional characters, not portraits of real people. Names stay consistent in English and Spanish; dialogue and role labels are localized. Personality comes from work habits and individual motivations, not nationality stereotypes.

Developers should submit most PRs. QA, security and SRE can both submit work and participate in conversations. Every author needs clean and flawed scenarios; seniority and personality must not become answer keys. Use a shared character card containing stable ID, display name, role, portrait expressions, voice examples, recurring concerns and outcome-specific dialogue. Contributors can select an existing character or retain a guest author.

### UX findings and proposed changes

These findings combine the preceding browser observations with source inspection. Proposed behavior changes require implementation and playtesting; they have not been applied.

| Priority | Journey | Friction or evidence | Proposed UX |
| --- | --- | --- | --- |
| P1 | Understand a verdict | The UI calls tagging optional. In the current evaluator, any request without a matching tagged bug line increments false positives, including a buggy PR rejected without tags. | Distinguish correct rejection, precise bug identification and rejection of clean code. If tagging remains optional, missing a tag should forfeit the precision bonus rather than imply a false accusation. |
| P1 | Learn the game | Six tutorial slides precede real play; the clock runs during work. The configured shift is two real minutes, which differs from the longer timing discussed in the README. | Teach approve, inspect and request changes inside the first two scenarios. Explain the actual time pressure. Consider pausing during first-run instruction and an untimed practice mode; current learning mode removes queue penalties but is not an untimed mode. |
| P1 | Understand consequences | A decision advances the PR and clears local feedback. | Preserve a visible, nonblocking receipt associated with the previous PR. Show what happened and why; make detailed explanations available on demand. |
| P1 | Read and decide | Help and counters take space from code; actions can sit near/below the viewport edge. | Keep active code and verdict controls visible. Queue selection and rules must remain reachable on narrow layouts. |
| P1 | Author content | The gallery supports inspection, not guided creation or outcome testing. | Add search, duplicate, structured editing, inline validation and hidden-answer playtesting. Keep draft changes recoverable and offer export without manual manifest editing. |
| P2 | Manage interruptions | No explicit pause/resume control or saved run in the inspected game state. | Add a deliberate pause affordance and recoverable progress, with clear behavior for ranked versus practice runs. Avoid repeated confirmation during ordinary review actions; protect restart/discard actions. |
| P2 | Understand the day | Briefing copy sounds like policy, but mantras are flavor rather than enforced rules. | Separate objectives/rules from character comments. Avoid suggesting scoring rules that do not exist. |
| P2 | Learn from mistakes | Incident detail exists in the summary, but the experience is primarily counters and lists. | Group feedback around decisions: what you caught, what escaped, the relevant code and one actionable lesson. Include a character response without replacing the explanation. |
| P2 | Use controls accessibly | Selected diff lines lack an exposed pressed state; tutorial and leaderboard implementations do not provide a complete focus-management/Escape pattern. | Make selection and focus explicit, implement keyboard-safe dialogs and test zoom and screen readers. This is source evidence, not a completed accessibility audit. |
| P2 | Play in Spanish | Some setup and leaderboard strings are hardcoded English. | Localize the entire journey, including validation, help, outcomes and character lines. Test longer Spanish labels in the actual layout. |

### Updated TODOs

- [ ] Agree the verdict/precision distinction and align scoring, labels, counters and explanations before visual polish hides the inconsistency.
- [ ] Prototype onboarding and one full review loop using Lucía and Diego, plus a brief message from Riya. Include clean approval, correct rejection without tagging and precise rejection.
- [ ] Define character cards for the ten-person roster, then produce portraits in batches after the two-character treatment is validated.
- [ ] Specify pause, practice timing and saved-progress behavior; evaluate any leaderboard implications before changing ranked play.
- [ ] Conduct observed usability sessions with a first-time player and a first-time content contributor. Check whether each can explain a verdict, find rules, recover from interruptions and complete the task without coaching.
- [ ] Verify keyboard-only play, dialog focus, Spanish copy, small screens and 200% zoom on the prototype.

Additional source evidence: `/Users/amllamojha/.codex/worktrees/main-assessment/approve-please/context/GameContext.tsx`, `/Users/amllamojha/.codex/worktrees/main-assessment/approve-please/constants/gameSettings.ts`, `/Users/amllamojha/.codex/worktrees/main-assessment/approve-please/components/common/LeaderboardModal.tsx` and `/Users/amllamojha/.codex/worktrees/main-assessment/approve-please/components/screens/BriefingScreen.tsx`.
