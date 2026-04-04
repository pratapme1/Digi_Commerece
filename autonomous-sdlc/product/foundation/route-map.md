# Route Map

These are logical flow states, not framework-specific URLs.

## Attendee States
1. `scan-bootstrap`
   - Trigger: QR scan opens the space link.
   - Outcome: session payload starts loading and cache warm-up begins.
2. `entry-screen`
   - Shows host logo, space name, verification badge, live status, and single `Enter Space` action.
   - If the session is not live, this state becomes the not-live or ended message instead of failing.
3. `name-entry`
   - Only for identified spaces.
   - Single-field name capture with optional skip.
4. `space-overview`
   - Shows the featured item, search entry, and collection tiles.
   - Falls back to empty-space messaging if no content is available.
5. `collection-view`
   - Shows the chosen collection as a browsable card stack or content list.
6. `search-results`
   - Shows grouped results from local cache as the attendee types.
7. `live-spotlight`
   - Temporary overlay or insertion state for host pin or announce actions.
8. `save-share`
   - Native share sheet handoff from a card save action.
9. `expiry-warning`
   - Lightweight warning state when five minutes remain.
10. `session-ended`
   - Clean end state after session expiry or manual end.

## Host States
1. `app-open`
   - Entry point with `Get Started` action.
2. `phone-entry`
   - Phone number capture with `+91` default.
3. `otp-verification`
   - OTP validation and resend flow.
4. `account-setup`
   - Business name and space type capture.
5. `space-creation`
   - First-run creation of a space before returning to the dashboard.
6. `brand-setup`
   - Logo, colours, and font selection with live preview.
7. `dashboard`
   - List of spaces, key metrics, and dominant `Go Live` action.
8. `space-editor`
   - Content editing, ordering, feature pinning, and preview.
9. `qr-screen`
   - Static QR display with download and copy actions.
10. `go-live-confirmation`
   - Duration selection, mode reminder, and session start confirmation.
11. `session-scheduling`
   - Future start-time configuration.
12. `live-panel`
   - Room glance state with attendee count, engagement summary, and pin or hide or announce controls.
13. `session-summary`
   - End-of-session metrics and next actions.
14. `analytics`
   - Longer-range space performance view.
15. `team-management`
   - Invite, role management, and pending invites.
16. `space-settings`
   - Space name, mode, duration, brand assignment, archive, and delete.

## Cross-Surface Rules
- First-run host flow lands in `space-creation`, not the long-term dashboard.
- Attendee states must degrade to clear not-live, empty, offline, or ended screens instead of generic errors.
- Host actions in `live-panel` can mutate attendee state without forcing page reloads.
- Session summary and analytics consume the same underlying event model; they differ by time horizon, not by data source.
