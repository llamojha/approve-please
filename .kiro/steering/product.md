# Product Overview

**Approve Please** is a narrative PR-review simulation game inspired by _Papers, Please_.

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

## Target Platform

Web browser (static export for itch.io or any static host)

## Localization

Supports English (en) and Spanish (es) with locale-aware PR content
