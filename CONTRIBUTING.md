# Contributing

Use [AGENTS.md](/home/vi/Digi_Commerece/AGENTS.md) as the contributor guide and [autonomous-sdlc/README.md](/home/vi/Digi_Commerece/autonomous-sdlc/README.md) as the operating workflow.

## Expected Flow
1. Create a numbered feature workspace with `autonomous-sdlc/scripts/new_feature.sh`.
2. Fill in `spec.md`, `plan.md`, and `tasks.md` before implementation.
3. Record verification in `qa-report.md`.
4. Prepare `release-notes.md` and `retro.md` before merge.

## Pull Requests
Use `.github/pull_request_template.md` and include screenshots or recordings for visible UI changes.

## Validation
Run:

```bash
bash autonomous-sdlc/scripts/validate_repo.sh
```

