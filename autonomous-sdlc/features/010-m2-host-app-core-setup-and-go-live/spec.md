# Feature Spec: 010 M2 Host App Core Setup And Go Live

## Summary
Implement the first real host application milestone on the approved Expo, TypeScript, and Supabase stack. This phase delivers the host onboarding path, tracked `Digi` schema tables, permanent attendee-link setup, and the first go-live flow without drifting into later live-control or analytics work.

## Problem
The repo previously had only a host prototype and planning artifacts. There was no real host app scaffold, no tracked host-domain tables inside schema `Digi`, and no verified implementation path for signup, space setup, QR permanence, and go-live.

## Outcome
`M2` now has a working first implementation on the approved stack: the host object model is encoded in shared packages, the repo has tracked host-core tables and RPCs in Supabase, and the Expo host app supports onboarding, brand setup, space settings, QR handoff, and go-live confirmation.

## Users And Surfaces
- Primary users: hosts creating and operating their first live space
- Touched files or surfaces: `autonomous-sdlc/product/discovery/m2-host-app-core-setup-and-go-live.md`, feature workspace `010`, `apps/host-mobile`, `packages/`, `supabase/migrations/`, `tests/e2e/host-mobile-web.spec.ts`, and repo quality-gate tooling

## Scope
- In scope:
  - host account model and onboarding implementation
  - brand profile and space setup implementation
  - permanent QR and default session setup implementation
  - go-live confirmation flow and its first supporting data contracts
- Out of scope:
  - realtime live-panel controls from `M3`
  - analytics, team roles, imports, and admin tooling from later milestones
  - attendee app migration from static prototype to the approved web stack

## Acceptance Criteria
- [x] Criterion 1
- [x] Criterion 2
- [x] Criterion 3

Criterion detail:
- [x] The host object model for account, brand profile, space type, session duration, and QR permanence is explicit in shared TypeScript packages and Supabase contracts.
- [x] The repo has a working Expo host app scaffold, host auth path, and the first `Digi` schema tables and RPCs needed for onboarding and go-live setup.
- [x] `M2` scope stayed constrained to setup and go-live; live-control, analytics, and team features did not bleed into the first implementation pass.

## Risks
- Risk: production OTP delivery depends on real Supabase phone auth configuration outside the local demo-mode fallback
- Risk: host runtime now depends on the shared contracts and RPC signatures staying aligned with future attendee and live-control milestones

## Clarifications
- Resolved: session scheduling stays out of scope for this pass; the first flow uses immediate go-live with configurable duration only

## Approval
- Status: completed
- Approved by: repository owner via direct implementation instruction
- Date: 2026-04-05
