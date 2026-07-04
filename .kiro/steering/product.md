# Product Overview

**Approve Please** is a narrative PR-review simulation game inspired by _Papers, Please_.

## Vision

Two complementary modes in one game:

- **Learning mode** — Teaches players to spot real bug patterns (SQL injection, off-by-one errors, missing tests, performance anti-patterns) across multiple programming languages. PRs are curated to build skill progressively.
- **Challenge mode** — Time-pressured, Papers-Please-style gameplay where speed vs quality tension drives the experience. Meters, consequences, and narrative events create stakes.

Both modes share the same core loop and PR content. The difference is pacing, scoring leniency, and whether tutorial hints are shown.

## Core Fantasy

You're a software engineer whose job is **GitHob Pull Request Reviewer**. Work runs 9:00–17:00; during the day, waves of PRs arrive. You must quickly decide whether to **Approve** or **Request Changes**, balancing speed vs quality like real-world code review tradeoffs.

## Game Loop

1. **Morning Briefing** - Day intro with new rules/constraints
2. **Workday** - Review PRs against the rulebook, approve or reject
3. **End-of-Day Summary** - Stats and meter updates
4. **Progression** - New rules, more complex PRs, story events

## Key Mechanics

- **Three Meters**: Stability (bugs in prod), Velocity (throughput), Satisfaction (job security)
- **Bug Detection**: Players highlight suspicious lines before rejecting for bonus points
- **Bug Types**: logic, security, performance, style
- **Severity Levels**: minor, major, critical
- **PR Waves**: Spawn at fixed intervals with weighted randomness

## Content Pipeline

Adding new languages and PR templates should be frictionless:

- Drop a `template.json` into `data/prTemplates/<language>/<template-name>/` and it's auto-discovered at build time
- A Kiro prompt (`.kiro/prompts/generate-pr-template.md`) guides AI-assisted template generation — provide a language, bug type, and difficulty and it produces a valid template JSON
- Templates are validated against the `PullRequestTemplate` type at build time

## Audio

- **Background music**: Ambient lo-fi / synthwave tracks that play during the workday phase, with volume control and mute toggle
- **Sound effects**: Short synthesized cues for PR arrival, approve/reject actions (already implemented via `useAudioCue`)
- Audio files live in `public/audio/` and are loaded on demand

## Target Platform

Web browser (full Next.js website, standard server/SSG deployment)

## Localization

Supports English (en) and Spanish (es) with locale-aware PR content
