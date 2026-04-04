# Retrospective: 003 Guardrails And Learning

## What Worked
- Item: local hooks plus CI create a layered defense against agent mistakes
- Item: Playwright smoke tests were immediately useful and caught a real selector mistake during setup
- Item: a persistent lessons file gives later sessions a repo-native memory source

## What Did Not Work
- Item: the first smoke-test selector was too ambiguous and failed under strict Playwright matching
- Item: hook enforcement depends on local installation and is not self-activating across fresh clones

## Standards To Update
- Standard: future UI work should expand Playwright coverage alongside visible interaction changes
- Standard: every finished feature that teaches a durable lesson should update `autonomous-sdlc/lessons.md`

## Follow-up Actions
- Action: turn on required status checks in GitHub branch protection
- Action: add screenshot or flow-level browser coverage for important user journeys
