# Retrospective: 012 M4 Operations, Analytics, And Team Management

## What Worked
- Item: shared operations contracts let the host app, demo mode, and Supabase RPCs use one coherent model.
- Item: row-level CSV validation in the domain layer was easy to unit test before the UI and RPC work landed.
- Item: extending the existing exported host web harness kept the milestone fully browser-testable.

## What Did Not Work
- Item: early Playwright assertions assumed seeded data that no longer matched the saved demo workspace, which caused a false failure.
- Item: strict text matching on React Native web can be noisy when the same label appears as both plain text and an accessible button.

## Standards To Update
- Standard: when adding new host routes, extend the exported host web Playwright suite in the same milestone instead of treating browser proof as optional follow-up work.

## Follow-up Actions
- Action: add a canonical content-ingestion milestone that consumes validated import rows.
- Action: revisit the team-member model once pilot feedback shows how many non-owner users need direct app access.
