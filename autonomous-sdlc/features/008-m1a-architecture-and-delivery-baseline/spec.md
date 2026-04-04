# Feature Spec: 008 M1A Architecture And Delivery Baseline

## Summary
Lock the production-oriented stack before the workflow moves into real app implementation. This phase turns the architecture gate from a placeholder into approved decisions for frontend, backend, data, auth, realtime, infrastructure, delivery, and release.

## Problem
The workflow now requires an architecture gate, but the actual technical decisions are still missing. Without approved stack and delivery choices, `M2` work would still turn into architecture-by-implementation.

## Outcome
The repository should contain an approved v1 pilot stack, a system overview, security and data rules, environment and infrastructure decisions, delivery and release rules, and ADRs that explain the major tradeoffs.

## Users And Surfaces
- Primary users: future implementation agents, maintainers, and reviewers deciding how the real product should be built
- Touched files or surfaces: `autonomous-sdlc/product/architecture/`, `autonomous-sdlc/product/discovery/`, `autonomous-sdlc/lessons.md`, feature workspace `008`

## Scope
- In scope:
  - approve the v1 pilot production stack
  - define system boundaries, security rules, environments, CI/CD, and rollback model
  - capture the decisions as architecture docs and ADRs
- Out of scope:
  - generating the app code for `apps/attendee-web` or `apps/host-mobile`
  - provisioning cloud services or secret stores
  - replacing the current prototype files in this phase

## Acceptance Criteria
- [x] The repo names one approved v1 stack for attendee web, host mobile, backend, data, auth, realtime, hosting, and observability.
- [x] The architecture layer explains how the system is split, how environments work, and how releases and rollback will be handled.
- [x] The decisions are backed by ADRs and recorded in a completed feature workspace so future sessions can continue without relying on chat memory.

## Risks
- Risk: some official platform capabilities, especially Supabase Realtime authorization, may change and need reevaluation before scale-up

## Clarifications
- Open question: the chosen stack is approved for the v1 pilot, not treated as irreversible for future scale phases

## Approval
- Status: approved
- Approved by: architecture baseline decision pass
- Date: 2026-04-04
