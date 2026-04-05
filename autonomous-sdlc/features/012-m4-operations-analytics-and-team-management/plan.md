# Implementation Plan: 012 M4 Operations, Analytics, And Team Management

## Summary
Implement M4 in three slices: shared operations contracts and tracked `Digi` storage first, host app operations screens and dashboard entry points second, and browser proof plus workflow evidence third. The canonical operational state lives in Supabase, while demo mode keeps the same shapes in AsyncStorage so the exported host build remains fully testable without a live mobile device.

## Architecture
- Key approach: add shared domain helpers for analytics snapshots, CSV validation, team state, and admin safeguards; extend schema `Digi` with team and import tables plus operational RPCs; then expose those capabilities through a new host `operations` route and dashboard entry point.
- Why this shape: it reuses the approved Expo plus Supabase stack, keeps the host app on one consistent context, and lets the same operations semantics work in both demo mode and the real database-backed path.
- Rejected alternative: add a second prototype-only HTML operations surface or keep `M4` as mock data without durable schema objects.

## Touched Areas
- Files: feature workspace `012`, `autonomous-sdlc/product/discovery/m4-operations-analytics-and-team-management.md`, `apps/host-mobile`, `packages/domain`, `packages/api-contracts`, `supabase/migrations/20260405033000_operations_analytics_team_management.sql`, `autonomous-sdlc/scripts/verify_supabase_schema.sh`, and `tests/e2e/host-mobile-web.spec.ts`
- Docs: milestone artifacts, `autonomous-sdlc/product/pilot/`, and `autonomous-sdlc/lessons.md`
- External dependencies: Expo Router, React Native web export, Supabase Postgres and RPCs, and Playwright

## Research Notes
- Finding: the existing session-event model from `M3` already provides enough canonical data to build pilot analytics without inventing a parallel tracking path.
- Finding: demo mode needs its own persisted operations state; otherwise the exported host app loses analytics history, invites, and imports between routes.
- Finding: the safest multi-space admin rule is to disable archive and delete until there is more than one space.

## Implementation Slices
1. Slice 1: completed. Added shared operations contracts, CSV validation helpers, demo operations state, `Digi` migration objects, and real RPCs for analytics, imports, brands, spaces, and team actions.
2. Slice 2: completed. Added the host `operations` route, dashboard entry point, context wiring, and UI for analytics, imports, team management, brands, and space administration.
3. Slice 3: completed. Added browser proof for the full operations workflow and extended schema verification to cover the new M4 objects.

## Test And QA Plan
- Local checks:
  - `npm run test:unit`
  - `npm run typecheck`
  - `npm run host:web:export`
  - `bash autonomous-sdlc/scripts/verify_supabase_schema.sh`
  - `npx playwright test tests/e2e/host-mobile-web.spec.ts`
- Manual checks:
  - verify the operations route shows the intended host information density and preserves the premium mobile-first direction
  - verify latest import status, team invites, and new spaces remain visible after route refresh in demo mode

## Rollout And Rollback
- Rollout: land the shared contracts and migration first, then the host app route, then the browser proof and milestone evidence
- Rollback: revert the M4 host route independently if needed, or roll back the M4 migration before later pilot docs and launch checks depend on it

## Approval
- Status: completed
- Approved by: repository owner via direct continue-the-flow instruction
- Date: 2026-04-05
