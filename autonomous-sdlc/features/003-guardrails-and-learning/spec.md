# Feature Spec: 003 Guardrails And Learning

## Summary
Add hard guardrails that reduce the chance of agent mistakes making it into Git history or GitHub unchecked. The repo should enforce feature-context updates, block direct pushes to `main`, run Playwright browser smoke tests before push, and maintain a persistent lessons file that later sessions must read before development.

## Problem
The repository workflow documented good behavior, but it did not yet enforce that behavior. An agent could still skip task context, make unsupported claims, push without browser testing, or fail to carry forward lessons from earlier development work.

## Outcome
Before code reaches GitHub, the repo should require context, validation, and browser smoke tests. Future sessions should have a durable memory source in the repo that records mistakes and rules learned from earlier work.

## Users And Surfaces
- Primary users: repository owner, AI agents, future contributors
- Touched files or surfaces: local hooks, CI workflow, root tooling files, session-start flow, lessons memory, Playwright tests

## Scope
- In scope:
  - local git hooks
  - Playwright smoke tests for the two HTML prototypes
  - quality-gate scripts
  - persistent lessons memory and session-start guidance
  - CI updates to run the same quality gates
- Out of scope:
  - full visual regression coverage
  - production deployment gates
  - automated branch protection configuration through GitHub settings APIs

## Acceptance Criteria
- [x] The repo has installable local hooks that enforce feature-context and pre-push validation.
- [x] Playwright smoke tests run against both prototypes locally and in CI.
- [x] The repo has a persistent lessons file and a session-start command that future sessions can use to reload memory.

## Risks
- Risk: local hooks can be bypassed manually if a user intentionally disables them
- Risk: smoke tests are behavioral checks, not a full guarantee of product correctness

## Clarifications
- Open question: whether future work should add screenshot regression tests once the prototypes stabilize further

## Approval
- Status: approved
- Approved by: local implementation pass
- Date: 2026-04-04
