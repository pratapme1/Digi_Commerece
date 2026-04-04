# Supabase Bootstrap

This folder holds tracked database migrations for the production stack chosen in the architecture gate.

## Current Migration
- `supabase/migrations/20260404233500_create_digi_schema.sql`
  - creates the application schema `"Digi"`

## Apply Options
- With a direct Postgres connection string:
  - `psql "$SUPABASE_DB_URL" -f supabase/migrations/20260404233500_create_digi_schema.sql`
- With the Supabase CLI linked to the project:
  - `supabase db push`

## Important
- The current repo `.env` only contains the project URL plus `anon` and `service_role` keys.
- That is enough for REST access, but not enough to run arbitrary SQL remotely.
- To apply this migration to the cloud project, provide either a Postgres connection string or a Supabase access token plus linked CLI/project context.
