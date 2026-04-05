# Infrastructure And Environments

## Status
- Decision status: approved for v1 pilot
- Decision date: 2026-04-04

## Environments To Define
- local
- shared development
- staging
- production

## Decisions To Lock
- cloud or hosting target:
  - attendee web on Vercel
  - host mobile through Expo EAS services
  - managed Supabase project per cloud environment
- compute model:
  - Next.js web app on Vercel
  - Supabase managed Postgres and Edge Functions
- database hosting model:
  - dedicated Supabase projects for dev, staging, and production
- cache or queue requirements:
  - attendee search stays local to the current session cache in v1
  - no separate queue service in v1 unless staging proves the need
- domain and DNS plan:
  - attendee PWA on a dedicated app subdomain
  - environment-specific domains for staging and previews
- environment variable and secret distribution:
  - GitHub environment secrets for CI
  - Vercel project env vars for attendee web
  - Expo secrets and EAS env configuration for host app
  - Supabase secrets for functions and auth integrations
- observability stack for logs, metrics, and alerts:
  - Sentry for client and server app errors
  - Vercel, Supabase, and EAS logs for platform operations

## Delivery Requirements
- staging must be close enough to production to validate live-session behavior
- production releases must support rollback without manual scrambling
- environment setup must be reproducible from repo docs, not tribal knowledge

## Environment Model
### Local
- `pnpm` workspace install
- Next.js local dev server for attendee
- Expo development build for host
- Supabase local stack via CLI and Docker-compatible runtime

### Shared Development
- long-lived cloud environment for integration work
- non-production Supabase project
- optional internal Vercel deployment and Expo preview channel

### Staging
- production-like Supabase project with staging secrets
- attendee staging deployment
- internal-distribution mobile builds from EAS
- used for end-to-end validation of live room behavior and migrations

### Production
- protected Vercel project and custom attendee domain
- production Supabase project
- app store builds plus EAS Update production channel for host app

## Operational Questions
- How are migrations applied?
  - checked into the repo and promoted through environments with the Supabase CLI
- How are failed deploys detected and reversed?
  - attendee web through Vercel deployment history and rollback
  - host JS-only updates through EAS Update channel control
  - host native regressions through binary rollback or hotfix build
- What metrics show a broken QR entry or live session?
  - QR open to bootstrap success rate
  - channel join success rate
  - live command to attendee update latency
  - save-intent rate and error rate
- What manual runbooks are required before pilot launch?
  - rollback checklist
  - OTP provider incident fallback
  - Supabase outage or degraded-mode procedure
  - attendee web incident response for QR entry failures
