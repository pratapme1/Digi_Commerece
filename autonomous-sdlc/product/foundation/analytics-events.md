# Analytics Events

## Principles
- Events are session-scoped first, then rolled up to the space level.
- Anonymous spaces store aggregate behavior only.
- Identified spaces may attach a privacy-safe attendee reference, not a marketing profile.
- Analytics must support both the live panel and the post-session summary from the same event stream.

## Host Events
- `space_created`
- `brand_profile_assigned`
- `session_scheduled`
- `session_started`
- `session_extended`
- `session_ended`
- `featured_item_changed`
- `content_hidden`
- `announcement_sent`
- `import_submitted`
- `import_validated`

## Attendee Entry Events
- `qr_opened`
- `session_bootstrap_loaded`
- `entry_screen_viewed`
- `identity_submitted`
- `identity_skipped`
- `presence_registered`
- `returning_attendee_resumed`

## Engagement Events
- `space_overview_viewed`
- `search_started`
- `search_result_opened`
- `collection_opened`
- `card_viewed`
- `content_saved`
- `pin_received`
- `pin_dismissed`
- `offline_save_queued`
- `offline_state_shown`
- `session_end_viewed`

## Required Dimensions
- `space_id`
- `session_id`
- `surface` (`host` or `attendee`)
- `space_mode` (`identified` or `anonymous`)
- `collection_id` when relevant
- `card_id` when relevant
- `timestamp`
- `attendee_ref` only when the space mode allows it

## Derived Metrics
- Total scans
- Unique identified attendees
- Anonymous attendee count
- Collection views and opens
- Card saves by type
- Top content by views
- Top content by saves
- Peak scan windows
- Save rate by session

## Exclusions
- No destination-app tracking after the native share sheet opens
- No persistent attendee-side history across sessions
- No individual behavior profiling in anonymous spaces
