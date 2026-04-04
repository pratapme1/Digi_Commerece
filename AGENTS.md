# Repository Guidelines

## Project Structure & Module Organization
The root contains the HTML prototypes `spaces_final.html` and `spaces_host.html`, product docs, and the active TypeScript workspace config. Real app code lives in `apps/host-mobile/` for the Expo host app, shared contracts live in `packages/`, and tracked database work lives in `supabase/migrations/`. The `autonomous-sdlc/` folder holds the workflow: `product/` for milestones, discovery, and architecture; `features/` for numbered workspaces; `scripts/` for validation helpers; and `process.md`, `lessons.md`, and `github-repo-settings.md` for operating rules.

## Build, Test, and Development Commands
Use these commands from the repo root:

```bash
corepack pnpm install
python3 -m http.server 8000
npm run host:dev
npm run host:web:export
bash autonomous-sdlc/scripts/new_feature.sh booking-flow "Booking Flow"
bash autonomous-sdlc/scripts/check_feature.sh autonomous-sdlc/features/001-booking-flow
bash autonomous-sdlc/scripts/validate_repo.sh
npm run verify
```

`corepack pnpm install` installs the workspace. `python3 -m http.server 8000` serves the prototypes. `npm run host:dev` starts the Expo host app, and `npm run host:web:export` builds its web export. The SDLC scripts create and validate feature workspaces. `npm run verify` runs repo validation, unit tests, typecheck, Supabase schema checks, and Playwright smoke tests.

## Coding Style & Naming Conventions
Use 2-space indentation in HTML, CSS, JavaScript, TypeScript, Markdown, and shell scripts. Keep filenames lowercase; root prototypes use underscores, and feature workspaces use a three-digit prefix plus slug such as `010-host-go-live`. Prefer semantic names, keep shared contracts in `packages/`, and avoid duplicating domain logic inside UI screens.

## Testing Guidelines
Run `npm run verify` before handoff or push. That command covers repo validation, Vitest unit tests, TypeScript checks, Expo web export, Supabase schema verification, and Playwright smoke tests. Manual browser validation is still required for visible UI changes; record evidence in the feature workspace `qa-report.md`.

## Commit & Pull Request Guidelines
Use short imperative commit subjects such as `Build host go-live flow`. Install hooks with `npm run hooks:install`. The hooks block commits that lack feature-context updates and block direct pushes to `main`. Open pull requests with `.github/pull_request_template.md`, link the relevant feature workspace artifacts, summarize risk, and include screenshots or recordings for visible UI changes.

For milestone-sized product work, begin with `autonomous-sdlc/product/design-approach.md`, `milestones.md`, `backlog.md`, and a discovery brief before opening implementation tasks.

## Security & Configuration Tips
Do not commit `.env` files, secrets, or unsafe third-party scripts. Treat auth, payments, uploads, personal-data handling, schema changes, and deployment changes as high-risk and route them through the approval gates in `autonomous-sdlc/process.md`.
