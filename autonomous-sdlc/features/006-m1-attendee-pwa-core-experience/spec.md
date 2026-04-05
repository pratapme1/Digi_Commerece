# Feature Spec: 006 M1 Attendee PWA Core Experience

## Summary
Start the attendee milestone by defining the complete attendee journey that should be implemented next. This phase covers entry from QR scan through content browsing and session end, with the missing states, search behavior, save flow, and analytics expectations grounded in the PRD, UX guide, and M0 foundation package.

## Problem
The attendee prototype currently shows high-quality content renderings, but it does not yet behave like the real Spaces attendee experience. The crucial journey states are missing: QR entry, identified-name capture, mixed-format overview, active search, host pin notifications, loading and empty states, expiry handling, and ended-session behavior.

## Outcome
The next implementation pass should have a fully scoped and testable attendee phase plan so later coding can build one coherent attendee journey instead of isolated screens. When M1 is eventually implemented, an attendee should be able to scan, enter, browse, search, save, and exit a session without ambiguity.

## Users And Surfaces
- Primary users: attendees entering a live space through QR, hosts indirectly affected by attendee entry and engagement behavior
- Touched files or surfaces: `spaces_final.html`, Playwright attendee coverage, `autonomous-sdlc/product/discovery/`, feature workspace `006`

## Scope
- In scope:
  - attendee QR-entry and first-screen flow
  - identified versus anonymous entry behavior
  - multi-format overview and active search behavior
  - loading, empty, expiry, offline, and ended-session states
  - save/share behavior and attendee analytics expectations
- Out of scope:
  - host onboarding, brand setup, QR management, and dashboard work
  - backend infrastructure or deployment design
  - full host-side realtime control implementation beyond attendee-facing contracts

## Acceptance Criteria
- [x] The attendee surface opens with a branded entry flow that handles live, inactive, and ended-session states without generic browser errors.
- [x] Identified and anonymous spaces diverge correctly at entry, and the attendee can reach a searchable multi-format overview from the approved route flow.
- [x] The attendee experience includes the mandatory loading, empty, expiry, ended, save, offline, and pin-notification states, and the required attendee analytics events are implemented in the prototype event log.

## Risks
- Risk: M1 may become too broad if live-event behavior expands beyond the attendee-side obligations needed for this phase
- Risk: PWA performance and offline behaviors may need staged implementation if the repo stays prototype-first for another phase

## Clarifications
- Open question: whether the first coding pass should keep M1 in the current single-file attendee prototype or begin a deliberate split into app-oriented files

## Approval
- Status: approved
- Approved by: local M1 discovery pass
- Date: 2026-04-04
