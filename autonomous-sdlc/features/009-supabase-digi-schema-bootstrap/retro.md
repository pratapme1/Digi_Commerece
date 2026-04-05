# Retrospective: 009 Supabase Digi Schema Bootstrap

## What Worked
- Item: checking the actual credential scope prevented a false claim that the remote schema existed
- Item: introducing a tracked migration path now makes later database changes repeatable
- Item: retrying with `DATABASE_URL` narrowed the blocker from "missing execution path" to "wrong connection route"
- Item: switching to `DB_URL` provided the correct Supabase pooler route and let the migration apply cleanly

## What Did Not Work
- Item: the copied `.env` looked sufficient at first glance, but it did not include a direct database execution path
- Item: after the direct connection path was added, it still used the direct `db.<ref>.supabase.co:5432` route, which is the wrong choice for this environment

## Standards To Update
- Standard: treat Supabase REST keys and direct Postgres credentials as different capabilities; do not assume one implies the other
- Standard: protect `.env` files in the repo even if they are already ignored locally on one machine
- Standard: when a DB URL is added, test it immediately before treating remote migration work as unblocked
- Standard: when the direct Supabase host resolves only to IPv6, use the pooler connection string from the project Connect panel instead of `db.<project-ref>.supabase.co:5432`
- Standard: once a working pooler URL is confirmed, use it consistently for tracked migrations instead of keeping parallel broken and working connection variables

## Follow-up Actions
- Action: standardize the repo on the working pooler connection string and create the first `Digi` tables in a new migration
