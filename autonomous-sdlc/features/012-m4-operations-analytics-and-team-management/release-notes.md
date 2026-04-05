# Release Notes: 012 M4 Operations, Analytics, And Team Management

## Summary
Shipped the M4 operational layer. The host app now has a real operations route for analytics, CSV validation and import history, team invites and removals, and multi-brand or multi-space administration backed by tracked `Digi` schema objects and RPCs.

## Files And Surfaces
- File: `apps/host-mobile/app/operations.tsx`
- File: `apps/host-mobile/app/dashboard.tsx`
- File: `apps/host-mobile/src/host-app-context.tsx`
- File: `packages/domain/src/operations.ts`
- File: `packages/api-contracts/src/index.ts`
- File: `supabase/migrations/20260405033000_operations_analytics_team_management.sql`
- File: `autonomous-sdlc/scripts/verify_supabase_schema.sh`
- File: `tests/e2e/host-mobile-web.spec.ts`

## Verification Summary
- Evidence: unit tests, TypeScript, host web export, Supabase schema verification, and Playwright host export tests all passed.

## Rollout
- Step: apply the M4 migration, verify the schema, export the host web build, and run the host export Playwright tests.

## Rollback
- Step: revert the M4 host app route and related contracts if the issue is UI-only, or roll back the M4 migration if the failure is in operations schema or RPC behavior.

## Follow-ups
- Follow-up: connect validated import rows to a later canonical content-ingestion milestone.
- Follow-up: add true team-member acceptance and sign-in after pilot feedback confirms the role model.
