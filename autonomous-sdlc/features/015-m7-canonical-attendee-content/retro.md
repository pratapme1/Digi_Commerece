# Retrospective: 015 M7 Canonical Attendee Content And Host Integration

## What Worked
- Item: shared domain transformers let the host and attendee surfaces converge on one canonical content model without a full UI rewrite.
- Item: browser-driven debugging exposed the difference between a real runtime defect and a stale exported host bundle.

## What Did Not Work
- Item: Playwright assertions that relied on old product titles became brittle once canonical imports changed the surfaced content.
- Item: the pilot readiness check still pointed at the retired attendee prototype route after the real attendee app shipped.

## Standards To Update
- Standard: when the exported host web bundle is part of browser E2E, rebuild it before diagnosing runtime regressions from Playwright output.
- Standard: pilot and readiness tests should point at the production surface, not a prototype kept only for review coverage.

## Follow-up Actions
- Action: keep OTP coverage deferred until live auth setup is part of an approved milestone.
- Action: use the canonical content model for any future CMS or content-authoring work instead of introducing another attendee-only data shape.
