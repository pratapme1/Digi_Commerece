# Implementation Plan: 004 Implementation Planning And Roadmap

## Summary
Create a dedicated `autonomous-sdlc/product/` planning layer rather than overloading feature workspaces with roadmap responsibilities. Then update the operating docs so every later product phase starts from those artifacts, passes through discovery, and only then opens feature-level implementation work.

## Architecture
- Key approach: capture product-wide planning in stable docs, then link those docs into workflows, approvals, session startup, and contributor guidance
- Why this shape: milestones and backlog are durable repo memory, while individual feature workspaces remain focused on one implementation slice
- Rejected alternative: storing roadmap context only inside a single feature workspace, which would make future sessions harder to resume cleanly

## Touched Areas
- Files: `autonomous-sdlc/product/`, `autonomous-sdlc/process.md`, `autonomous-sdlc/scripts/start_session.sh`, repo readmes, feature workspace `004`
- Docs: product planning docs, contributor guide, repo overview, workflow guidance
- External dependencies: none

## Research Notes
- Finding: the PRD already locks several major product decisions, including QR as the v1 trigger, native host app, PWA attendee flow, fixed card structures, and identified versus anonymous spaces.
- Finding: the UX guide already lists missing attendee and host states, so the first roadmap should sequence implementation rather than request more mockups.

## Implementation Slices
1. Create the product planning layer: design approach, milestones, backlog, and discovery template.
2. Update workflow, approval, and session-start docs so discovery is mandatory for major phases.
3. Update repo guidance and complete the feature workspace artifacts.

## Test And QA Plan
- Local checks: `bash autonomous-sdlc/scripts/check_feature.sh autonomous-sdlc/features/004-implementation-planning-and-roadmap`, `npm run verify`
- Manual checks: review milestone sequence against the PRD and UX guide, review the discovery-first flow across the updated docs

## Rollout And Rollback
- Rollout: use the new product docs as the required starting point for the first real implementation milestone
- Rollback: remove `autonomous-sdlc/product/` and the related workflow references if the repo returns to ad hoc planning

## Approval
- Status: approved
- Approved by: local planning pass
- Date: 2026-04-04
