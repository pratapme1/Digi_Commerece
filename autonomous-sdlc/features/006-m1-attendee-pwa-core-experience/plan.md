# Implementation Plan: 006 M1 Attendee PWA Core Experience

## Summary
Plan M1 as a structured attendee implementation milestone, not as ad hoc screen additions. The implementation should start from the M0 route states and lifecycle rules, then add the missing attendee states and interactions to the existing attendee surface in thin, testable slices.

## Architecture
- Key approach: treat `spaces_final.html` as the current implementation target while enforcing the logical route flow, edge states, and analytics requirements defined in the product docs
- Why this shape: the repository is still prototype-first, and the fastest path to a coherent attendee experience is to close the journey gaps before introducing a new app structure
- Rejected alternative: starting with isolated visual polish or jumping straight to a new app architecture before the attendee flow itself is stable

## Touched Areas
- Files: `spaces_final.html`, `tests/e2e/prototypes.spec.ts`, possibly new attendee-specific assets or support files if required, feature workspace `006`, `autonomous-sdlc/product/discovery/m1-attendee-pwa-core-experience.md`
- Docs: M1 discovery brief, attendee QA evidence, any backlog updates that result from discovery
- External dependencies: existing Playwright setup only unless implementation proves a new test helper is necessary

## Research Notes
- Finding: the PRD defines the full attendee journey from scan through save and expiry, including zero-account identity rules and native-share save behavior.
- Finding: the UX guide already specifies the missing attendee states and their interaction details, including timing, copy, and animation direction.
- Finding: the current attendee prototype already proves rendering patterns for several card types, so M1 should focus on journey cohesion rather than redesigning the content views from scratch.

## Implementation Slices
1. Build the attendee bootstrap flow: loading skeleton, entry screen, inactive or ended handling, and identified-name entry.
2. Build the browsing flow: overview, grouped collections, active search, empty-space state, and save/share actions.
3. Build the session-state layer: pin notification, expiry warning, ended overlay, attendee event coverage, and expanded Playwright checks.

## Test And QA Plan
- Local checks: `bash autonomous-sdlc/scripts/check_feature.sh autonomous-sdlc/features/006-m1-attendee-pwa-core-experience`, `npm run verify`
- Manual checks: review the planned M1 route against the PRD and UX guide, then later validate the actual attendee flow at phone-sized layout and state transitions

## Rollout And Rollback
- Rollout: start implementation from slice 1 only after plan approval and keep each slice independently verifiable
- Rollback: revert attendee-flow additions in `spaces_final.html` if the milestone is rescoped or if the repo adopts a different implementation structure before coding finishes

## Approval
- Status: approved
- Approved by: local M1 discovery pass
- Date: 2026-04-04
