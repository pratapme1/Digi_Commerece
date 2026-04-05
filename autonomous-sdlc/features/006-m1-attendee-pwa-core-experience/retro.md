# Retrospective: 006 M1 Attendee PWA Core Experience

## What Worked
- Item: the M0 route, lifecycle, and analytics contracts reduced ambiguity before the attendee milestone started
- Item: the PRD and UX guide were specific enough to define M1 implementation slices without additional product discovery
- Item: implementing the bootstrap flow as an overlay preserved the existing content demo while creating a real attendee entry journey
- Item: turning the showcase into a space-scoped overview let the prototype keep its high-fidelity collection screens without exposing them all at once to the attendee
- Item: adding the session-state layer as a top overlay kept pin, expiry, offline, and end-of-session behavior independent from the underlying collection screens

## What Did Not Work
- Item: the current attendee prototype still carries static collection content, so some preset combinations remain more representative than fully data-driven
- Item: a single-file prototype makes it harder to separate bootstrap-state logic from the content views cleanly
- Item: the offline and end-of-session states are still simulated locally rather than driven by a host event source

## Standards To Update
- Standard: milestone work should move from discovery into implementation only after the slice sequence is explicit and tied to the product contracts
- Standard: when a prototype is still demo-first, add new journey states as reversible layers before attempting a larger structural rewrite
- Standard: when tests fail during a slice, update the assertions to match the approved product path rather than loosening the UI back toward the old demo model
- Standard: when adding live-state behavior to a prototype, keep the state controller separate enough that later realtime wiring can replace only the signal source instead of rewriting the UI state layer

## Follow-up Actions
- Action: carry the completed attendee contracts into the next milestone rather than adding more attendee polish in isolation
