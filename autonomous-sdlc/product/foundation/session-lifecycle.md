# Session Lifecycle

## States

### Draft
- Default state after space creation
- QR target exists, but attendee scans see a not-live message
- Host can edit content, assign a featured item, and choose duration defaults

### Scheduled
- Optional pre-live state when the host chooses a future start time
- QR remains inactive until the scheduled start
- Host should receive a reminder before activation

### Live
- Starts when the host confirms `Go Live`
- QR becomes active immediately
- Attendee scans open the entry flow and cache current session content
- Host may pin, hide, announce, extend, or manually end the session

### Ending
- Lightweight transition when the timer is close to expiry or the host initiates an end action
- Attendees may see the five-minute warning or equivalent end-state preparation

### Ended
- Reached on timer expiry or manual end
- Attendee receives a clean end screen rather than a broken or blank state
- Host receives the session summary with views, saves, scans, and attendee metrics

## Transition Rules
- `draft -> scheduled`: host chooses future activation
- `draft -> live`: host confirms immediate `Go Live`
- `scheduled -> live`: scheduled time is reached or host starts early
- `live -> live`: duration extension keeps the same session active
- `live -> ended`: timer expires or host ends session
- `ended -> live`: a new session starts from the same space, creating a new session record

## Behavioural Rules
- A space is permanent; sessions are temporary activations of that space.
- Session state controls what the QR does. It does not change the QR target itself.
- Saved attendee content persists outside the session; unsaved live content does not.
- Returning attendees within the same live session resume from the active session context.
- A new session should feel fresh to attendees even if it reuses the same space and QR.
