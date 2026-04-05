# Retrospective: 016 Flutter Host Replatform And Scope Correction

## What Worked
- Item: replatforming the host as a clean Flutter app was faster and safer than trying to mutate the old Expo code in place
- Item: shared-contract narrowing before the final verification pass kept the attendee and host scopes aligned

## What Did Not Work
- Item: Flutter web semantics required browser-test helpers that explicitly enable accessibility and interact with checkbox-style `ChoiceChip` controls
- Item: raw DOM-based field selectors were brittle for Flutter; role-based selectors plus explicit select-all-and-insert entry were more reliable

## Standards To Update
- Standard: browser tests for Flutter web should use a retrying accessibility bootstrap helper and serial execution
- Standard: treat Flutter controller-backed fields as user-edited textboxes, not generic DOM inputs

## Follow-up Actions
- Action: remove or archive the inactive Expo host path after the rollback decision is made
- Action: consider replacing the deprecated Flutter `--pwa-strategy` test-build flag when the upstream replacement is stable
