# Phase Discovery: M4 Operations, Analytics, And Team Management

## Phase
- Name: M4 Operations, Analytics, And Team Management
- Owner: orchestrator
- Target milestone: `M4`

## Objective
- Extend the host product from one-host manual operation into a pilot-capable workspace with analytics, bulk import validation, team access management, and safer multi-brand or multi-space administration.

## Inputs
- `spaces_prd.docx`
- `spaces_ux_guide.docx`
- `autonomous-sdlc/lessons.md`
- `autonomous-sdlc/product/milestones.md`
- `autonomous-sdlc/product/backlog.md`
- `autonomous-sdlc/product/architecture/stack-decision.md`
- `apps/host-mobile/`
- `packages/domain/`
- `supabase/migrations/20260405000500_host_core_bootstrap.sql`
- `supabase/migrations/20260405013000_live_session_control.sql`

## Current-State Evidence
- `M3` proved live-session control and summary, but the host app still had no long-range analytics, no team model, no import validation flow, and no safe admin controls for brands or spaces.
- The schema already tracked sessions and activity events, which made cross-session analytics aggregation practical without changing the approved stack.
- The current host app could only operate a single default space and a single default brand, which blocked the backlog goal of supporting business use beyond one manual room.
- Destructive actions such as archive or delete needed explicit safeguards because a one-space workspace could otherwise break its own host flow.

## Locked Decisions
- `M4` stays inside the approved Expo, TypeScript, and Supabase baseline; no new architecture gate is needed.
- CSV is the pilot import path for this repo. Validation must be row-level, visible in the UI, and persisted in `Digi`.
- Team access in this milestone covers invites, roles, pending invite state, and removal safeguards. Full multi-user sign-in acceptance stays out of scope.
- Analytics must be derived from canonical `Digi` session and activity data, not from local-only counters.
- Multi-brand support must let a space differ from the account default brand without redefining the full setup flow.

## Open Questions
- Whether pilot customers need XLSX parsing before the first production admin rollout.
- Whether accepted import rows should feed a real content table in the next milestone or remain validation evidence for now.
- Whether non-owner team members should gain direct authenticated app access before pilot feedback changes the role model.

## Dependencies And Contracts
- Depends on `M2` for canonical account, brand, and space records.
- Depends on `M3` for session history and analytics event persistence.
- Requires new shared contracts for analytics snapshots, import jobs, team members, invites, and admin mutations.
- Requires space records to expose archive state so the host app can filter active spaces cleanly.

## Risks
- Aggregation risk: if analytics definitions drift from the M0 event dictionary, pilot dashboards will look precise but be wrong.
- Admin risk: archive and delete actions can strand a workspace unless the last active space is protected.
- Product risk: import validation can look “done” while downstream content ingestion is still a later follow-up if that boundary is not explicit.

## Exit To Planning
- [x] Discovery evidence captured
- [x] Analytics, team, import, and admin scope narrowed to M4
- [x] Backend contracts and safeguards named before UI work
- [x] Scope is clear enough for `spec.md` and `plan.md`
