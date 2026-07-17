# Approve Please – Design & Requirements Document

## 1. Overview

**Title:** Approve Please
**Genre:** Narrative pr-sim / judgment game (inspired by *Papers, Please*) ([Wikipedia][1])
**Fantasy:** You’re a software engineer whose whole job is **GitHob Pull Request Reviewer**. Work runs from **9:00–17:00**; during the day, waves of PRs arrive. You must quickly decide whether to **Approve** (deploy to prod) or **Request changes**, trying to balance **speed vs quality** like real-world code review tradeoffs. ([SmartBear Software][2])

**Target platform:** Web (desktop browser)
**Tech stack:** React + Next.js (or plain React SPA), TypeScript recommended.

---

## 2. Core Fantasy & Design Pillars

1. **Paperwork as gameplay**

   * Sitting at a “desk,” you process incoming PRs, each with a short diff and description. This mirrors *Papers, Please*’s booth-based, document-checking core. ([Wikipedia][1])

2. **Increasing rule complexity per day**

   * Each in-game day adds or tweaks **review rules** (security, tests, performance, style), similar to how Papers, Please adds new document rules over its 30+ day campaign. ([Wikipedia][1])

3. **Tension: speed vs correctness**

   * Approving fast boosts throughput but risks bugs reaching production.
   * Being too strict or slow hurts velocity and annoys stakeholders. This mirrors real code review best-practices and tradeoffs. ([SmartBear Software][2])

4. **Consequences & narrative flavor**

   * Production incidents, angry PMs, SREs, and performance reviews reflect how well you balance those tradeoffs. ([CodeAnt AI][3])

---

## 3. Core Game Loop (Per Day)

Each **day** is one loop:

1. **Morning Briefing**

   * Short text summary of:

     * New rules or constraints.
     * Today’s focus (e.g., “Security crackdown” or “Ship feature X fast”).
   * Optional Slack/email-style messages from NPCs.

2. **Workday (9:00–17:00, real-time 3–7 minutes)**

   * A **clock** ticks from 9:00 to 17:00.
   * PRs arrive in **waves** (bursts of 2–5 PRs) with increasing intensity later in the day.
   * For each PR:

     * See title, author, short description.
     * See a **diff snippet** (5–30 lines max, reflecting best-practice that reviews should be small and focused). ([SmartBear Software][2])
     * You inspect according to the current rulebook.
     * You either:

      * **Approve** → PR is merged & deployed; if it has hidden bugs, **production bug counter** increases.
      * **Request Changes** → optional line tagging for a bonus; no category selection. Tag the exact line to earn extra satisfaction, otherwise it’s just a standard reject.

3. **End-of-Day Summary**

   * Show stats:

     * PRs processed.
     * Bugs that reached production.
     * Correct rejections vs false positives.
   * Score the day & update meta-meters (Stability, Velocity, Manager Satisfaction).

4. **Progression to Next Day**

   * New rules, more complex PRs, more volume, sometimes story events (re-orgs, incidents, audits).

---

## 4. Time & Day Progression

* **Shift time:** 9:00–17:00 (8 in-game hours). Map to e.g. **5 real minutes** (can be configurable).
* **Time scale:** 1 in-game minute = ~0.6 seconds real time.
* **Days:** MVP target ~5–7 days; later expansions can go to 20–30 like Papers, Please. ([Papers Please Wiki][4])

**Time effects:**

* PR waves spawn based on current time (e.g., busy mid-morning, post-lunch spike).
* Some events are time-based (e.g., “prod incident” at 11:30 if you shipped a bad PR earlier).

**Daily PR wave rules:**

* Fixed cadence at minutes 0, 60, 180, and 360. The 9:00 wave (minute 0) always delivers exactly two PRs to set the day’s pace.
* The remaining three waves pull their size from a weighted bag `[1, 1, 2, 2, 2, 3, 3, 4, 5]` so smaller bursts are more common but occasional big spikes happen.
* Each PR in a wave is randomly drawn from the combined pool of generic templates plus any templates tagged with the player’s chosen language preference, keeping content on-theme even when the deck reshuffles.

---

## 5. Pull Requests: Data Model & Bug Patterns

