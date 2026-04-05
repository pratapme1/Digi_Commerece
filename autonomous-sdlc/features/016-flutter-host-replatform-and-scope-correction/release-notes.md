# Release Notes: 016 Flutter Host Replatform And Scope Correction

## Summary
Replatformed the active host product to Flutter, narrowed the product scope to `business_card`, `store`, and `restaurant`, and rewired repo verification to treat the Flutter host and Next.js attendee app as the real product surfaces.

## Files And Surfaces
- File: `apps/host-flutter`
- File: `apps/attendee-web`
- File: `packages/domain`
- File: `supabase/migrations/20260405152000_reduce_space_types_to_business_card_store_restaurant.sql`
- File: `tests/e2e/host-flutter-web.spec.ts`
- File: `tests/e2e/pilot-readiness.spec.ts`
- File: `playwright.config.ts`
- File: `package.json`

## Verification Summary
- Evidence: `npm run verify` passed on 2026-04-05 including Vitest, Flutter widget tests, TypeScript, attendee production build, Flutter host web export, Supabase schema verification, and 6 Playwright tests.

## Rollout
- Step: treat `apps/host-flutter` as the canonical host app for Android and iOS delivery
- Step: use the narrowed `business_card`, `store`, and `restaurant` scope in new backend and UI work

## Rollback
- Step: the old Expo host app remains as a local fallback until a later cleanup milestone removes it

## Follow-ups
- Follow-up: remove inactive Expo host files once the team decides the rollback window is closed
- Follow-up: add native-device Flutter integration coverage beyond the current web-export browser path when emulator automation is introduced
