# Implementation Plan: 014 M6 Attendee Web Production Migration

## Summary
Add a new `apps/attendee-web` Next.js 16 App Router app that renders the full attendee room flow and reads room/session state from Supabase through public security-definer RPCs. Move the prototype-only attendee preset data into the shared domain package, wire host URLs to the new route, and keep a demo-compatible mode so automated verification can still run without live OTP flows.

## Architecture
- Key approach: use one shared attendee contract layer in `packages/domain`, one public bootstrap RPC keyed by `qr_slug`, and one real Next.js route `/s/[qrSlug]` with a client component that handles room interactions and polling.
- Why this shape: it keeps attendee behavior durable, uses the existing Supabase session model, and avoids duplicating product logic across the prototype, host, and web app.
- Rejected alternative: extending `spaces_final.html` again or embedding the attendee surface inside the Expo host export. That would keep the product split across two stacks and leave the approved Next.js attendee app undone.

## Touched Areas
- Files:
  - `apps/attendee-web/*`
  - `apps/host-mobile/app/qr.tsx`
  - `apps/host-mobile/app/live-panel.tsx`
  - `apps/host-mobile/src/lib/host-service.ts`
  - `packages/domain/src/*`
  - `packages/api-contracts/src/index.ts`
  - `supabase/migrations/*`
  - `package.json`, `playwright.config.ts`, `tsconfig.json`
- Docs:
  - `autonomous-sdlc/product/milestones.md`
  - `autonomous-sdlc/product/backlog.md`
  - `autonomous-sdlc/product/discovery/m6-attendee-web-production-migration.md`
  - `README.md`, `AGENTS.md`, and milestone `014` artifacts as needed
- External dependencies:
  - `next`
  - `@supabase/ssr`
  - existing `@supabase/supabase-js`

## Research Notes
- Finding: Next.js 16 current package version is `16.2.2`.
- Finding: React and React DOM stay on `19.2.4`, matching the host app.
- Finding: the current host export already points attendee URLs at `/s/[qrSlug]`, so the missing work is the real attendee runtime and live data contract, not a new route convention.

## Implementation Slices
1. Workflow and shared contract slice
2. Supabase attendee bootstrap and live-state slice
3. Next.js attendee app slice
4. Host integration and verification slice

## Test And QA Plan
- Local checks:
  - `bash autonomous-sdlc/scripts/check_feature.sh autonomous-sdlc/features/014-m6-attendee-web-production-migration`
  - `npm run test:unit`
  - `npm run typecheck`
  - `npm run attendee:build`
  - `bash autonomous-sdlc/scripts/verify_supabase_schema.sh`
  - `npx playwright test`
- Manual checks:
  - open a real attendee route from the host live panel in demo mode
  - verify identified and anonymous entry
  - verify pin notice, ended overlay, and save handoff
  - verify host live metrics reflect attendee activity

## Rollout And Rollback
- Rollout: land the Next.js attendee app beside the prototype, then switch the host open-link path and test suite to the real attendee route in the same milestone.
- Rollback: point host links back to the prototype path and remove the new attendee app from verification if the production route blocks the branch.

## Approval
- Status: approved
- Approved by: user request on 2026-04-05 to complete the real attendee app and integrate it with host
- Date: 2026-04-05
