# Repository Automation

Use repository automation for repetitive review and maintenance work, not for unsupervised product decisions.

## Recommended GitHub Automations
- issue triage: classify bugs, features, and questions
- PR review prep: summarize touched files, risks, and missing evidence
- CI failure diagnosis: collect failing jobs, logs, and likely causes
- documentation drift checks: compare specs, plans, and implemented behavior
- release prep: draft release notes from merged work

## Safety Rules
- default to read-only repository access
- require sanitized write paths or explicit approval for file mutation
- keep job permissions minimal
- log decisions and outputs back into issues or PRs

## Local Agent Automation
- local agents can own implementation loops
- repository agents should mostly observe, summarize, gate, and report
- never let unattended automation merge high-risk changes
