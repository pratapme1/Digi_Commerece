# Phase Discovery: M0 Product Foundation

## Phase
- Name: M0 Product Foundation
- Owner: orchestrator
- Target milestone: `M0`

## Objective
- Define the shared product model and state rules that all later attendee, host, and live-session work will depend on.

## Inputs
- `spaces_prd.docx`
- `spaces_ux_guide.docx`
- `spaces_final.html`
- `spaces_host.html`
- `autonomous-sdlc/lessons.md`
- `autonomous-sdlc/features/004-implementation-planning-and-roadmap/`

## Current-State Evidence
- The attendee prototype already proves core rendering patterns such as business cards, menus, and content-led browsing, but it does not cover mandatory entry, expiry, empty, and live-update states.
- The host prototype already shows the dashboard, editor, and live panel direction, but it does not cover onboarding, brand setup, QR operations, analytics, team management, or settings.
- The PRD locks the v1 platform shape: host native app, attendee PWA, QR trigger, fixed card types, brand as skin, live sessions, identified versus anonymous spaces, and share-sheet saves.
- The UX guide confirms that no new mockups are required; the missing screens and edge cases are already specified in writing.
- The repo does not yet contain shared product contracts for entities, logical routes, session lifecycle, or analytics events.

## Locked Decisions
- Host experience is native mobile, not browser-first.
- Attendee experience is QR-triggered PWA, not a downloadable app.
- QR is the only v1 trigger mechanism.
- Content is structured into fixed card types, not a free-form template builder.
- Sessions are live and ephemeral by default.
- Spaces can be identified or anonymous, chosen by the host.
- Save flows use the phone's native share sheet; attendee accounts are out of scope for v1.
- Bulk catalogue input is Excel or CSV plus JSON API, not direct ERP or POS integrations.

## Open Questions
- Final engineering stack and deployment topology are still undecided.
- The exact permanent URL pattern for space QR codes is not yet defined.
- The attendee identity model for repeat scans within the same session still needs an implementation decision.
- The boundary between a pinned item, highlighted announcement, and regular live content update needs one shared event contract.
- Media-hosting rules for imported catalogue assets need to be finalized before implementation.

## Dependencies And Contracts
- Host mobile app flows: onboarding, space setup, live controls, and summary.
- Attendee PWA flows: QR entry, identification, browsing, save, and expiry behavior.
- Shared session layer: presence, pinning, content visibility, announcements, and end-of-session behavior.
- Import layer: Excel or CSV validation plus JSON-equivalent schema.
- Trust layer: verification status and badge display rules.
- Analytics layer: event naming, anonymous versus identified handling, and session-level rollups.

## Risks
- Delivery risk: later milestones will rework each other if M0 contracts remain implicit.
- UX risk: the current prototypes may be mistaken for complete flows even though the UX guide marks many missing mandatory states.
- Data or analytics risk: weak event definitions can break anonymity promises or make session summaries untrustworthy.

## Exit To Planning
- [x] Discovery evidence captured
- [x] Open questions reduced to acceptable risk
- [x] Touched surfaces and dependencies named
- [x] Acceptance direction is clear enough for `spec.md` and `plan.md`
