# Implementation Plan: 010 M2 Host App Core Setup And Go Live

## Summary
Use the approved architecture baseline to move from host prototype to real implementation. The work stays sequenced as data and auth contracts first, Expo host-app scaffold second, and host setup plus go-live flow third so the high-risk dependencies land before UI assembly.

## Architecture
- Key approach: build `apps/host-mobile` on Expo Router, back it with Supabase Auth and `Digi` schema tables, expose narrow authenticated RPCs from `public`, and keep shared contracts in repo packages rather than embedding business logic inside the screens
- Why this shape: it matches the approved split-surface architecture, keeps onboarding and session rules aligned with later milestones, and avoids direct client coupling to a custom schema
- Rejected alternative: continue the host journey inside `spaces_host.html` or start building live-control screens before the host account and space setup path exists

## Touched Areas
- Files: `autonomous-sdlc/product/discovery/m2-host-app-core-setup-and-go-live.md`, feature workspace `010`, `package.json`, `pnpm-workspace.yaml`, `tsconfig.json`, `vitest.config.ts`, `.github/workflows/repository-checks.yml`, `playwright.config.ts`
- App surfaces: `apps/host-mobile`, `packages/domain`, `packages/api-contracts`, `packages/design-tokens`
- Data surfaces: `supabase/migrations/20260405000500_host_core_bootstrap.sql`, `autonomous-sdlc/scripts/verify_supabase_schema.sh`
- Test surfaces: `packages/domain/tests/host.test.ts`, `tests/e2e/host-mobile-web.spec.ts`

## Research Notes
- Finding: the host route map already defines the sequence from `app-open` through `go-live-confirmation`; M2 implemented that sequence rather than inventing a new one
- Finding: the architecture baseline already separates canonical writes from realtime fanout, so M2 stayed focused on setup and go-live commands, not live sync
- Finding: the `Digi` schema already existed, which let host-core tables and RPCs stay fully tracked in migrations rather than ad hoc SQL
- Finding: direct custom-schema client access would add avoidable coupling; authenticated public RPCs are the safer first access surface for the mobile client
- Finding: exported web builds plus Playwright are the strongest practical end-to-end verification path here because emulator automation is not part of the repo yet

## Implementation Slices
1. Slice 1: completed. Added host-core tables, policies, RPCs, and shared domain contracts for account, brand profile, space, and default session settings.
2. Slice 2: completed. Scaffolded `apps/host-mobile` with Expo Router and implemented the onboarding path for phone entry, OTP verification, demo-mode fallback, and account setup.
3. Slice 3: completed. Implemented brand setup, space settings, QR screen, dashboard handoff, and go-live confirmation on top of the approved data model.

## Test And QA Plan
- Local checks:
  - `npm run test:unit`
  - `npm run typecheck`
  - `npm run host:web:export`
  - `bash autonomous-sdlc/scripts/verify_supabase_schema.sh`
  - `npx playwright test tests/e2e/host-mobile-web.spec.ts`
  - `npm run verify`
- Manual checks: validate the host journey against the route map and milestone exit criteria, and confirm the exported web flow covers onboarding, QR, dashboard, and go-live behavior

## Rollout And Rollback
- Rollout: land the host-core schema first, then the shared contracts, then the Expo app scaffold, and finally the flow screens and browser test coverage
- Rollback: revert the host app scaffold independently from the Supabase migration if needed, or roll back the host-core migration before later data is stored in those tables

## Approval
- Status: completed
- Approved by: repository owner via direct implementation instruction
- Date: 2026-04-05
