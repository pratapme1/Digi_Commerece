# Release Notes: 015 M7 Canonical Attendee Content And Host Integration

## Summary
Canonical space content is now the shared source of truth across Supabase, the host app, and the attendee app. Accepted catalog imports are promoted into canonical content entries, host pin controls use that catalog, and the attendee route renders the same data for overview, search, and detail states with seed data only as fallback.

## Files And Surfaces
- File: `packages/domain/src/content-catalog.ts`
- File: `packages/api-contracts/src/index.ts`
- File: `apps/host-mobile/src/host-app-context.tsx`
- File: `apps/host-mobile/src/lib/host-service.ts`
- File: `apps/host-mobile/src/lib/content-catalog-bridge.ts`
- File: `apps/host-mobile/app/live-panel.tsx`
- File: `apps/attendee-web/src/lib/attendee-service.ts`
- File: `apps/attendee-web/src/components/attendee-space.tsx`
- File: `supabase/migrations/20260405110000_canonical_space_content.sql`
- File: `tests/e2e/host-mobile-web.spec.ts`
- File: `tests/e2e/pilot-readiness.spec.ts`

## Verification Summary
- Evidence: `npm run verify` passed after the canonical content bridge and E2E expectations were updated.
- Evidence: host-mobile web export, attendee production build, Supabase schema verification, and full Playwright coverage are green.

## Rollout
- Step: apply the canonical content migration, refresh host content catalogs on setup/import, and export the current host web bundle before browser E2E.

## Rollback
- Step: revert `20260405110000_canonical_space_content.sql` and restore host/attendee content reads to the preset-only path.

## Follow-ups
- Follow-up: leave OTP automation out of scope until the live auth configuration is ready.
