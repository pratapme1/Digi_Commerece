# Feature Spec: 012 M4 Operations, Analytics, And Team Management

## Summary
Add the operational layer that sits above the current host core flow. This milestone gives the exported host app a real operations route with analytics ranges, CSV validation and import history, team invites and role management, and safe multi-brand or multi-space administration backed by tracked Supabase objects in schema `Digi`.

## Problem
The repo can onboard one host and run one live room, but it still behaves like a single-operator prototype. There is no analytics dashboard, no import validation path, no team-management surface, and no safe way to manage multiple brands or spaces in the real host app.

## Outcome
Hosts can operate the workspace beyond one manual room. They can review cross-session analytics, validate CSV imports, manage team invites and removals, create extra brands and spaces, and archive or delete spaces with explicit safeguards.

## Users And Surfaces
- Primary users: pilot hosts, operations leads, and business owners managing more than one room or operator
- Touched files or surfaces: `autonomous-sdlc/product/discovery/m4-operations-analytics-and-team-management.md`, feature workspace `012`, `apps/host-mobile`, `packages/domain`, `packages/api-contracts`, `supabase/migrations/20260405033000_operations_analytics_team_management.sql`, `autonomous-sdlc/scripts/verify_supabase_schema.sh`, and Playwright host export coverage

## Scope
- In scope:
  - operations screen in the exported host app
  - analytics snapshots with `7d`, `30d`, and `all` filters
  - CSV validation, template download, import-job history, and row-level feedback
  - team invites, roles, pending invite state, and removal safeguards
  - brand creation, space creation, brand assignment, archive, and delete safeguards
  - tracked Supabase tables and RPCs for the operational layer
- Out of scope:
  - real XLSX parsing
  - full team-member sign-in acceptance flows
  - using imported catalog rows as canonical attendee-facing content in this milestone

## Acceptance Criteria
- [x] Criterion 1
- [x] Criterion 2
- [x] Criterion 3

Criterion detail:
- [x] The exported host app exposes an `operations` route with analytics ranges, CSV validation history, team-management controls, and brand or space administration.
- [x] Schema `Digi` now persists team members, invites, import jobs, import rows, and operational RPCs, and the repo verifier checks those objects explicitly.
- [x] Automated browser coverage proves the new operations flow: import validation, invite handling, brand creation, space creation, archive, and delete.

## Risks
- Risk: role-management UI exists ahead of full multi-user acceptance, so the repo must keep that boundary explicit.
- Risk: CSV validation can be mistaken for final content ingestion if the pilot docs do not call out the current scope clearly.

## Clarifications
- Resolved: `M4` supports CSV import and persistence, not XLSX parsing.
- Resolved: archive and delete stay guarded when a workspace only has one space.

## Approval
- Status: completed
- Approved by: repository owner via direct continue-the-flow instruction
- Date: 2026-04-05
