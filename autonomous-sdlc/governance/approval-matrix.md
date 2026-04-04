# Approval Matrix

## Autonomous By Default
- read repository files
- create or update feature artifacts
- make low-risk code and documentation edits
- run local validation commands
- perform targeted research on unstable dependencies

## Requires Human Approval
- dependency additions or major upgrades
- destructive file or history operations
- schema changes, production credentials, or deployment logic
- security-sensitive changes such as auth, payments, uploads, or personal data handling
- merge and release decisions

## Mandatory Gates
1. Spec gate: `spec.md` accepted.
2. Plan gate: `plan.md` accepted.
3. Verification gate: `qa-report.md` completed.
4. Release gate: `release-notes.md` and risk summary completed.