### 5.1 PR Structure

Each PR instance contains:

* `id`
* `title` (string)
* `author` (string + persona traits)
* `description` (short summary).
* `files`: list of diffs, each with:

  * `filename`
  * `language`
  * `lines`: array of line objects with:

    * `lineNumber`
    * `content`
    * `isNew` / `isRemoved`
* `bugPatterns`: array of bug objects (may be empty:

  * `kind` (e.g., `"logic"`, `"security"`, `"performance"`, `"style"`)
  * `lineNumbers` (where bug is located)
  * `severity` (e.g., `"minor"`, `"major"`, `"critical"`)

### 5.2 Bug Archetypes

Keep bugs **pattern-based**, not real compilers:

* **Logic bug:** wrong comparison, off-by-one, wrong variable, missing return.
* **Security bug:** raw SQL string concatenation, unsafe string building, missing auth checks. ([Nulab][5])
* **Performance bug:** nested heavy loops, unnecessary per-request I/O.
* **Style / maintainability:** huge functions, TODOs, commented-out blocks, no tests.

Rules for each **day** specify which bug types you’re expected to catch.

---

## 6. Player Actions & UI

### 6.1 Desk Layout

Main game screen is a split layout:

* **Left panel:**

  * PR queue (incoming & waiting PRs with title + author + urgency).
  * Clock (9:00–17:00).
* **Center panel:**

  * PR details:

    * Header: title, author, description, tags (feature, hotfix, refactor).
    * Scrollable diff view with monospaced font and syntax highlighting.
    * Clickable lines for highlighting suspected bugs.
* **Right panel:**

  * Current **rulebook**:

    * Bullet list of active rules (e.g., “No TODOs in production code”, “All endpoints must validate input”).
  * Counters:

    * PRs processed.
    * Bugs in production.
    * Daily rating / warnings.
  * Action buttons:

    * **Approve & Deploy**
    * **Request Changes**

### 6.2 Interaction Flow Per PR

1. Click a PR in queue → it loads into center panel.

2. Review snippet against rulebook.

3. Optionally **highlight lines** for a bonus (no category selection).

4. Choose action:

   * **Approve**

     * If `bugPatterns.length === 0` → good; increments approved counter, maybe slight trust gain.
     * If there are bugs → bug meter increases; if high severity, may trigger events.
   * **Request Changes**

     * If you tagged a line that matches an actual bug:

       * Earn a satisfaction bonus; PR “fixed” off-screen, may reappear later as clean.
     * If you rejected without a matching tag:

       * No bonus, but the reject still slows velocity.

5. PR leaves desk; time keeps ticking; queue moves on.

---

## 7. Scoring, Meters & Failure States

### 7.1 Meters

1. **Production Stability** (0–100)

   * Decreases when buggy PRs are approved.
   * Large decrease for critical bugs (security/performance).
   * If it hits 0 → **major outage → possible game over**.

2. **Delivery Velocity** (0–100)

   * Increases for approved PRs (especially important/urgent ones).
   * Decreases if you reject many clean PRs or process too few per day.

3. **Manager Satisfaction / Job Security** (0–100)

   * Derived from the balance of Stability & Velocity over multiple days.
   * Low → warnings; zero → **fired (game over)**.

These reflect real findings that code review needs balance: too slow vs too fast both have downsides. ([CodeAnt AI][3])

### 7.2 Daily Summary

At end of each day:

* `bugsToProd`
* `prsApproved`
* `prsRejected`
* `truePositives` (valid bugs caught)
* `falsePositives` (clean PRs rejected)
* Changes in Stability, Velocity, Satisfaction.
* Short narrative blurb (“Marketing furious about downtime”, “CTO impressed with your vigilance”, etc.).

### 7.3 Failure / Endings (later)

* Fired for poor performance (low Satisfaction).
* Company meltdown from too many bugs (low Stability).
* “Hero Reviewer” ending (high everything after N days).

---

## 8. Difficulty Curve & Day Design

Inspired by Papers, Please’s “new rules each day” structure. ([Wikipedia][1])

Example MVP week:

* **Day 1 – Onboarding**

  * Few PRs, very obvious bugs (syntax/logic).
  * Rule: “No obvious errors.”
  * Tutorializes highlighting & actions.

* **Day 2 – Testing Rules**

  * Rule: “Every PR must touch tests or be explicitly exempt.” (some PRs violate this).
  * Introduce bug types like “no tests added.”

* **Day 3 – Security Crackdown**

  * Rule: “No raw SQL string concatenation / insecure patterns.”
  * Introduce security bugs (harder to spot).

* **Day 4 – Performance Awareness**

  * Rule: “Avoid heavy loops in hot paths.”
  * Mix logic + perf bugs in same PRs.

* **Day 5 – Chaos / Incident**

  * High volume of PRs, conflicting pressures:

    * PM: “We *must* ship feature X today.”
    * SRE: “Please don’t risk stability; any bug is unacceptable.”
  * Designed to really stress speed vs safety.

Each day:

* Adds 1–2 new rule book entries.
* Increases PR volume & bug subtlety.

---

## 9. Tech Architecture (React / Next.js)

### 9.1 Pages & Layout

* `/` – Landing/title screen.
* `/game` – Main game view.

Use a root `<GameProvider>` for shared state.

### 9.2 Core State

Global game state (Context + reducer or XState):

* `currentDay`
* `currentTime` (minutes from 9:00)
* `queue` (PRs waiting)
* `currentPR`
* `rules` (active rules for day)
* Meters: `stability`, `velocity`, `satisfaction`
* `bugsToProd`, `prsApproved`, `prsRejected`, `truePositives`, `falsePositives`
* `gameState`: `"BRIEFING" | "WORK" | "SUMMARY" | "GAME_OVER"`

### 9.3 Main Components

* `<GameShell>`

  * Handles top-level state machine and timer.
* `<BriefingScreen>`

  * Shows day intro.
* `<DeskLayout>`

  * `<Clock />`
  * `<PRQueue />`
  * `<PRViewer />`
  * `<RulebookPanel />`
  * `<StatsPanel />`
  * `<ActionButtons />`
* `<DaySummaryModal />`
* `<GameOverScreen />`

### 9.4 Systems / Hooks

* `useGameClock` – advances in-game time during WORK state.
* `usePRSpawner` – based on time, pushes PRs into queue in waves.
* `useDecisionEvaluator` – applies scoring when Approve / Request Changes is clicked.
* `useDayProgression` – loads rules & config per day.

---

## 10. MVP Scope

For the **first playable version**, target:

1. **Core loop across 3 days:**

   * Day 1: logic bugs only.
   * Day 2: add test requirement rule.
   * Day 3: add simple security bug pattern.

2. **PR System:**

   * ~390 PR templates with known bugs / no-bug variants, auto-discovered from `data/prTemplates/`.
   * PR queue, viewer, highlighting, Approve / Request Changes.

3. **Time & Waves:**

   * 9–17 clock, ~5 minutes per day.
   * PRs spawn at increasing rate.

4. **Scoring:**

   * Stability, Velocity, Satisfaction meters.
   * Bugs-to-prod & PR counters.
   * Simple day summary.

5. **UI:**

   * Readable layout with three panels.
   * Minimal but clear rulebook and stats.

6. **No need (yet) for:**

   * Fancy art.
   * Audio.
   * Complex branching endings.

Once this runs, you can iterate with more bug types, more days, better writing, and visual polish.


[1]: https://en.wikipedia.org/wiki/Papers%2C_Please?utm_source=chatgpt.com "Papers, Please"
[2]: https://smartbear.com/learn/code-review/best-practices-for-peer-code-review/?utm_source=chatgpt.com "Best Practices for Peer Code Review"
[3]: https://www.codeant.ai/blogs/good-code-review-practices-guide?utm_source=chatgpt.com "The Complete Code Review Process for 2026"
[4]: https://papersplease.fandom.com/wiki/Timeline?utm_source=chatgpt.com "Timeline | Papers Please Wiki - Fandom"
[5]: https://nulab.com/learn/software-development/code-reviews/?utm_source=chatgpt.com "Choosing the best code review method: 4 types explained"

## Development

- `npm ci` — install dependencies (Node 20+)
- Copy `.env.example` to `.env.local` and fill in the Supabase values
  (`SUPABASE_SERVICE_ROLE_KEY` must never be exposed to the client or committed)
- `npm run dev` — start the dev server
- `npm run typecheck && npm run lint && npm test` — verification
- `npm run generate:templates` — optionally validate templates and regenerate the
  manifests immediately; this runs automatically before `npm run dev` and
  `npm run build`

### Add your own PRs

Contribute a review scenario by adding a validated template under
`data/prTemplates/`. See [CONTRIBUTING.md](CONTRIBUTING.md) for the workflow
and the [PR template authoring guide](docs/pr-template-guide.md) for the JSON
format, validation rules, tests, coverage report, and dev preview.

## Kiro PR Template MCP

This repository includes a custom local stdio MCP server that connects Kiro to
Approve Please's real filesystem-backed content pipeline. No database is needed:
`data/prTemplates/**/template.json` is the persistent catalog, and the generated
TypeScript manifests are what the game imports. The server does not return fake
cards and does not require API keys or other secrets. Without this MCP, Kiro can
edit files as a general coding task, but it cannot discover the catalog, invoke
the content validator, or perform a guarded add as named first-class tools.

The integration gives Kiro three first-class tools:

- `list_templates` accepts an optional `{ "language": "typescript" }` and returns
  sorted IDs, titles, paths, languages, and bug kinds from the validated catalog.
- `validate_template` accepts `{ "language": "...", "template": { ... } }` and
  returns either the safe target path or the real pipeline diagnostics without
  writing files.
- `add_template` accepts the same candidate and returns the created path plus
  manifest status. It refuses traversal, duplicates, and overwrites, writes
  formatted JSON atomically, and regenerates the manifests. If generation
  fails, it removes the newly added card.

### Setup in Kiro

1. Install Node 20+ and run `npm ci`.
2. Open this repository as the Kiro workspace. The checked-in
   [`.kiro/settings/mcp.json`](.kiro/settings/mcp.json) launches
   `npm run --silent mcp:templates`; `--silent` keeps stdout reserved for MCP.
3. Start a new Kiro session, then use `/mcp` or run
   `kiro-cli mcp list` to confirm `approve-please-templates` is loaded.
   Diagnose startup with
   `kiro-cli mcp status --name approve-please-templates`.
4. Ask Kiro to list templates or author a candidate. Review and approve the
   `add_template` mutation before it writes game data. Avoid running a separate
   `add_template` or `npm run generate:templates` process during that brief add;
   writes are serialized within one MCP server process.

The candidate object uses the format documented in
[`docs/pr-template-guide.md`](docs/pr-template-guide.md). A successful add lands
at `data/prTemplates/<language>/<templateId>/template.json`. Run `npm run dev`
and open `/dev/templates/<templateId>` to inspect it in the real `PRViewer`, or
refresh the game to play the new card.

To verify the integration directly:

```bash
npm run generate:templates
npx vitest run tests/templateMcp.test.ts tests/templateMcpStdio.test.ts
npm run typecheck
npm run lint
npm test
```

### 30–60 second demo flow

1. Show `.kiro/settings/mcp.json` and note that the local stdio integration has
   no keys and uses the game's files rather than a database.
2. Ask Kiro to list TypeScript cards; show IDs read from the real catalog.
3. Ask for “a sneaky PR with a hidden security bug.” First validate a prepared
   bad draft whose bug points at an unchanged line, showing the real validator
   reject it without creating a file.
4. Correct the line, validate again, then approve `add_template`.
5. Show the new JSON and generated manifest entry, open
   `/dev/templates/<templateId>`, and display the playable card.

Future work could convert GitHub diffs into cards or use Kiro as a live NPC, but
both are intentionally outside this small content-authoring integration.

## Deployment

This app requires a Node/server deployment (e.g. Vercel or `next build && next start`):
`pages/api/leaderboard.ts` is a server route holding the Supabase service-role key,
which cannot exist in a static export. A previous static-HTML release workflow was
removed for this reason (see plans/002-fix-release-pipeline.md).
