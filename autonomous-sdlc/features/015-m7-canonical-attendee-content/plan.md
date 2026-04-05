# Implementation Plan: 015 M7 Canonical Attendee Content And Host Integration

## Summary
Add a canonical content-entry layer that sits between imports or seeds and the attendee UI. Supabase will persist space content entries, the host app will read them for pin controls, and the attendee app will transform them into its existing overview, search, and detail screens. Demo mode will use the same shared contracts so browser E2E remains repeatable.

## Architecture
- Key approach: introduce shared content-entry types and transformers, then store space content entries in schema `Digi` and expose them through host and attendee RPCs.
- Why this shape: it replaces the preset-only gap without rewriting the entire attendee UI or inventing a full CMS first.
- Rejected alternative: keeping the current preset UI and only patching imports into one or two screens would leave host pinning and attendee rendering on separate data models.

## Touched Areas
- Files:
  - `packages/domain`
  - `packages/api-contracts`
  - `apps/attendee-web`
  - `apps/host-mobile`
  - `supabase/migrations`
  - `autonomous-sdlc/features/015-m7-canonical-attendee-content`
- Docs:
  - `autonomous-sdlc/product/milestones.md`
  - `autonomous-sdlc/product/backlog.md`
  - `autonomous-sdlc/product/discovery/m7-canonical-attendee-content-and-host-integration.md`
- External dependencies: existing Next.js, Expo, Supabase, Vitest, and Playwright stack only

## Research Notes
- Finding: the host already persists import rows, but nothing promotes them into attendee-facing content.
- Finding: the real attendee app can keep its current screen structure if the content layer is transformed in shared domain code instead of rebuilding the UI from scratch.

## Implementation Slices
1. Shared contracts plus Supabase content storage and RPCs
2. Host content integration for imports and live pin controls
3. Attendee rendering switch plus browser E2E for host-managed content

## Test And QA Plan
- Local checks:
  - `npm run test:unit`
  - `npm run typecheck`
  - `bash autonomous-sdlc/scripts/verify_supabase_schema.sh`
  - `npx playwright test`
  - `npm run verify`
- Manual checks:
  - host import flow updates canonical content
  - live panel shows canonical pin choices
  - attendee route shows imported content on the real `/s/[qrSlug]` path

## Rollout And Rollback
- Rollout: migrate schema, refresh host content on setup and import, then switch attendee rendering to canonical entries with preset fallback only when none exist.
- Rollback: revert the new migration and restore the attendee and host content reads to the preset-only path.

## Approval
- Status: approved for implementation
- Approved by: Codex
- Date: 2026-04-05
