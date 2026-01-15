# PR Template Summary Report

Generated: 2026-01-10

## Totals by Language

| Language   | Total | With Bugs | Clean | Bug Ratio |
|------------|-------|-----------|-------|-----------|
| css        |    50 |        16 |    34 |      32% |
| generic    |    19 |         8 |    11 |      42% |
| java       |    50 |        40 |    10 |      80% |
| python     |    50 |        40 |    10 |      80% |
| rust       |    50 |        40 |    10 |      80% |
| typescript |    91 |        69 |    22 |      76% |
| **TOTAL**  |   310 |       213 |    97 |      69% |

## Bug Kinds Distribution

- logic: 74
- security: 52
- performance: 46
- style: 39
- accessibility: 2

## Bug Kinds by Language

- **css**: logic(8), style(4), performance(2), accessibility(2)
- **generic**: security(1), style(7)
- **java**: logic(13), security(11), performance(11), style(5)
- **python**: logic(15), security(10), performance(10), style(5)
- **rust**: logic(15), security(10), performance(10), style(5)
- **typescript**: logic(23), performance(13), security(20), style(13)

## Observations

1. **CSS has low bug ratio (32%)** - May be too easy compared to other languages
2. **Python/Rust are mirrors** - Same titles across languages (intentional per design)
3. **No duplicates within same language** - All unique after fixing generic/pr-071

## Clean PRs by Language

### css (34)
- Update header color scheme
- Style main content area
- Style external links
- Remove top margin from first paragraph
- Style nested list items
- Add card padding
- Center container element
- Fix layout width calculations
- Set global font family
- Fix inline badge spacing
- Add notification badge to icon
- Style sticky footer
- Create flexbox container
- Add flexbox direction
- Add flexbox justify-content
- Add responsive breakpoint
- Add relative units
- Add viewport units
- Add percentage width
- Define CSS variable
- Use CSS variable
- Add CSS variable with fallback
- Add basic transition
- Add keyframe animation
- Add BEM naming
- Add focus-visible styles
- Add flexbox gap
- Add grid layout
- Add text overflow ellipsis
- Add pseudo-element content
- Add nth-child selector
- Add clamp responsive font
- Add aspect-ratio
- Add scroll behavior

### generic (11)
- README onboarding reminder
- Document Usage Analytics runbook
- Document Delta Sync runbook
- Document Kpi Dashboard runbook
- Document Schema Diff runbook
- Document Incident Escalation runbook
- Document Ops Console runbook
- Document Packet Analyzer runbook
- Document Audit Pipeline runbook
- Document Compliance Report runbook
- Document Release Coordinator runbook

### java (10)
- Region failover hook builder
- Ledger audit snapshot record
- Incident pager matrix helper
- Notification digest builder
- Webhook responder helper
- Compliance snapshot helper
- Tenant provisioner helper
- Deployment gate helper
- Rollback coordinator helper
- Health check aggregator

### python (10)
- Schedule cache warmer job hook
- Add ledger drift snapshot helper
- Add runtime health pulse emitter
- Add SLA window reset helper
- Add notification bundle builder
- Add feature flag backfill request helper
- Add access journal formatter
- Add release notes formatter
- Add service map upload helper
- Add carbon cache hydrator job

### rust (10)
- Schedule cache warmer job hook
- Add ledger drift snapshot helper
- Add runtime health pulse emitter
- Add SLA window reset helper
- Add notification bundle builder
- Add feature flag backfill request helper
- Add access journal formatter
- Add release notes formatter
- Add service map upload helper
- Add carbon cache hydrator job

### typescript (22)
- Crash guard for CSV importer
- Improve notification copy
- Add Usage Analytics panel
- Normalize Chat Escalation payloads
- Add Portal Theme panel
- Trigger predicate for Audit Pipeline
- Queue Warranty Center jobs
- Tenant lookup for Marketing Journey
- Tenant lookup for Usage Predictor
- Trigger predicate for Search Index
- Load Vault Rotation config
- Chunk Sprint Health records
- Trigger predicate for Risk Pager
- Stream Dataset Importer snapshots
- Scaffold tests for Kpi Dashboard
- Trigger predicate for Warranty Center
- Tenant lookup for Release Notes
- Add User Segmentation panel
- Add Backlog Triage panel
- Scaffold tests for Chat Escalation
- Scaffold tests for Sprint Health
- Load Chat Escalation config
