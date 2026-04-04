# Release Notes: 009 Supabase Digi Schema Bootstrap

## Summary
Added the first tracked Supabase migration path and created schema `"Digi"` in the hosted Supabase project using the working `DB_URL` pooler connection. Also protected local `.env` files from Git and documented why the direct-host `DATABASE_URL` path failed in this environment.

## Files And Surfaces
- File: `.gitignore`
- File: `supabase/README.md`
- File: `supabase/migrations/20260404233500_create_digi_schema.sql`
- File: feature workspace `009`

## Verification Summary
- Evidence: migration file exists and is valid SQL for schema creation
- Evidence: remote PostgREST access works with the service role key
- Evidence: `psql "$DB_URL" -f supabase/migrations/20260404233500_create_digi_schema.sql` returned `CREATE SCHEMA` and `COMMENT`
- Evidence: `select schema_name from information_schema.schemata where schema_name = 'Digi';` returned `Digi`

## Rollout
- Step: use `DB_URL` for follow-up tracked migrations until the generic database connection variable is standardized on the same pooler route

## Rollback
- Step: create a follow-up migration if the schema needs structural changes; do not rewrite the applied migration

## Follow-ups
- Follow-up: align `DATABASE_URL` with the same working pooler route as `DB_URL`
- Follow-up: create the first tables inside schema `"Digi"` in a new migration after the remote access path is available
