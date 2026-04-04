# Implementation Plan: 008 M1A Architecture And Delivery Baseline

## Summary
Fill the architecture package with an explicit v1 pilot stack instead of leaving the gate abstract. The work will use current official platform documentation to choose the smallest credible production topology, then record the decision in durable architecture docs and ADRs.

## Architecture
- Key approach: use a split-surface product stack with Next.js for the attendee PWA, Expo for the host app, and Supabase as the managed backend platform
- Why this shape: it matches the already locked product shape of zero-install attendee web plus native host controls while keeping the operational footprint small for a v1 pilot
- Rejected alternative: keep extending the prototype stack or choose a custom backend and bespoke infra before product demand is proven

## Touched Areas
- Files: `autonomous-sdlc/product/architecture/README.md`, `autonomous-sdlc/lessons.md`
- Docs: `stack-decision.md`, `system-overview.md`, `security-and-data.md`, `infrastructure-and-environments.md`, `delivery-and-release.md`, ADRs under `adrs/`, discovery brief `m1a-architecture-and-delivery-baseline.md`
- External dependencies: official docs for Next.js, Expo, Supabase, Vercel, GitHub Actions environments, and Sentry

## Research Notes
- Finding: the product constraints already force a split between attendee web and host mobile, so one universal UI stack would optimize the wrong thing
- Finding: Expo plus EAS is the cleanest release path for the native host app without sacrificing future React Native flexibility
- Finding: Supabase covers relational data, auth, storage, functions, and v1 realtime in one platform, which is a better fit than custom backend work right now
- Finding: Vercel provides the cleanest deployment and rollback path for the attendee PWA
- Finding: realtime authorization on Supabase is still a watchpoint, so the design should use private channels and minimal payloads

## Implementation Slices
1. Fill the stack decision and system overview with one approved v1 topology.
2. Fill the security, infrastructure, and delivery documents with concrete operating rules.
3. Record the major choices as ADRs, update architecture entry points, and close the feature workspace.

## Test And QA Plan
- Local checks: `bash autonomous-sdlc/scripts/check_feature.sh autonomous-sdlc/features/008-m1a-architecture-and-delivery-baseline`, `bash autonomous-sdlc/scripts/validate_repo.sh`
- Manual checks: review that all architecture docs are approved, internally consistent, and aligned with the product constraints already captured in discovery and milestone docs

## Rollout And Rollback
- Rollout: treat these docs as the required baseline before starting `M2 Host App Core Setup And Go Live`
- Rollback: replace or revise the architecture docs and ADRs if the team later approves a different stack; do not silently drift from them in implementation

## Approval
- Status: approved
- Approved by: architecture baseline decision pass
- Date: 2026-04-04
