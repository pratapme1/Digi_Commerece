# Domain Model

## Core Entities

### Account
- Owns spaces, brand profiles, team members, and API credentials
- Primary identity is phone number with OTP verification
- Verification tier is `phone_verified` or `business_verified`

### Team Member
- Belongs to one account
- Role is `admin`, `editor`, or `viewer`
- Access is constrained by role, not by separate workspace ownership

### Brand Profile
- Belongs to one account
- Stores logo, primary colour, secondary colour, and selected font
- Is assigned at the space level and inherited by all attendee-facing content in that space

### Space
- Permanent container for a host-controlled experience
- Has one static QR target, one selected brand profile, one mode (`identified` or `anonymous`), and a default session duration
- Contains ordered collections and content definitions even when no session is live

### Collection
- Ordered group shown to attendees as a tile or content bucket
- Belongs to one space
- Holds one or more content cards and can expose a featured card to the overview

### Content Card
- Rendered as one of six fixed types: `contact`, `offer`, `product`, `image`, `information`, or `menu`
- Has a schema determined by card type, not by arbitrary rich text
- Can be visible, hidden, or featured within the current session context

### Session
- Time-bound activation of a space
- Belongs to one space and references the content visible during that live window
- Tracks status, start time, end time, duration, and live controls such as pinning or announcements

### Attendee Visit
- Represents one attendee entering one session
- Stores anonymous or identified presence depending on space mode
- Can resume within an active session without creating attendee-side account history

### Save Action
- Represents an attendee saving a card through the native share flow
- Is counted for analytics but does not store the attendee's chosen destination app

### Analytics Event
- Append-only record tied to a space and session
- Carries event type, timestamp, surface, card or collection context, and privacy-safe attendee reference

## Relationships
- One `account` has many `brand_profiles`, `spaces`, and `team_members`.
- One `space` uses one `brand_profile` and has many `collections` and `sessions`.
- One `collection` has many `content_cards`.
- One `session` has many `attendee_visits` and many `analytics_events`.
- One `content_card` can produce many `save_actions` across sessions.

## Invariants
- A space QR is permanent, but session availability is not.
- Attendee access is always scoped to the active session, not the space forever.
- Identified spaces may show named attendees to hosts; anonymous spaces must stay aggregate-first.
- Brand is applied at the space level and should not be overridden per card.
- Analytics must support session summaries without creating attendee-side persistent profiles.
