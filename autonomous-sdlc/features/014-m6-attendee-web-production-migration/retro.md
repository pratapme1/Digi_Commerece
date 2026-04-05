# Retrospective: 014 M6 Attendee Web Production Migration

## What Worked
- Item: moving the attendee behavior into `@digi/domain` before building the Next.js app kept the new UI aligned with the original prototype instead of rewriting the product logic from scratch.
- Item: a `postMessage` bridge preserved local host-to-attendee integration tests even after the attendee route moved onto a different origin and stack.

## What Did Not Work
- Item: early browser tests used overly broad selectors because the real app intentionally exposes the same action in more than one place during pinned states.
- Item: the first host integration test opened the attendee tab before hydration had settled, which made the click flow flaky until the helper stabilized the tab after load.

## Standards To Update
- Standard: when migrating a prototype route into a real app, add the new build step and browser coverage before claiming the milestone is closed.
- Standard: when demo verification crosses origins, prefer explicit message contracts over implicit browser-storage tricks.

## Follow-up Actions
- Action: define the next milestone that moves attendee-facing content from preset data into imported and host-managed content entities.
- Action: add deployment wiring for the attendee app base URL in non-local environments.
