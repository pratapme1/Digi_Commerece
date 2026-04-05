#!/usr/bin/env bash
set -euo pipefail

root_dir="$(CDPATH= cd -- "$(dirname -- "$0")/../.." && pwd)"
cd "$root_dir"

db_url="${DB_URL:-}"

if [[ -z "$db_url" && -f .env ]]; then
  db_url="$(awk -F= '/^DB_URL=/{sub(/^[^=]*=/, "", $0); print $0}' .env | tail -n 1 | sed "s/^['\"]//; s/['\"]$//")"
fi

if [[ -z "$db_url" ]]; then
  echo "Skipping Supabase schema verification: DB_URL is not set."
  exit 0
fi

psql "$db_url" -v ON_ERROR_STOP=1 -At <<'SQL' >/tmp/digi-schema-check.txt
select 'schema:' || schema_name
from information_schema.schemata
where schema_name = 'Digi'
union all
select 'table:' || tablename
from pg_tables
where schemaname = 'Digi'
  and tablename in (
    'accounts',
    'brand_profiles',
    'spaces',
    'sessions',
    'session_live_state',
    'session_activity_events',
    'team_members',
    'team_invites',
    'catalog_import_jobs',
    'catalog_import_rows'
  )
union all
select 'function:' || proname
from pg_proc
where pronamespace = 'public'::regnamespace
  and proname in (
    'digi_get_host_setup',
    'digi_save_host_setup',
    'digi_go_live',
    'digi_get_live_panel',
    'digi_pin_live_content',
    'digi_end_live_session',
    'digi_get_session_summary',
    'digi_record_attendee_event',
    'digi_get_current_account_id',
    'digi_create_brand_profile',
    'digi_create_space',
    'digi_assign_space_brand',
    'digi_archive_space',
    'digi_delete_space',
    'digi_invite_team_member',
    'digi_remove_team_access',
    'digi_record_catalog_import',
    'digi_get_operations_snapshot'
  )
order by 1;
SQL

required_lines=(
  "schema:Digi"
  "table:accounts"
  "table:brand_profiles"
  "table:spaces"
  "table:sessions"
  "table:session_live_state"
  "table:session_activity_events"
  "table:team_members"
  "table:team_invites"
  "table:catalog_import_jobs"
  "table:catalog_import_rows"
  "function:digi_get_host_setup"
  "function:digi_save_host_setup"
  "function:digi_go_live"
  "function:digi_get_live_panel"
  "function:digi_pin_live_content"
  "function:digi_end_live_session"
  "function:digi_get_session_summary"
  "function:digi_record_attendee_event"
  "function:digi_get_current_account_id"
  "function:digi_create_brand_profile"
  "function:digi_create_space"
  "function:digi_assign_space_brand"
  "function:digi_archive_space"
  "function:digi_delete_space"
  "function:digi_invite_team_member"
  "function:digi_remove_team_access"
  "function:digi_record_catalog_import"
  "function:digi_get_operations_snapshot"
)

for expected in "${required_lines[@]}"; do
  if ! grep -Fxq "$expected" /tmp/digi-schema-check.txt; then
    echo "Missing expected database object: $expected" >&2
    cat /tmp/digi-schema-check.txt >&2
    exit 1
  fi
done

echo "Supabase schema verification passed."
