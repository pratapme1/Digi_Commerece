# Lessons Learned

## Always Read Before Starting
- Start from a feature workspace, not from an unstructured prompt.
- If implementation files change, the corresponding feature workspace must also change.
- Do not trust claims about correctness without validation evidence.
- No direct pushes to `main`; use a branch and pass the quality gates first.

## Guardrails
- `pre-commit` checks that staged implementation work includes staged feature-context updates.
- `pre-push` runs repository validation and Playwright smoke tests.
- Completed feature retrospectives should promote reusable lessons into this file.

## Captured Lessons
- 2026-04-04 `001-autonomous-sdlc-bootstrap`: validate the workflow by using it on itself; scaffolding without self-test is not trustworthy.
- 2026-04-04 `002-github-wiring`: remote setup should be verified against the live repository, not inferred from local state alone.
