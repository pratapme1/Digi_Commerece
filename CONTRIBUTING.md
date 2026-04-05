# Contributing

Use [AGENTS.md](/home/vi/Digi_Commerece/AGENTS.md) as the contributor guide, [autonomous-sdlc/README.md](/home/vi/Digi_Commerece/autonomous-sdlc/README.md) for the folder overview, and [process.md](/home/vi/Digi_Commerece/autonomous-sdlc/process.md) for the operating workflow.

## Expected Flow
1. Create a numbered feature workspace with `autonomous-sdlc/scripts/new_feature.sh`.
2. Fill in `spec.md`, `plan.md`, and `tasks.md` before implementation.
3. Implement in thin slices and keep `tasks.md` current.
4. Record verification in `qa-report.md`.
5. Prepare `release-notes.md` and `retro.md` before merge.

## Pull Requests
Use `.github/pull_request_template.md` and include screenshots or recordings for visible UI changes.

## Validation
Run:

```bash
corepack pnpm install
bash autonomous-sdlc/scripts/validate_repo.sh
npm run verify
```

Use `npm run host:dev` for the Expo host app and `python3 -m http.server 8000` for the HTML prototypes when manual browser checks are required.
