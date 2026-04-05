# Design Approach

## Source Of Truth
- `spaces_prd.docx` locks the product decisions for v1.
- `spaces_ux_guide.docx` defines missing states, design tokens, and interaction details.
- `spaces_final.html` and `spaces_host.html` show the current prototype direction, but they do not cover the full product.

## Product Shape
- Attendee surface: QR-triggered PWA with zero install, no required account, and identified or anonymous entry depending on host settings.
- Host surface: native mobile app for onboarding, brand setup, space editing, live control, and post-session operations.
- Shared system layer: spaces, sessions, structured content cards, brand profiles, attendee presence, saves, and analytics events.

## Experience Principles
- Zero receiver friction: scanning a QR must feel faster than receiving paper.
- Host-controlled delivery: the host decides what is live, pinned, branded, and visible.
- Structured rendering over file viewing: content is rendered as mobile-native cards, never raw PDFs.
- Live first, save intentionally: sessions are ephemeral by default; saving is explicit and user-driven.
- India-first trust and reliability: QR, WhatsApp-adjacent behavior, budget-phone performance, and verification cues are core product requirements.

## Implementation Principles
- Start with shared domain contracts before polishing either surface in isolation.
- Lock the production stack, system boundaries, infrastructure, and release path before real app implementation beyond prototypes.
- Build vertical slices when a behavior spans host, attendee, and live session state.
- Ship empty, loading, expired, and error states with the happy path.
- Add analytics and instrumentation as part of the feature, not after the UI is done.
- Keep design consistent with the locked typography, colour, spacing, and motion rules in the UX guide.

## Major Workstreams
- Product foundation: information architecture, content model, session lifecycle, event contracts, and analytics dictionary.
- Attendee PWA: entry, identification, overview, search, save flow, and end-of-session behavior.
- Architecture and delivery baseline: stack decisions, system boundaries, environments, security, CI/CD, and deployment model.
- Host app: onboarding, brand setup, space editor, QR distribution, and go-live controls.
- Live operations: presence, pinning, notifications, session state, and session summary.
- Operations and scale: bulk import, analytics, team roles, settings, verification, and archive flows.
- Launch hardening: automated testing, performance checks, release readiness, and pilot support.

## Discovery Gate For Major Phases
Before a milestone starts, create a discovery brief from `discovery-template.md` that captures:
- the user problem and target outcome
- current-state evidence from the PRD, UX guide, and prototypes
- touched surfaces, contracts, and dependencies
- open questions, risks, and validation needs
- explicit exit criteria for moving into planning

Do not start implementation for a milestone until the discovery brief, `spec.md`, and `plan.md` agree on scope and sequence.
Do not start production-oriented implementation until the architecture gate in `product/architecture/` is complete.
