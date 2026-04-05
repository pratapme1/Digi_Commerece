# Feature Spec: 014 M6 Attendee Web Production Migration

## Summary
This milestone replaces the attendee HTML prototype with the approved Next.js app and wires it to the real host and Supabase session model. The attendee must enter through a permanent `/s/[qrSlug]` route, follow identified or anonymous bootstrap rules, browse the live room, react to host pinning and session end, and send activity back to the host metrics layer.

## Problem
The host app and backend are real, but the attendee runtime is still `spaces_final.html`. That means the product has no real attendee application on the approved stack, host links still depend on prototype-only flows, and the live room integration path is split between production data and browser-local demo behavior.

## Outcome
The canonical attendee experience lives in `apps/attendee-web`, reads its room state from Supabase, and integrates with host QR, go-live, and live-panel flows. The HTML prototype remains only as a visual reference. Both local verification and the repo guardrails prove the new path works.

## Users And Surfaces
- Primary users: space attendees, live hosts validating attendee links, operators running local verification
- Touched files or surfaces:
  - `apps/attendee-web`
  - `apps/host-mobile`
  - `packages/domain`
  - `packages/api-contracts`
  - `supabase/migrations`
  - `tests/e2e`
  - workflow artifacts for `014`

## Scope
- In scope:
  - attendee bootstrap, overview, collection rendering, search, save handoff, offline notice, pin notice, expiry warning, and ended overlay
  - Supabase-backed attendee bootstrap and live-state reads
  - host-to-attendee URL integration for real and local-demo flows
  - shared domain modeling for attendee preset content by space type
  - automated coverage for the real attendee route
- Out of scope:
  - replacing the host Expo app
  - full content-management authoring beyond the current shared preset library
  - native attendee mobile apps
  - new infrastructure beyond the approved Next.js and Supabase stack

## Acceptance Criteria
- [ ] A host-generated attendee URL resolves into the new Next.js attendee app and no longer depends on `attendee-demo.html`.
- [ ] The attendee app supports identified and anonymous entry, overview, search, collection views, save handoff, pin notice, expiry warning, offline state, and session-ended behavior.
- [ ] Attendee presence and activity events update the existing host live panel and session summary through Supabase RPCs.
- [ ] `npm run verify` passes with the new attendee runtime included in typecheck, build, schema verification, and Playwright coverage.

## Risks
- Risk: the attendee product behavior currently lives mostly in the prototype, so migration can regress real UX details if the shared contract layer is too thin.
- Risk: local end-to-end verification still depends on demo-mode support because full OTP-authenticated host automation is not in repo scope.

## Clarifications
- Decision: keep the prototype content library as the canonical v1 attendee content source until content publishing is connected to imports in a later milestone.
- Decision: keep a demo-compatible path in the real attendee app so local host-to-attendee verification remains repeatable.

## Approval
- Status: approved
- Approved by: user request on 2026-04-05 to complete the real attendee app and integrate it with host
- Date: 2026-04-05
