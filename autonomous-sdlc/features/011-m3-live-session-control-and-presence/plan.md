# Implementation Plan: 011 M3 Live Session Control And Presence

## Summary
Implement M3 as a three-part slice: shared live-room contracts and tracked database state first, host live-panel and summary routes second, and cross-surface attendee sync plus browser proof third. The canonical state lives in Supabase, while a same-origin demo bridge provides fast local sync for the browser-tested host and attendee surfaces.

## Architecture
- Key approach: extend the shared contracts with live metrics and summary types, add tracked `Digi` tables and RPCs for room state and session activity, and expose that data through new host app screens plus a browser-only sync bridge shared by the exported host app and copied attendee demo.
- Why this shape: it follows the approved split between canonical persistence and transient room-state fanout while still giving the repo a practical, testable cross-surface sync path today.
- Rejected alternative: keep M3 as another prototype-only HTML pass or build live controls without a persisted event model behind them.

## Touched Areas
- Files: feature workspace `011`, `autonomous-sdlc/product/discovery/m3-live-session-control-and-presence.md`, `apps/host-mobile`, `packages/domain`, `packages/api-contracts`, `spaces_final.html`, `tests/e2e/host-mobile-web.spec.ts`, `playwright.config.ts`, and repo verification scripts as needed
- Docs: milestone artifacts, lessons, and release notes
- External dependencies: Expo Router, React Native web export, Supabase Postgres and RPCs, and the existing Playwright browser harness

## Research Notes
- Finding: the host and attendee prototypes already agree on the intended live operating language, so M3 should translate that into tracked state rather than redesign it.
- Finding: the current exported host web app can be used for browser automation, which makes a same-origin attendee demo bridge practical without adding a new local backend.
- Finding: summary metrics should be derived from the same session event stream as live counts, not from separate per-screen counters.

## Implementation Slices
1. Slice 1: completed. Added shared live-room contracts plus tracked `Digi` migration and RPCs for live panel data, pin state, session events, and session summary.
2. Slice 2: completed. Added host live-panel and session-summary routes, wired them into the host app context and dashboard, and supported pin and end-session commands.
3. Slice 3: completed. Added the browser-only room bridge for the attendee demo, updated the attendee prototype to react to live host state, and proved the sync path with Playwright.

## Test And QA Plan
- Local checks:
  - `npm run test:unit`
  - `npm run typecheck`
  - `npm run host:web:export`
  - `bash autonomous-sdlc/scripts/verify_supabase_schema.sh`
  - `npx playwright test tests/e2e/host-mobile-web.spec.ts`
  - `npm run verify`
- Manual checks:
  - verify the host live panel matches the intended prototype semantics for count, feed, pinning, and end-of-session
  - verify the attendee live state reacts to the host pin and end-session actions in a browser session on the copied attendee demo page

## Rollout And Rollback
- Rollout: land the tracked live-state migration and contracts first, then host UI, then attendee sync and tests
- Rollback: revert the live-panel UI independently if needed, or roll back the M3 migration before later summary work depends on it

## Approval
- Status: completed
- Approved by: repository owner via direct continue-the-flow instruction
- Date: 2026-04-05
