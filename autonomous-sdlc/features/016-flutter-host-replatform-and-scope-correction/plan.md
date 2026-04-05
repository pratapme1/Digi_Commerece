# Implementation Plan: 016 Flutter Host Replatform And Scope Correction

## Summary
Add a new Flutter host app and port the current host flow into a single native codebase, then narrow the shared product contracts to the three approved business shapes. Keep the attendee web app and Supabase backend, but update contracts, tests, and delivery docs so the product no longer targets Expo or the out-of-scope space types.

## Architecture
- Key approach: treat the Flutter host as a fresh app that reuses the existing backend model, then deprecate the Expo host path after Flutter tests are green.
- Why this shape: it is safer than trying to incrementally convert React Native files while preserving delivery continuity and test evidence.
- Rejected alternative: keep Expo as the active host implementation and only update documentation; that would leave the repo knowingly misaligned with the required stack.

## Touched Areas
- Files:
  - `apps/host-flutter`
  - shared contracts that define active space types and host data
  - test suites and repo scripts that currently assume Expo host export
- Docs:
  - milestone, backlog, design, and architecture docs
  - feature workspace `016-flutter-host-replatform-and-scope-correction`
- External dependencies:
  - Flutter stable SDK
  - Flutter testing packages
  - Flutter Supabase client bindings if needed

## Research Notes
- Finding: Flutter is not installed in the current environment, so the repo cannot satisfy the host requirement until a local SDK exists.
- Finding: the current repo already has enough host behavior defined to port into Flutter without inventing a new product shape.

## Implementation Slices
1. Stack correction and Flutter scaffold
2. Flutter host flow implementation
3. Scope reduction, tests, and verification rewiring

## Test And QA Plan
- Local checks:
  - Flutter analyze and Flutter test
  - host flow widget or integration tests
  - attendee web and shared backend verification after scope reduction
  - full repo verification with updated host path
- Manual checks:
  - host onboarding through live session on Flutter
  - operations and QR flow on Flutter
  - attendee journey for each approved business shape

## Rollout And Rollback
- Rollout: add Flutter host app, migrate active scripts and tests, then deprecate Expo host delivery paths.
- Rollback: keep the Expo host app untouched until Flutter verification is green so the repo has a fallback during the migration.

## Approval
- Status: approved for implementation
- Approved by: Codex
- Date: 2026-04-05
