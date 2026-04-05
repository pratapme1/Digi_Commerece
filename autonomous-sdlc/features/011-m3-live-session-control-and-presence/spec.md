# Feature Spec: 011 M3 Live Session Control And Presence

## Summary
Add the first real live operating layer on top of the M2 host baseline. This phase gives the host a live-panel screen with attendee presence, pin controls, session timer, and a session summary, while the attendee surface gains an actual same-session sync path for pin and end-state updates during local verification.

## Problem
The repo can start a live session, but once a session is live there is no operating layer. The host app has no real live panel or summary, and the attendee surface only shows isolated live-state demos instead of responding to host actions from the real app flow.

## Outcome
Hosts can enter a live panel, see current room metrics, pin a featured item, end the session, and review a summary. The attendee surface reacts to the live pin and end-session state from the same room source during local browser verification.

## Users And Surfaces
- Primary users: hosts running an active live space, attendees inside that live room
- Touched files or surfaces: `autonomous-sdlc/product/discovery/m3-live-session-control-and-presence.md`, feature workspace `011`, `apps/host-mobile`, `packages/`, `supabase/migrations/`, `spaces_final.html`, and Playwright browser coverage

## Scope
- In scope:
  - live-panel metrics and presence feed in the host app
  - host pin controls and attendee pin notifications
  - session timer, session end, and post-session summary
  - tracked live-event persistence and summary rollups in schema `Digi`
  - same-origin demo sync path for host and attendee browser verification
- Out of scope:
  - bulk imports, longer-range analytics dashboards, and team management from later milestones
  - full attendee migration from the static prototype to the approved Next.js stack
  - production-grade realtime authorization hardening beyond the approved v1 contract direction

## Acceptance Criteria
- [x] Criterion 1
- [x] Criterion 2
- [x] Criterion 3

Criterion detail:
- [x] The host app exposes a live-panel route with timer, attendee count, recent attendee feed, featured-item pinning, and session end or summary access.
- [x] Session metrics and summary data are persisted through tracked schema objects and RPCs in `Digi`, not only as UI-only state.
- [x] The attendee surface responds to host-driven pin and session-end changes during automated browser verification from the same room source.

## Risks
- Risk: local demo sync can mask gaps in the later production realtime path if it is not clearly separated from canonical persistence
- Risk: summary metrics may be misleading if event semantics are inconsistent between host and attendee actions

## Clarifications
- Resolved: `extend session` stays out of scope for this pass; M3 now covers room operation, pinning, end-session, and summary only

## Approval
- Status: completed
- Approved by: repository owner via direct continue-the-flow instruction
- Date: 2026-04-05
