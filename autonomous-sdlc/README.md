# Autonomous SDLC System

This folder is a repo-local operating system for AI-assisted software delivery. It now uses a leaner structure so the durable entry points are easier to understand and maintain.

## Design Sources
- `Spec Kit`: spec -> clarify -> plan -> tasks -> implement artifact flow
- `Agent OS`: project standards, standards discovery, and spec shaping
- `BMAD`: clear phase coverage and specialized roles
- `OpenAgentsControl`: approval gates, pattern-aware execution, validation
- `OpenHands` and `SWE-agent`: strong autonomous execution and diagnose/fix loops
- `GitHub Agentic Workflows`: repository automation with safety guardrails

## Folder Map
- `product/`: design approach, milestones, backlog, discovery briefs, and shared product contracts
- `product/architecture/`: required stack, system design, security, infrastructure, and deployment docs before production-oriented work
- `features/`: numbered feature workspaces
- `scripts/`: helper commands
- `process.md`: consolidated workflow, standards, roles, and approval gates
- `lessons.md`: durable repo memory for later sessions
- `github-repo-settings.md`: manual GitHub settings to apply on the remote

## Commands
Install the workspace:

```bash
corepack pnpm install
```

Create a feature workspace:

```bash
bash autonomous-sdlc/scripts/new_feature.sh booking-flow "Booking Flow"
```

Validate a feature workspace:

```bash
bash autonomous-sdlc/scripts/check_feature.sh autonomous-sdlc/features/001-booking-flow
```

Validate the whole repository:

```bash
bash autonomous-sdlc/scripts/validate_repo.sh
npm run verify
```

Verify the remote Supabase baseline:

```bash
bash autonomous-sdlc/scripts/verify_supabase_schema.sh
```

Connect a GitHub remote once the repo exists on GitHub:

```bash
bash autonomous-sdlc/scripts/connect_github_remote.sh Digi_Commerece
```

Install local hooks:

```bash
npm run hooks:install
```

Start a later session with the right context:

```bash
npm run session:start
```

## How To Use This System
1. For major product work, start in `product/design-approach.md`, `product/milestones.md`, and `product/backlog.md`.
2. Create a phase discovery brief before planning milestone-sized work.
3. Complete `product/architecture/` before any real app-stack milestone past the prototype layer.
4. Read `process.md` for the full workflow and approval rules.
5. Create a feature folder with `new_feature.sh`.
6. Fill in `spec.md`, then `plan.md`, then `tasks.md`.
7. Implement from the task list and keep tasks current.
8. Record evidence in `qa-report.md`.
9. Prepare `release-notes.md` and `retro.md` before closing the work.

## Guardrails
- `pre-commit` blocks commits that change repo content without also updating a feature workspace.
- `pre-push` blocks direct pushes to `main` and runs the quality gates.
- Quality gates currently include repository validation, unit tests, typecheck, the Next.js attendee build, Expo host web export, Supabase schema verification, and Playwright smoke tests across the real attendee app, the exported host app, and the retained prototypes.
