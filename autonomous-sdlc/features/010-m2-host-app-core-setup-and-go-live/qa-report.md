# QA Report: 010 M2 Host App Core Setup And Go Live

## Status
- Result: pass

## Checks Run
- Check: `npm run test:unit`
- Check: `npm run typecheck`
- Check: `npm run host:web:export`
- Check: `bash autonomous-sdlc/scripts/verify_supabase_schema.sh`
- Check: `npx playwright test tests/e2e/host-mobile-web.spec.ts`
- Check: `npm run verify`
- Check: manually reviewed the host flow coverage against the M2 route sequence from phone entry through go-live confirmation

## Evidence
- Evidence: `apps/host-mobile` now provides a working Expo Router host app with phone entry, OTP verification, onboarding, brand setup, space setup, QR handoff, dashboard, and go-live confirmation
- Evidence: `supabase/migrations/20260405000500_host_core_bootstrap.sql` creates tracked host-core tables, policies, triggers, and the authenticated RPCs used by the app
- Evidence: `packages/domain` now captures host account, brand, space, session, and routing contracts with passing unit tests
- Evidence: `tests/e2e/host-mobile-web.spec.ts` proves the exported host web flow works end to end in demo mode through the onboarding and go-live journey
- Evidence: full repo quality gates passed, including repo validation, unit tests, typecheck, host web export, Supabase schema verification, and Playwright smoke tests

## Defects
- Defect: none found in the verified M2 scope

## Residual Risks
- Risk: real phone OTP delivery depends on correct Supabase SMS configuration and is not exercised by the local demo-mode browser test path
- Risk: attendee and host surfaces now diverge in implementation maturity because the attendee experience is still a static prototype pending later migration to the approved web stack

## Signoff
- Reviewer: local verification pass
- Date: 2026-04-05
