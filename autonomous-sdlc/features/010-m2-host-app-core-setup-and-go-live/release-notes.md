# Release Notes: 010 M2 Host App Core Setup And Go Live

## Summary
Shipped the first real host application milestone on the approved stack. The repo now has a working Expo host app, tracked host-core Supabase migrations in schema `Digi`, shared host-domain packages, and end-to-end browser verification for onboarding through go-live.

## Files And Surfaces
- File: `apps/host-mobile`
- File: `packages/domain`
- File: `packages/api-contracts`
- File: `packages/design-tokens`
- File: `supabase/migrations/20260405000500_host_core_bootstrap.sql`
- File: `tests/e2e/host-mobile-web.spec.ts`
- File: repo toolchain and quality-gate files needed for pnpm, TypeScript, Vitest, Expo export, and Supabase verification

## Verification Summary
- Evidence: `npm run verify` passed, including repo validation, unit tests, typecheck, exported-host build, Supabase schema verification, and Playwright smoke coverage
- Evidence: `npx playwright test tests/e2e/host-mobile-web.spec.ts` passed against the exported host web app
- Evidence: `bash autonomous-sdlc/scripts/verify_supabase_schema.sh` confirmed required schema objects exist remotely

## Rollout
- Step: use the new host app scaffold as the implementation baseline for the next milestone rather than extending `spaces_host.html`

## Rollback
- Step: revert the host app and shared package changes independently if UI work must be backed out
- Step: roll back the host-core migration before dependent production data accumulates if the schema shape must be redesigned

## Follow-ups
- Follow-up: start `M3` discovery for live session control on top of the new host-core contracts
- Follow-up: plan the attendee web migration onto the approved stack so both surfaces share the same runtime foundations
