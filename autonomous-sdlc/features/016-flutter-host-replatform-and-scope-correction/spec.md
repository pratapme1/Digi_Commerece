# Feature Spec: 016 Flutter Host Replatform And Scope Correction

## Summary
Replatform the host product from Expo to Flutter and reduce the active product scope to business cards, store offers, and restaurant only. The host app must run as a real native Flutter app for Android and iOS, while the attendee app stays on the current web stack and keeps working against the same backend.

## Problem
The repo currently treats the Expo host app as the active native host implementation, but the required host stack is Flutter. The repo also still carries extra space types and flows that are outside the approved business scope, which makes the product and tests broader than they should be.

## Outcome
- The active host implementation is Flutter-based.
- The supported business shapes are business cards, store offers, and restaurant only.
- Host onboarding, QR, go-live, live panel, operations, and session summary work in Flutter.
- Automated tests cover primary host journeys, controls, and integration with the attendee app.

## Users And Surfaces
- Primary users: hosts running native Android or iOS apps, attendees opening the attendee web app, and operators validating imports and live sessions
- Touched files or surfaces: `autonomous-sdlc/product/`, `autonomous-sdlc/features/016-*`, `apps/host-flutter`, shared contracts, backend adapters, host test suites, and affected attendee tests

## Scope
- In scope:
  - architecture correction from Expo to Flutter for the host app
  - host Flutter scaffold and migrated host flows
  - scope reduction to `business_card`, `store`, and `restaurant`
  - removal of unsupported host or attendee behaviors tied to `meeting`, `event`, or `other`
  - Flutter tests and updated repo verification paths
- Out of scope:
  - OTP provider changes
  - rebuilding the attendee app in Flutter
  - adding new business shapes beyond the three approved ones

## Acceptance Criteria
- [x] A Flutter host app exists in the repo and is the active host implementation target.
- [x] Core host flows work in Flutter: auth entry, onboarding, QR, go-live, live panel, operations, and session summary.
- [x] Active product scope is reduced to business cards, store offers, and restaurant across shared contracts and user-facing behavior.
- [x] Automated tests cover the primary host and attendee journeys under the reduced scope.

## Risks
- Risk: the replatform touches architecture, app structure, tests, and shared product scope in one milestone.

## Clarifications
- Decision: the current Expo host app becomes deprecated once the Flutter host app reaches testable parity.
- Decision: `business_card` replaces generic meeting or event-style sharing in the scoped product.

## Approval
- Status: approved for implementation
- Approved by: Codex
- Date: 2026-04-05
