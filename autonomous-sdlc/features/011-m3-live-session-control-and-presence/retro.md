# Retrospective: 011 M3 Live Session Control And Presence

## What Worked
- Item: using tracked live-session contracts before UI work kept the host panel, summary, and attendee sync aligned with one event model
- Item: the same-origin browser bridge gave the repo a practical end-to-end proof path for host and attendee sync without needing native-device automation
- Item: the host prototype already described the operational language well enough to translate directly into the real app

## What Did Not Work
- Item: test failures were mostly selector and browser-context issues rather than product bugs, which shows the sync path is sensitive to automation details
- Item: the attendee runtime is still a prototype HTML surface, so M3 had to bridge into that world instead of finishing the full production attendee implementation

## Standards To Update
- Standard: when a cross-surface flow depends on shared browser storage, Playwright tests must use the same browser context rather than opening independent contexts
- Standard: for live features, keep canonical state in tracked schema objects and use browser-only bridges only as explicit local verification scaffolding

## Follow-up Actions
- Action: promote the browser-context and live-state lessons into `autonomous-sdlc/lessons.md`
- Action: carry the new live-session contracts into `M4` analytics and later attendee-web migration work
