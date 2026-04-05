# Pilot Launch Checklist

## Product
- Confirm `M1` attendee entry, overview, save, expiry, offline, and ended states still pass browser verification.
- Confirm `M2` onboarding, QR, and go-live still pass in the exported host app.
- Confirm `M3` live panel, pinning, and session summary still pass end to end.
- Confirm `M4` analytics, CSV validation, team invites, brand creation, and space admin actions still pass end to end.

## Quality Gates
- Run `npm run verify`.
- Confirm `bash autonomous-sdlc/scripts/verify_supabase_schema.sh` passes against the target Supabase project.
- Review Playwright results for `tests/e2e/host-mobile-web.spec.ts`, `tests/e2e/pilot-readiness.spec.ts`, and `tests/e2e/prototypes.spec.ts`.

## Release Readiness
- Verify the branch is up to date and the working tree is clean.
- Capture screenshots or recordings for host onboarding, operations, live panel, and attendee overview.
- Review `autonomous-sdlc/lessons.md` and the current feature `qa-report.md` files for residual risks.
- Confirm support owner, rollback owner, and pilot metrics review owner are named before release.
