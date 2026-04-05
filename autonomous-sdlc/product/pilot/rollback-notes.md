# Rollback Notes

## Trigger Conditions
- Critical host onboarding failure
- Broken go-live flow
- Live-panel or attendee sync regression
- Operations screen regression that blocks admin use during the pilot
- Supabase migration issue that breaks canonical reads or writes

## Rollback Order
1. Stop new rollout activity on the branch or release candidate.
2. Identify the last known-good commit and the last applied Supabase migration.
3. Revert app or web changes first if the issue is UI-only.
4. Revert or compensate for the latest migration only if the failure is in schema or RPC behavior.
5. Re-run `npm run verify` and `bash autonomous-sdlc/scripts/verify_supabase_schema.sh`.

## Proof After Rollback
- Host onboarding works.
- QR and go-live work.
- Live panel and session summary work.
- Operations screen loads and destructive safeguards still behave correctly.
- Attendee overview still works from `spaces_final.html`.
