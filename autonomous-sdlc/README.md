# Autonomous SDLC System

This folder is a repo-local operating system for AI-assisted software delivery. It combines the best ideas from spec-driven development, standards injection, role-based planning, approval-gated execution, and autonomous repair loops.

## Design Sources
- `Spec Kit`: spec -> clarify -> plan -> tasks -> implement artifact flow
- `Agent OS`: project standards, standards discovery, and spec shaping
- `BMAD`: clear phase coverage and specialized roles
- `OpenAgentsControl`: approval gates, pattern-aware execution, validation
- `OpenHands` and `SWE-agent`: strong autonomous execution and diagnose/fix loops
- `GitHub Agentic Workflows`: repository automation with safety guardrails

## Lifecycle
1. Intake and classify the work.
2. Load relevant standards and current repo context.
3. Write and clarify the feature spec before coding.
4. Create an implementation plan with targeted research.
5. Break the plan into ordered tasks.
6. Implement in small, reversible slices.
7. Verify with code review, QA, security, and a diagnose/fix loop.
8. Prepare PR, release notes, and rollout plan.
9. Run a retrospective and update standards.

## Core Roles
- `orchestrator`: owns flow, approvals, and handoffs
- `researcher`: resolves unstable or external facts
- `architect`: turns scope into a technical design
- `builder`: implements and self-checks changes
- `qa`: verifies behavior, risk, and regressions
- `release-manager`: handles merge, rollout, and learning capture

## Approval Gates
- Approve after `spec.md` is stable.
- Approve after `plan.md` is stable.
- Approve before high-risk edits, dependency changes, or destructive actions.
- Approve before merge or release.

## Folder Map
- `agents/`: role definitions and responsibilities
- `governance/`: approval and automation policy
- `standards/`: repo rules that agents must load before work
- `workflows/`: phase-by-phase operating instructions
- `templates/`: repeatable feature artifacts
- `features/`: numbered feature workspaces
- `scripts/`: helper commands

## Commands
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
1. Create a feature folder with `new_feature.sh`.
2. Fill in `spec.md`, then `plan.md`, then `tasks.md`.
3. Implement from the task list and keep tasks current.
4. Record evidence in `qa-report.md`.
5. Prepare `release-notes.md` and `retro.md` before closing the work.

## Guardrails
- `pre-commit` blocks commits that change repo content without also updating a feature workspace.
- `pre-push` blocks direct pushes to `main` and runs the quality gates.
- Quality gates currently include repository validation plus Playwright smoke tests against both HTML prototypes.
