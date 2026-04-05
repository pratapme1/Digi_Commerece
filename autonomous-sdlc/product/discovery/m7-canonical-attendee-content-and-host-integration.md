# M7 Discovery: Canonical Attendee Content And Host Integration

## Goal
Remove the last preset-only product path by making attendee content canonical, host-managed, and shared across host controls, attendee rendering, and import workflows.

## Inputs
- `autonomous-sdlc/product/milestones.md`
- `autonomous-sdlc/product/backlog.md`
- `autonomous-sdlc/product/architecture/system-overview.md`
- `apps/attendee-web/`
- `apps/host-mobile/`
- `supabase/migrations/20260405033000_operations_analytics_team_management.sql`
- `supabase/migrations/20260405050000_attendee_web_bootstrap.sql`

## Current State
- The attendee app is real, but its visible collections still come from shared preset data.
- The host app validates and records imports, but accepted rows do not become attendee-facing content.
- The live panel still pins from a static content library instead of the same content source the attendee sees.

## Decision
- Introduce one canonical content-entry contract for both surfaces.
- Persist canonical content in schema `Digi`.
- Promote accepted catalog rows into canonical space content.
- Keep presets only as seed or fallback content when a space has no stored content yet.

## Risks
- Import promotion could create duplicate or stale content unless replacement rules are explicit.
- Demo mode can drift away from the real content path unless it uses the same shared contracts.
- Browser E2E must prove the host-to-attendee content handoff, not just the existing session shell.

## Done When
- A host-managed content change affects the attendee app through the real route.
- The host live panel pins from canonical content, not a static library.
- Browser E2E covers an import-to-attendee or host-content-to-attendee path.
