# Implementation Plan: 009 Supabase Digi Schema Bootstrap

## Summary
Add the first tracked Supabase migration to the repo and validate whether the copied `.env` is enough to execute it against the hosted project. If the remote apply cannot be completed safely, leave the migration ready to run and document the missing credential path.

## Architecture
- Key approach: introduce a minimal `supabase/migrations/` path with one idempotent schema migration
- Why this shape: schema creation should be repeatable from source control, not done as an undocumented dashboard click
- Rejected alternative: claim the remote schema exists without a real SQL execution path

## Touched Areas
- Files: `.gitignore`, `supabase/README.md`, `supabase/migrations/20260404233500_create_digi_schema.sql`
- Docs: feature workspace `009`
- External dependencies: hosted Supabase project reachable from the current `.env`

## Research Notes
- Finding: the `.env` contains `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, and `SUPABASE_SERVICE_ROLE_KEY`
- Finding: the project REST API is reachable with the service role key
- Finding: the project does not expose a general SQL-execution RPC through PostgREST
- Finding: the service role key does not authenticate as a Postgres password for direct `psql` access

## Implementation Slices
1. Create the tracked Supabase migration path and the `"Digi"` schema SQL file.
2. Protect local environment files from Git.
3. Verify remote execution capability with the provided `.env` and record the result.

## Test And QA Plan
- Local checks: `bash autonomous-sdlc/scripts/check_feature.sh autonomous-sdlc/features/009-supabase-digi-schema-bootstrap`, `bash autonomous-sdlc/scripts/validate_repo.sh`
- Manual checks: inspect the migration SQL and confirm the remote credential test result is documented accurately

## Rollout And Rollback
- Rollout: apply the tracked migration once a direct Postgres connection string or Supabase management credential is available
- Rollback: drop schema `"Digi"` manually only if it was later created and found to be incorrect; do not delete the migration history silently

## Approval
- Status: approved
- Approved by: supabase bootstrap pass
- Date: 2026-04-04
