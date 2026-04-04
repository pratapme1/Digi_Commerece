# Backlog

Use this backlog with the milestone order in `milestones.md`. Discovery items come first in every major phase.

## M0 Product Foundation
- [P0][Discovery] Confirm the shared domain model for brand profiles, spaces, sessions, content cards, attendee records, and analytics events.
- [P0][Discovery] Compare the PRD, UX guide, and current prototypes to produce a gap map for missing states and missing host flows.
- [P0][Build] Define attendee route states from QR scan through session expiry.
- [P0][Build] Define host route states from onboarding through session summary.
- [P1][Build] Define initial API and websocket contracts for presence, pinning, saves, and analytics events.
- [P1][Build] Define the import schema and validation rules for catalogue uploads.

## M1 Attendee PWA Core Experience
- [P0][Discovery] Validate QR entry, identified versus anonymous rules, local caching, and expiry behavior against the UX guide.
- [P0][Build] Implement the attendee entry screen with space identity, verification, and live status.
- [P0][Build] Implement identified name capture with skip behavior and host visibility rules.
- [P0][Build] Implement multi-format overview with preset item, grouped collections, and search entry.
- [P0][Build] Implement active search results grouped by content type from local cache.
- [P0][Build] Implement loading skeleton, empty-space state, expiry warning, and expired-session overlay.
- [P1][Build] Implement attendee save and share flows that respect the no-lock-in product rule.
- [P1][Build] Instrument scans, entry, search, view, and save events.

## M1A Architecture And Delivery Baseline
- [P0][Discovery] Compare the current prototype stack against the real product shape and identify which technical decisions are still missing.
- [P0][Build] Lock the attendee, host, backend, database, auth, and realtime stack choices.
- [P0][Build] Define system boundaries, data ownership, and cross-surface integration points.
- [P0][Build] Define environments, secrets handling, observability, and infrastructure topology.
- [P0][Build] Define CI/CD, deployment, rollback, and release evidence requirements.
- [P1][Build] Record major architecture decisions as ADRs.

## M2 Host App Core Setup And Go Live
- [P0][Discovery] Validate the host object model for account, brand profile, space type, session duration, and QR permanence.
- [P0][Build] Implement onboarding steps for phone number, OTP, business name, and space type.
- [P0][Build] Implement business verification prompts and badge rules.
- [P0][Build] Implement brand setup with live preview and locked font choices.
- [P0][Build] Implement space settings for identified or anonymous mode and default session duration.
- [P0][Build] Implement the QR code screen with download and copy actions.
- [P0][Build] Implement go-live confirmation with duration selection and mode reminder.
- [P1][Build] Implement session scheduling and reminders.

## M3 Live Session Control And Presence
- [P0][Discovery] Define realtime events, latency targets, and failure behavior for attendee presence and host pinning.
- [P0][Build] Implement live attendee counts and recent attendee feed in the host surface.
- [P0][Build] Implement host pin controls and attendee pin notifications.
- [P0][Build] Implement session timer and live-state transitions across both surfaces.
- [P1][Build] Implement session summary with top content, saves, and shareable snapshot.
- [P1][Build] Instrument session-level analytics for views, saves, and peak activity.

## M4 Operations, Analytics, And Team Management
- [P0][Discovery] Validate analytics definitions, admin permissions, and bulk import edge cases before UI work starts.
- [P0][Build] Implement bulk Excel or CSV import with row-level validation and template download.
- [P0][Build] Implement analytics dashboards with 7-day, 30-day, and all-time filters.
- [P1][Build] Implement team invites, roles, pending invites, and removal safeguards.
- [P1][Build] Implement space archive, delete, and brand profile assignment flows.
- [P1][Build] Implement multi-brand support where space-level branding differs from account-level defaults.

## M5 Launch Hardening And Pilot Readiness
- [P0][Discovery] Identify critical pilot journeys, failure states, and release blockers that still require automated evidence.
- [P0][Build] Add end-to-end coverage for the core attendee and host journeys.
- [P0][Build] Add performance checks for QR entry, first render, and live session transitions.
- [P1][Build] Create pilot launch checklists, rollback notes, and support runbooks.
- [P1][Build] Review backlog after pilot feedback and reprioritize milestone follow-up work.
