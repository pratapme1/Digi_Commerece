# System Overview

## Status
- Decision status: approved for v1 pilot
- Decision date: 2026-04-04

## Runtime Components
- `attendee-web`
  - Next.js PWA for QR entry, bootstrap, overview, search, save handoff, and live session states
- `host-flutter`
  - Flutter mobile app for onboarding, brand setup, scoped space editing, go-live controls, and later analytics
- `supabase-db`
  - source of truth for spaces, sessions, content cards, attendee records, and analytics events
- `supabase-auth`
  - host phone OTP and JWT issuance
- `supabase-storage`
  - logos, media assets, and structured content attachments if later introduced
- `supabase-edge-functions`
  - privileged commands such as `go_live`, `end_session`, `mint_attendee_session`, and webhook-style integrations
- `supabase-realtime`
  - private channels for presence, host pin notifications, and session-end broadcasts
- `observability`
  - Sentry plus platform-native logs and deployment records

## Architectural Questions
- Will the backend stay modular in one service first, or split by domain early?
  - Decision: one managed backend platform first; split later only if staging data proves a bottleneck
- Which capabilities must be synchronous API calls versus realtime events?
  - Decision: commands and canonical writes go through database or edge functions; ephemeral session changes are distributed via realtime channels
- Where do presence, pinning, save intents, and session timers live?
  - Decision: canonical session state lives in Postgres, while active room notifications and presence fan out through Realtime
- What is the minimal boundary between product logic and presentation layers?
  - Decision: shared domain contracts, event names, validation schemas, and analytics definitions live in shared packages; UI rendering stays app-specific

## Recommended Repo Shape
```text
apps/
  attendee-web/
  host-flutter/
packages/
  domain/
  api-contracts/
  design-tokens/
  analytics/
supabase/
  migrations/
  functions/
  seed/
```

## Domain Boundaries
- `identity`
  - host auth, host profile, role membership, OTP state
- `spaces`
  - brand profile, scoped space type, mode, QR identity, space settings
- `sessions`
  - live status, timers, active room metadata, attendee presence counts
- `content`
  - structured content cards, featured items, ordering, visibility
- `delivery`
  - attendee bootstrap payloads, search payloads, pin payloads, save handoff metadata
- `analytics`
  - event stream, rollups, summaries, operational dashboards

## Request And Event Flow
1. Attendee scans QR and opens the attendee PWA route for a space.
2. Attendee PWA calls a bootstrap endpoint to resolve the active session and, if the room is live, receives a short-lived guest token plus the space payload.
3. Host app authenticates through phone OTP and uses JWT-backed calls for space and session commands.
4. Privileged room commands such as `go_live`, `pin_item`, `hide_item`, `extend_session`, and `end_session` execute through Edge Functions or secured server paths and persist canonical state in Postgres.
5. Realtime channels broadcast low-latency room signals to subscribed attendees and host clients.
6. Analytics events write to Postgres as session-scoped events and are rolled up later for summaries and dashboards.

## Scope Rules
- Supported space types are `store`, `restaurant`, and `business_card`.
- Event, meeting, and generic catch-all types are removed from active product work and should not receive new UI or backend investment.

## Source Of Truth Rules
- Postgres is the source of truth for spaces, sessions, content, and analytics.
- Realtime carries transient room-state notifications; it does not replace canonical persistence.
- Save actions stop at the native share handoff. Spaces records the intent to save, not the destination app outcome.
- The attendee app stores only the current live-session cache needed for the room experience.

## Rule
This document must describe the real system to be built next, not just restate the prototype screens.
