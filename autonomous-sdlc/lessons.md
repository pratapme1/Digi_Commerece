# Lessons Learned

## Always Read Before Starting
- Start from a feature workspace, not from an unstructured prompt.
- If implementation files change, the corresponding feature workspace must also change.
- Do not trust claims about correctness without validation evidence.
- No direct pushes to `main`; use a branch and pass the quality gates first.

## Guardrails
- `pre-commit` checks that staged implementation work includes staged feature-context updates.
- `pre-push` runs repository validation and Playwright smoke tests.
- Completed feature retrospectives should promote reusable lessons into this file.

## Captured Lessons
- 2026-04-04 `001-autonomous-sdlc-bootstrap`: validate the workflow by using it on itself; scaffolding without self-test is not trustworthy.
- 2026-04-04 `002-github-wiring`: remote setup should be verified against the live repository, not inferred from local state alone.
- 2026-04-04 `003-guardrails-and-learning`: important safeguards should be enforced by hooks and CI, not left as documentation-only expectations.
- 2026-04-04 `004-implementation-planning-and-roadmap`: major product phases must start from `autonomous-sdlc/product/` and a discovery brief before feature-level planning or implementation begins.
- 2026-04-04 `005-m0-product-foundation`: when the repo only has product sources, define shared product contracts and lifecycle rules before choosing stack-specific architecture or infrastructure.
- 2026-04-04 `006-m1-attendee-pwa-core-experience`: keep attendee live-state behavior in a separate signal layer above the content views so pin, expiry, offline, and session-end transitions can evolve without rewriting each collection screen.
- 2026-04-04 `007-architecture-and-stack-gate`: do not treat the prototype stack as an implied production choice; require architecture, infrastructure, security, and deployment artifacts before real app-stack implementation.
- 2026-04-04 `008-m1a-architecture-and-delivery-baseline`: once the architecture gate exists, lock the real v1 stack with cited primary sources and ADRs before starting the first production-oriented application milestone.
- 2026-04-04 `009-supabase-digi-schema-bootstrap`: a Supabase `service_role` key is not a substitute for a direct Postgres connection path; verify the actual execution surface before claiming remote schema changes are live.
- 2026-04-05 `010-m2-host-app-core-setup-and-go-live`: for custom Supabase schemas, prefer authenticated public RPCs over direct client access, and verify Expo mobile flows with an exported web build plus Playwright when emulator automation is not part of the repo.
