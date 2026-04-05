# Phase Discovery: M3 Live Session Control And Presence

## Phase
- Name: M3 Live Session Control And Presence
- Owner: orchestrator
- Target milestone: `M3`

## Objective
- Add the live operating layer that turns a started session into an active room: presence, pinning, timer state, session-end reporting, and visible host-to-attendee sync.

## Inputs
- `spaces_prd.docx`
- `spaces_ux_guide.docx`
- `spaces_final.html`
- `spaces_host.html`
- `autonomous-sdlc/lessons.md`
- `autonomous-sdlc/product/foundation/route-map.md`
- `autonomous-sdlc/product/foundation/analytics-events.md`
- `autonomous-sdlc/product/architecture/system-overview.md`
- `autonomous-sdlc/product/architecture/adrs/003-v1-realtime-on-supabase.md`
- `apps/host-mobile/`
- `supabase/migrations/20260405000500_host_core_bootstrap.sql`

## Current-State Evidence
- `spaces_host.html` already defines the intended live-panel shape: attendee count, recent attendee feed, pin controls, and post-session summary expectations.
- `spaces_final.html` already defines the attendee live-state surfaces for pin notifications, expiry warnings, offline mode, and the session-ended overlay.
- `M2` now creates canonical live sessions in schema `Digi`, but the real host app still stops at dashboard and go-live confirmation.
- The approved architecture already assigns canonical session state to Postgres and low-latency room sync to a separate transient layer.
- There is still no tracked live-state table, no event rollup for session summaries, no host live-panel route, and no real proof that host actions mutate the attendee surface.

## Locked Decisions
- `M3` stays on the approved stack; no new architecture gate is needed unless the milestone forces a platform change.
- Canonical state for live sessions, pinning, and session-end summaries must be persisted in schema `Digi`.
- Presence and attendee engagement need a lightweight same-origin demo bridge for automated local proof, even while the full Supabase Realtime path matures.
- Session summary metrics must come from the same event stream that powers the host live panel.
- The milestone still excludes imports, longer-range analytics dashboards, and team-management work from later phases.

## Open Questions
- Whether the first live panel should expose only `pin`, `end`, and `refresh` or also `extend session` and `hide item`.
- Whether attendee presence should expire after a fixed heartbeat window or remain tied to explicit end-of-page events in the demo bridge.
- How much host-created sample content should exist in the real app before a dedicated content-editor milestone lands.

## Dependencies And Contracts
- Depends on `M2` host account, space, QR, and canonical live-session creation.
- Depends on M0 route states `live-panel` and `session-summary`.
- Depends on shared analytics event names for `presence_registered`, `featured_item_changed`, `content_saved`, and `session_ended`.
- Shares timer, pin, and end-of-session rules with the attendee surface.
- Requires new shared contracts for live metrics, presence rows, pin payloads, and session-summary snapshots.

## Risks
- Sync risk: if the host and attendee surfaces read different live-state sources, M3 will create conflicting room behavior instead of resolving it.
- Data risk: weak event semantics will make later analytics and summaries untrustworthy.
- Demo risk: local verification can look correct while the production realtime path remains underused, so the demo bridge must be explicitly labeled as verification scaffolding.
- Scope risk: a live panel can sprawl into content editing, announcements, or dashboard analytics if the milestone boundary is not enforced.

## Exit To Planning
- [x] Discovery evidence captured
- [x] Realtime and summary scope narrowed to M3
- [x] Shared contracts and storage gaps named
- [x] Scope is clear enough for `spec.md` and `plan.md`
