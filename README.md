# Digi_Commerece

This repository contains the Spaces product planning system, HTML prototypes, and the first production-oriented host application baseline.

## Current Contents
- `spaces_final.html`: guest or member-side prototype
- `spaces_host.html`: host-side prototype
- `spaces_prd.docx`: product requirements document
- `spaces_ux_guide.docx`: UX guidance
- `apps/host-mobile/`: Expo Router host application
- `packages/`: shared domain contracts, API contracts, and design tokens
- `supabase/migrations/`: tracked database changes for schema `Digi`
- `autonomous-sdlc/`: repo-local operating system for agentic delivery
- `autonomous-sdlc/product/`: product planning, discovery briefs, and shared product contracts
- `autonomous-sdlc/process.md`: consolidated workflow and approval rules

## Development
Install the workspace and run the main local commands from the repo root:

```bash
corepack pnpm install
python3 -m http.server 8000
npm run host:dev
npm run host:web:export
npm run verify
```

Use the Python server for the HTML prototypes. Use `npm run host:dev` for the Expo host app and `npm run host:web:export` for the browser-tested web export. `npm run verify` runs repo validation, unit tests, typecheck, Supabase schema checks, and Playwright smoke tests.

## Autonomous Workflow
Major product phases should start from the product planning docs and a discovery brief, then move into a feature workspace:

```bash
sed -n '1,200p' autonomous-sdlc/product/design-approach.md
sed -n '1,240p' autonomous-sdlc/product/milestones.md
sed -n '1,240p' autonomous-sdlc/product/backlog.md
bash autonomous-sdlc/scripts/new_feature.sh booking-flow "Booking Flow"
```

Validate the repository or a feature workspace:

```bash
bash autonomous-sdlc/scripts/validate_repo.sh
bash autonomous-sdlc/scripts/check_feature.sh autonomous-sdlc/features/001-booking-flow
npm run verify
```

## Approved Stack
The approved v1 stack is documented in `autonomous-sdlc/product/architecture/`. The current implementation baseline is:
- `pnpm` workspace with end-to-end TypeScript
- Expo Router host app in `apps/host-mobile`
- Supabase for auth, Postgres, and tracked migrations in schema `Digi`
- Playwright and Vitest for verification

## GitHub Integration
GitHub templates and workflow files live in `.github/`. Branch protection and repository rules are documented in `autonomous-sdlc/github-repo-settings.md`.

## Hooks And Session Continuity
Install local hooks with `npm run hooks:install`. Start future sessions with `npm run session:start` so the current lessons and open feature workspaces are loaded before development begins.
