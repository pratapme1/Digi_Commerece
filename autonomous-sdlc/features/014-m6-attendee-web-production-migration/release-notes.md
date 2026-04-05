# Release Notes: 014 M6 Attendee Web Production Migration

## Summary
Replaced the attendee HTML prototype as the canonical runtime with a real Next.js attendee app in `apps/attendee-web/`. The host app now opens the real `/s/[qrSlug]` route, the attendee app reads room state from Supabase through public RPCs, and the local demo path uses a cross-origin `postMessage` bridge so host-to-attendee browser tests remain repeatable.

## Files And Surfaces
- File: `apps/attendee-web/*`
- File: `apps/host-mobile/app/live-panel.tsx`
- File: `apps/host-mobile/app/qr.tsx`
- File: `apps/host-mobile/src/host-app-context.tsx`
- File: `apps/host-mobile/src/lib/attendee-link.ts`
- File: `packages/domain/src/attendee.ts`
- File: `packages/domain/src/demo-bridge.ts`
- File: `packages/api-contracts/src/index.ts`
- File: `supabase/migrations/20260405050000_attendee_web_bootstrap.sql`
- File: `tests/e2e/attendee-web.spec.ts`
- File: `tests/e2e/host-mobile-web.spec.ts`

## Verification Summary
- Evidence: `npm run verify` passed end to end after the new app, RPCs, host integration, and browser coverage were added.

## Rollout
- Step: deploy the Next.js attendee app and expose its base URL through `EXPO_PUBLIC_ATTENDEE_BASE_URL` for host environments outside local dev.
- Step: keep the HTML prototypes only as design references and not as the canonical attendee runtime.

## Rollback
- Step: point the host attendee base URL back to the prior prototype path and remove the attendee app from the verification scripts if the production route regresses.
- Step: revert `20260405050000_attendee_web_bootstrap.sql` only if the public attendee RPCs must be withdrawn.

## Follow-ups
- Follow-up: replace the current preset attendee content library with host-managed content rows once imports and publishing are wired into the live space model.
