# Phase Discovery: M6 Attendee Web Production App And Host Integration

## Phase
- Name: M6 Attendee Web Production App And Host Integration
- Owner: Codex
- Target milestone: M6

## Objective
- Replace the attendee HTML prototype with the approved Next.js attendee app and connect it to the real host and Supabase session model.

## Inputs
- `spaces_prd.docx`
- `spaces_ux_guide.docx`
- `spaces_final.html`
- `apps/host-mobile`
- `supabase/migrations`
- `autonomous-sdlc/product/architecture/`
- `autonomous-sdlc/lessons.md`

## Current-State Evidence
- The host app, schema, and live controls are real in Expo and Supabase.
- Host attendee URLs already resolve conceptually to `/s/[qrSlug]`, but no real attendee app exists there.
- The complete attendee product behavior already exists in `spaces_final.html`, including bootstrap, overview, search, collection views, pin notice, expiry warning, offline notice, and ended overlay.
- Existing Playwright host-to-attendee integration still opens `attendee-demo.html`, so verification is still proving the prototype path rather than the approved stack.

## Locked Decisions
- The attendee production surface must be Next.js 16 App Router on the approved web stack.
- Supabase remains the backend and session-state source of truth.
- Local verification must stay repeatable even without live OTP flows, so a demo-compatible path is required.
- The prototype remains a reference artifact; it should no longer be the canonical attendee runtime after this milestone.

## Open Questions
- Which attendee data should be modeled as shared preset content versus persisted content rows in this milestone?
- How much of the current prototype-only empty-space behavior should remain when v1 content is still preset by space type?

## Dependencies And Contracts
- Host QR and live-panel links
- Shared domain content and attendee state contracts
- Public Supabase attendee bootstrap and event RPCs
- Playwright multi-surface verification

## Risks
- Delivery risk: the milestone spans shared packages, backend RPCs, a new app, and host integration.
- UX risk: migration can lose polished prototype states if the new app reduces the attendee flow to a generic CRUD view.
- Data or analytics risk: attendee activity must continue to feed the existing host live-panel and summary calculations.

## Exit To Planning
- [x] Discovery evidence captured
- [x] Open questions reduced to acceptable risk
- [x] Touched surfaces and dependencies named
- [x] Acceptance direction is clear enough for `spec.md` and `plan.md`
