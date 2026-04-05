# Phase Discovery: M5 Launch Hardening And Pilot Readiness

## Phase
- Name: M5 Launch Hardening And Pilot Readiness
- Owner: orchestrator
- Target milestone: `M5`

## Objective
- Turn the current host-plus-attendee build into a pilot-ready package with repeatable critical-path evidence, performance budgets, destructive-action safeguards, and launch-support documentation.

## Inputs
- `autonomous-sdlc/lessons.md`
- `autonomous-sdlc/product/milestones.md`
- `autonomous-sdlc/product/backlog.md`
- `apps/host-mobile/`
- `spaces_final.html`
- `tests/e2e/`
- `playwright.config.ts`
- `autonomous-sdlc/scripts/run_quality_gates.sh`

## Current-State Evidence
- `M4` added the operational surfaces, but pilot readiness still required explicit proof that the host and attendee critical paths stayed stable across browser runs.
- Existing Playwright coverage proved the main live-room journey, but it did not yet enforce performance expectations or admin safeguards.
- The repo still lacked durable pilot docs for launch checklist, support handling, rollback steps, and the metrics to review during a real rollout.

## Locked Decisions
- `M5` keeps using Playwright as the critical-path proof tool for both the exported host app and the attendee prototype.
- Performance checks are local pilot budgets, not synthetic benchmarks; they exist to catch regressions in repo workflows, not to replace production monitoring.
- Pilot readiness documentation belongs in the repo under `autonomous-sdlc/product/pilot/` so future sessions can reuse it directly.
- `M5` is the final defined milestone in the current plan. There is no `M6` or `M7` yet.

## Open Questions
- Which pilot metrics should be promoted into automated production dashboards after the first external rollout.
- Whether future performance gates should include mobile network throttling once the attendee surface moves fully to the approved Next.js stack.
- How support ownership should change if real team-member sign-in lands after pilot feedback.

## Dependencies And Contracts
- Depends on `M1` through `M4` being functionally complete and browser-testable.
- Depends on `run_quality_gates.sh` as the single local proof entry point.
- Shares the same exported host app and copied attendee demo harness used for earlier milestones.

## Risks
- False-confidence risk: a green build is not enough unless the launch docs tell the next operator what to watch and how to recover.
- Flake risk: performance budgets can become noisy if they are tighter than the repo’s real local test conditions.
- Coverage risk: critical journeys can still drift if new routes are added without expanding the Playwright harness.

## Exit To Planning
- [x] Discovery evidence captured
- [x] Critical-path journeys and launch docs identified
- [x] Performance and safeguard checks scoped for local automation
- [x] Scope is clear enough for `spec.md` and `plan.md`
