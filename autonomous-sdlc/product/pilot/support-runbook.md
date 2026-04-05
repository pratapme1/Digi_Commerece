# Support Runbook

## First Triage
- Identify whether the issue is on `host-mobile`, attendee prototype, or Supabase backend state.
- Check whether the report is about onboarding, go-live, live session control, operations tooling, or launch readiness evidence.
- Reproduce the issue in the exported host web build first when possible, because that is the repo’s automated proof surface.

## Fast Checks
- Run `npm run verify`.
- Run `bash autonomous-sdlc/scripts/verify_supabase_schema.sh`.
- Confirm the affected feature workspace has current `qa-report.md`, `release-notes.md`, and `retro.md`.
- For attendee sync issues, rerun `tests/e2e/host-mobile-web.spec.ts` and verify the same browser context still shares room state.

## Escalation
- If schema or RPC behavior changed, inspect the latest file in `supabase/migrations/`.
- If only the UI changed, inspect the matching route in `apps/host-mobile/app/` or `spaces_final.html`.
- Record confirmed fixes and new recurring failure patterns in `autonomous-sdlc/lessons.md`.
