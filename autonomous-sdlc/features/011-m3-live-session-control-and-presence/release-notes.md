# Release Notes: 011 M3 Live Session Control And Presence

## Summary
Shipped the M3 live operating layer. The repo now has tracked live-session state and summary RPCs in Supabase, a real host live panel and session summary in the Expo host app, and a same-origin attendee demo sync path that proves host pin and session-end behavior across surfaces.

## Files And Surfaces
- File: `apps/host-mobile/app/live-panel.tsx`
- File: `apps/host-mobile/app/session-summary.tsx`
- File: `apps/host-mobile/src/host-app-context.tsx`
- File: `packages/domain/src/live-room.ts`
- File: `packages/api-contracts/src/index.ts`
- File: `supabase/migrations/20260405013000_live_session_control.sql`
- File: `spaces_final.html`
- File: `tests/e2e/host-mobile-web.spec.ts`

## Verification Summary
- Evidence: `npm run verify` passed with repo validation, Vitest, typecheck, host export, Supabase schema verification, and Playwright coverage
- Evidence: `npx playwright test tests/e2e/host-mobile-web.spec.ts` passed with the full host-plus-attendee live room flow
- Evidence: `bash autonomous-sdlc/scripts/verify_supabase_schema.sh` confirmed the new live-state tables and RPCs exist remotely

## Rollout
- Step: use the host live panel and session summary as the baseline for later attendee-web and analytics work instead of extending the prototype-only live controls

## Rollback
- Step: revert the host live-panel and session-summary screens independently if the UI needs redesign
- Step: roll back `20260405013000_live_session_control.sql` before dependent analytics or attendee-web work lands if the live-state contract needs redesign

## Follow-ups
- Follow-up: start `M4` discovery for operations, analytics, and team management
- Follow-up: plan the attendee-web migration so the production surface can consume the new remote attendee-event contracts directly
