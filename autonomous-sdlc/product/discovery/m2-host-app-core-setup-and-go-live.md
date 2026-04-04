# Phase Discovery: M2 Host App Core Setup And Go Live

## Phase
- Name: M2 Host App Core Setup And Go Live
- Owner: orchestrator
- Target milestone: `M2`

## Objective
- Start the real host product path on the approved production stack so a host can move from signup to a live space without manual support.

## Inputs
- `spaces_prd.docx`
- `spaces_ux_guide.docx`
- `spaces_host.html`
- `autonomous-sdlc/lessons.md`
- `autonomous-sdlc/product/foundation/domain-model.md`
- `autonomous-sdlc/product/foundation/route-map.md`
- `autonomous-sdlc/product/architecture/stack-decision.md`
- `autonomous-sdlc/product/architecture/system-overview.md`
- `autonomous-sdlc/product/architecture/security-and-data.md`
- `supabase/migrations/20260404233500_create_digi_schema.sql`

## Current-State Evidence
- `spaces_host.html` already shows the intended host UX shape for dashboard, editor, QR, and go-live views, but it is still a static prototype rather than a real app.
- The architecture gate is complete, so the host surface is now locked to `Expo SDK 55` + `React Native` + `Expo Router` with `Supabase Auth` and `Supabase Postgres`.
- The `Digi` schema now exists in Supabase, which unblocks the first tracked host-side tables and policies.
- M0 already defined the host route states, object model, and cross-surface rules that M2 must implement rather than rediscover.
- There is still no `apps/host-mobile/` app scaffold, no shared package structure, and no real host authentication or session-management code in the repo.

## Locked Decisions
- Host identity starts with phone OTP through `Supabase Auth`.
- The host surface is a native mobile app, not a web dashboard.
- `Space` owns a permanent QR target, mode, selected brand profile, and default session duration.
- `Brand Profile` belongs to the account and is assigned at the space level.
- Privileged host actions such as `go_live` and `end_session` must go through server-controlled paths, not direct client mutation.
- Security-sensitive work in this milestone requires explicit approval before implementation.

## Open Questions
- Whether the first `M2` build should support only a single admin per account before team roles arrive in `M4`.
- How much of business verification is a real system behavior in `M2` versus a UI placeholder and status flag.
- Whether the first QR screen should support only viewing and copying the space link before adding downloadable branded QR assets.
- Whether session scheduling should stay as a later `M2` slice or move behind the first go-live completion path.
- Which minimum tables and RLS policies are required to support onboarding without overbuilding ahead of `M3`.

## Dependencies And Contracts
- Depends on M0 domain entities: `account`, `brand_profile`, `space`, and `session`.
- Depends on M0 host states: `phone-entry`, `otp-verification`, `account-setup`, `space-creation`, `brand-setup`, `qr-screen`, and `go-live-confirmation`.
- Depends on the approved host stack and service boundaries in the architecture package.
- Depends on the `Digi` schema as the namespace for the first tracked tables and policies.
- Shares session state and QR permanence rules with the attendee surface and later `M3` realtime work.

## Risks
- Delivery risk: `M2` can sprawl if live controls, analytics, or team management leak in before the first go-live path is complete.
- Security risk: OTP, account ownership, and privileged mutations are high-risk and cannot be treated as prototype-only behavior.
- Data-model risk: weak first tables or policies will create rework for `M3` and `M4`.
- Repo-shape risk: moving from static prototype files to the approved monorepo layout touches tooling and project structure, not just screens.

## Exit To Planning
- [x] Discovery evidence captured
- [x] Architecture inputs confirmed
- [x] Host object model and route dependencies named
- [x] Scope is clear enough for `spec.md` and `plan.md`
