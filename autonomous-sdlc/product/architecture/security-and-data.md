# Security And Data

## Status
- Decision status: approved for v1 pilot
- Decision date: 2026-04-04

## Decisions To Lock
- Identity model for hosts:
  - Supabase Auth phone OTP
  - host JWTs used for app API and Realtime private channels
- Anonymous versus identified attendee handling:
  - anonymous spaces store aggregate behavior only
  - identified spaces capture only a display name plus a short-lived attendee reference
- PII storage boundaries:
  - host identity and business metadata in protected tables
  - attendee names only when the space mode requires it
  - no persistent attendee profile across sessions
- Session and token lifetimes:
  - host auth JWTs follow Supabase defaults with refresh on active sessions
  - attendee guest token is short-lived and scoped to one active session
- Secret management approach:
  - GitHub environments for CI secrets
  - Supabase project secrets for server logic
  - Vercel and Expo secret stores for runtime keys
- Logging and analytics redaction rules:
  - do not log OTP values, raw tokens, or destination app details after native share
  - keep Realtime payloads non-sensitive

## Required Safeguards
- No marketing-profile behavior for anonymous spaces
- Minimal attendee identity retention in identified spaces
- Clear separation between saved content handoff and app-owned storage
- Environment-specific secret handling
- Auditability for session start, end, and high-risk host actions

## Data Concerns
- source of truth for spaces and sessions:
  - Postgres tables owned by the backend layer
- event retention policy:
  - raw session events retained for operational analysis and support
  - attendee-linked identifiers anonymized or purged on a short retention window after the session where product operations no longer require them
- analytics aggregation strategy:
  - session-scoped raw events first, then roll up to space and account summaries
- deletion or archive expectations:
  - archived spaces remain queryable to hosts but are excluded from active QR flows
  - hard delete is restricted to privileged host workflows and later admin safeguards

## Access Model
- Hosts may read and mutate their own brands, spaces, sessions, and content subject to row-level rules.
- Attendees never receive direct table-wide access. They interact through bootstrap endpoints, scoped reads, and private Realtime channels.
- Privileged mutations such as starting sessions, ending sessions, or changing room visibility must go through server-controlled code paths.

## Realtime Security Position
- Use private channels for production.
- Use topic names scoped to `session:{session_id}` or narrower.
- Use RLS policies on `realtime.messages` to control receive, send, and presence access.
- Because Realtime Authorization is still public beta, avoid putting sensitive or long-lived data inside channel payloads.

## Abuse Controls
- Rate-limit OTP initiation, attendee bootstrap, and save-intent endpoints.
- Add bot detection only where public write endpoints justify it; do not force CAPTCHA-like friction into the QR path unless abuse proves it necessary.
- Keep JWT expiry windows short for attendee tokens and refresh them only while the session remains valid.

## Rule
Auth, personal data, uploads, and production credentials cannot move into implementation with only implied security behavior.
