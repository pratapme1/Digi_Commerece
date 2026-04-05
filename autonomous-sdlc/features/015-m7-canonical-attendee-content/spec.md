# Feature Spec: 015 M7 Canonical Attendee Content And Host Integration

## Summary
Replace the last preset-only attendee content path with a canonical content layer shared by the host app, attendee app, and Supabase. Imported or seeded host content should drive attendee collections, search, and pinning so both sides are operating on the same content contract.

## Problem
The attendee route is real, but its visible content still comes from shared preset data instead of canonical host-managed content. The host can validate imports, but accepted rows do not become attendee-facing content, and the live panel still pins from a static library.

## Outcome
Canonical content exists for each space, the host live panel reads that content for pin controls, and the attendee app renders that same content on the real route. Presets remain only as seed or fallback scaffolding when a space has no stored content yet.

## Users And Surfaces
- Primary users: hosts running live rooms, attendees opening the real `/s/[qrSlug]` route, and operators importing catalog data
- Touched files or surfaces: `apps/attendee-web`, `apps/host-mobile`, `packages/domain`, `packages/api-contracts`, `supabase/migrations`, Playwright E2E coverage, and product milestone/backlog docs

## Scope
- In scope:
  - canonical content-entry contracts and transformation helpers
  - Supabase storage and RPCs for attendee-facing space content
  - promotion of accepted import rows into canonical content
  - host live-panel pin controls driven by canonical content
  - attendee rendering driven by canonical content with fallback only when a space has no stored content
- Out of scope:
  - OTP coverage changes
  - a full CMS for rich editing beyond seed and import flows
  - removal of the root HTML prototype files

## Acceptance Criteria
- [x] The attendee route can render canonical space content returned from Supabase instead of relying only on preset data.
- [x] The host live panel can pin items from the same canonical content entries the attendee route renders.
- [x] Accepted import rows for a space become canonical attendee-facing content.
- [x] Browser E2E proves that host-managed content affects the attendee experience.

## Risks
- Risk: import replacement rules may surprise hosts if newly promoted content duplicates older imported rows.
- Risk: demo-mode content state can diverge from the real content path unless it uses the same transformation helpers.

## Clarifications
- Decision: presets remain as fallback content when a real space has no stored canonical content yet.
- Decision: this milestone closes the product gap around preset-only attendee content without building a full authoring CMS.

## Approval
- Status: self-approved per user instruction to proceed through the workflow
- Approved by: Codex
- Date: 2026-04-05
