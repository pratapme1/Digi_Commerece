# Milestones

## Phase Pattern
Every major phase follows the same order:
1. Discovery brief
2. Architecture gate when the phase affects stack, system design, infrastructure, security, or deployment
3. Spec and plan approval
4. Implementation slices
5. Verification and repair
6. Release notes, retrospective, and backlog refresh

## M0 Product Foundation
### Objective
Create the shared product model and delivery rules that every later milestone depends on.

### Discovery Focus
- Confirm the core entities: brand profile, space, session, content card, attendee record, and analytics event.
- Map where the current prototypes already align with the PRD and where the UX guide adds missing states.
- Identify which behaviors require shared contracts across host and attendee surfaces.

### Delivery Scope
- Shared information architecture and route map
- Session lifecycle and live-state rules
- Event dictionary for analytics, saves, scans, and presence
- Phase-level discovery, milestone, and backlog artifacts

### Exit Criteria
- Shared product model is documented
- Milestones and backlog are prioritized
- Cross-surface dependencies are named before coding begins

## M1 Attendee PWA Core Experience
### Objective
Ship the complete attendee entry and browsing flow for a live space.

### Discovery Focus
- QR entry behavior, identified versus anonymous flows, local cache expectations, and session expiry rules
- Missing attendee states already called out in the UX guide

### Delivery Scope
- Entry screen and identified name capture
- Multi-format overview and instant search
- Pin notifications, empty state, loading skeleton, expiry warning, and expired state
- Save and share behavior that matches the product rules

### Exit Criteria
- Attendee can scan, enter, browse, and save without ambiguity
- All required attendee edge states exist
- Core attendee events are instrumented

## M1A Architecture And Delivery Baseline
### Objective
Lock the technical shape required for real application development after the prototype milestones.

### Discovery Focus
- frontend, mobile, backend, database, auth, realtime, and hosting options
- security, environments, CI/CD, deployment, and rollback expectations
- which parts of the current prototype stack are temporary scaffolding versus durable choices

### Delivery Scope
- production stack decision
- system overview and service boundaries
- security and data handling rules
- infrastructure and environment model
- deployment, release, and rollback model
- ADR trail for major technical decisions

### Exit Criteria
- stack and architecture decisions are documented
- environments and release model are explicit
- later milestones can implement against approved technical constraints instead of guessing them

## M2 Host App Core Setup And Go Live
### Objective
Let a host create an account, configure a space, and start a live session.

### Discovery Focus
- Host onboarding shape, brand setup constraints, QR permanence, and draft-to-live transitions
- Which host actions need immediate attendee-facing effects

### Delivery Scope
- Onboarding and verification prompts
- Brand setup and space settings
- Space editor, QR code screen, and go-live confirmation
- Scheduling and default session settings

### Exit Criteria
- A host can go from signup to a live space without manual support
- QR and session setup rules are stable
- Brand and mode settings flow into the attendee experience correctly

## M3 Live Session Control And Presence
### Objective
Add the live operating layer that makes Spaces feel active rather than static.

### Discovery Focus
- Realtime event model, attendee presence semantics, pinning behavior, and session-end reporting
- Operational risk around websocket delivery and fallback behavior

### Delivery Scope
- Live attendee feed and presence counts
- Host pin controls and attendee pin notifications
- Session timer, live indicators, and session summary
- Save-rate, top-content, and attendee summary metrics

### Exit Criteria
- Host and attendee live states stay in sync
- Session-end reporting is trustworthy
- Realtime failure behavior is defined, not implied

## M4 Operations, Analytics, And Team Management
### Objective
Support business use beyond a single host on a single manual space.

### Discovery Focus
- Bulk import contract, analytics aggregation rules, role boundaries, and verification display rules
- Admin workflows that are absent from the current prototypes

### Delivery Scope
- Bulk Excel or CSV import with validation
- Analytics screen and date filters
- Team management and role enforcement
- Space settings, archive, delete, and multi-brand support

### Exit Criteria
- Teams can operate the product without shared device workarounds
- Imports and analytics are reliable enough for pilot customers
- Admin actions have clear safeguards

## M5 Launch Hardening And Pilot Readiness
### Objective
Turn the product from a working build into a pilot-ready system.

### Discovery Focus
- Pilot rollout risks, support flows, performance budgets, and release readiness gaps
- Which acceptance paths need automated coverage versus manual QA

### Delivery Scope
- End-to-end tests for critical host and attendee journeys
- Performance and failure-state hardening
- Release checklist, support process, and pilot metrics review

### Exit Criteria
- Critical journeys are covered by repeatable checks
- Known launch risks are documented with owners
- The release package is ready for a real pilot

## M6 Attendee Web Production App And Host Integration
### Objective
Replace the attendee HTML prototype with the approved Next.js web app and connect it to the real host and Supabase session state.

### Discovery Focus
- Which attendee behaviors already exist in the prototype and must survive the migration without scope drift
- How attendee bootstrap, live-state refresh, pinning, save handoff, and session-end behavior should read from the real host session model
- Which demo-mode hooks must remain so local verification stays repeatable without live OTP setup

### Delivery Scope
- Next.js attendee app under the approved app-router stack
- Shared attendee contracts and preset content model in the monorepo
- Public attendee bootstrap and live-state RPCs backed by schema `Digi`
- Host link integration so QR, go-live, and live-panel flows open the real attendee app
- Automated coverage for the real attendee path plus host-to-attendee integration

### Exit Criteria
- The canonical attendee route is the real Next.js app, not `spaces_final.html`
- Host-generated attendee links resolve into the production attendee surface
- Attendee events update host live metrics and pin state through the real backend path
- Local and CI verification prove both the standalone attendee flow and host integration

## M7 Canonical Attendee Content And Host Integration
### Objective
Replace preset-only attendee content with canonical host-managed content that both apps can read and operate on.

### Discovery Focus
- Where the current product still relies on static preset data instead of host-authored or imported content
- How imports, seed content, pin controls, and attendee rendering should converge on one canonical content contract
- How local demo verification should preserve repeatable browser E2E without reintroducing prototype-only shortcuts

### Delivery Scope
- Canonical shared content-entry contracts in the monorepo
- Supabase storage and RPCs for attendee-facing space content
- Import promotion from validated catalog rows into canonical content
- Host live-panel pin controls driven by canonical content instead of static libraries
- Attendee rendering driven by canonical content with preset fallback only when the space has no stored content

### Exit Criteria
- Attendee content comes from canonical host-managed data when available
- Host live controls and attendee rendering use the same content contract
- Imports can be proven in browser E2E to affect the attendee experience
- Preset content remains only as seed or fallback scaffolding, not the primary real-data path

## M8 Flutter Host Replatform And Scope Reduction
### Objective
Replace the Expo host implementation with a Flutter host app and reduce the supported product scope to business cards, store offers, and restaurant flows only.

### Discovery Focus
- Which current host flows are already required and must survive the replatform without behavioral loss
- Which space types, collections, and host actions should be removed because they are outside the approved business scope
- How the Flutter host should talk to the existing Supabase and attendee stack without introducing a parallel backend path

### Delivery Scope
- Flutter host app scaffold for Android and iOS
- Flutter implementations of auth, onboarding, brand setup, QR, go-live, live panel, operations, and session summary
- removal of unsupported host and attendee surface types from the active shared contracts
- Flutter widget and integration coverage for every primary host button and end-to-end host flow

### Exit Criteria
- the active host implementation is Flutter-based
- the supported space types are limited to business cards, store offers, and restaurant
- host flows are covered by repeatable Flutter tests and verified against the attendee app
- the Expo host path is no longer the active implementation target
