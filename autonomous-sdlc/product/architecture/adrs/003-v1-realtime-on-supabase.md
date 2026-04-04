# ADR 003: Use Supabase Realtime For V1 Live Session Sync

## Status
- Accepted with watchpoints
- Date: 2026-04-04

## Context
The product requires live attendee presence, host pin notifications, expiry signaling, and session-end fanout. The team needs realtime capability early, but the platform should stay simple enough for a v1 pilot.

## Decision
- Use Supabase Realtime private channels for v1.
- Use Broadcast for low-latency room signals.
- Use Presence for attendee state and count tracking.
- Keep canonical session state in Postgres.
- Reevaluate after staging if authorization latency, join rates, or scaling behavior become a concern.

## Why
- Supabase Realtime already fits the rest of the chosen backend platform.
- Official docs recommend private channels for production.
- This keeps the initial system smaller than introducing a second dedicated realtime platform immediately.

## Watchpoints
- Realtime Authorization is still public beta.
- Increased RLS complexity can affect connection latency.
- Payloads must stay non-sensitive and session-scoped.

## Mitigations
- use private channels only
- keep JWT expiry short
- keep room payloads minimal
- instrument join success rate and command-to-fanout latency
- name a migration path to a dedicated session coordinator if needed

## Alternatives Considered
- Dedicated realtime coordination on day one
- Polling for live room updates
- Public channels without authorization
