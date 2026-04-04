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
