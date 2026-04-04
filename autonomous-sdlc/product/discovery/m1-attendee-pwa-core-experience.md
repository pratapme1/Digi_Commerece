# Phase Discovery: M1 Attendee PWA Core Experience

## Phase
- Name: M1 Attendee PWA Core Experience
- Owner: orchestrator
- Target milestone: `M1`

## Objective
- Ship the complete attendee entry and browsing flow for a live space, including the mandatory edge states that turn the prototype into a coherent attendee journey.

## Inputs
- `spaces_prd.docx`
- `spaces_ux_guide.docx`
- `spaces_final.html`
- `autonomous-sdlc/lessons.md`
- `autonomous-sdlc/product/foundation/gap-map.md`
- `autonomous-sdlc/product/foundation/route-map.md`
- `autonomous-sdlc/product/foundation/session-lifecycle.md`
- `autonomous-sdlc/product/foundation/analytics-events.md`

## Current-State Evidence
- `spaces_final.html` already proves high-quality rendering patterns for business cards, menus, product views, and save-oriented content cards.
- The current attendee prototype does not yet present the real session journey: no QR entry state, no identified-name step, no multi-format overview, no search-results state, and no expiry or ended-state flow.
- The PRD fixes the attendee model: QR scan opens a PWA, no account creation, identified spaces request only a name, saving uses the native share sheet, and saved content persists after the session ends.
- The UX guide makes the missing attendee states explicit: entry, identified name entry, grouped overview, active search, host pin notification, skeleton loading, empty space, expiry warning, expired state, and offline behavior.
- M0 already defined the logical attendee route states, session lifecycle, and analytics event vocabulary that M1 must use.

## Locked Decisions
- Attendee surface is a browser-based PWA, not a native app.
- Zero-install and zero-account remain non-negotiable for v1.
- Identified versus anonymous behavior is controlled by the host per space.
- Save behavior uses the phone's native share sheet, and Spaces does not become the saved-content destination.
- Sessions are ephemeral by default; attendees lose unsaved live access after the session ends.
- Search is instant from local cache, with no loading spinner during active search.

## Open Questions
- Whether the first implementation pass should keep all M1 work inside `spaces_final.html` or split into a more application-like file structure.
- How much of the offline queueing behavior can be represented faithfully before a real service worker implementation exists.
- Whether `live-spotlight` in M1 includes only pinned item presentation or also the full live-event timeline described in the UX guide.
- How returning-attendee resume state should be represented in the prototype before a persistent session store exists.

## Dependencies And Contracts
- Depends on M0 route states: `scan-bootstrap`, `entry-screen`, `name-entry`, `space-overview`, `search-results`, `live-spotlight`, `expiry-warning`, and `session-ended`.
- Depends on M0 session rules for draft, live, ending, and ended states.
- Depends on M0 analytics events for `qr_opened`, `entry_screen_viewed`, `identity_submitted`, `identity_skipped`, `space_overview_viewed`, `search_started`, `collection_opened`, `card_viewed`, `content_saved`, `pin_received`, and `session_end_viewed`.
- Shares live-state expectations with later host milestones, especially pinning and session-end behavior.
- Will likely touch `spaces_final.html`, Playwright smoke coverage, and feature artifacts first.

## GitHub Reference Scan
- Highest-star relevant references reviewed on 2026-04-04: `facebook/react-native`, `shadcn-ui/ui`, `mui/material-ui`, `ant-design/ant-design`, `ionic-team/ionic-framework`, `expo/expo`, `chakra-ui/chakra-ui`, `radix-ui/primitives`, `callstack/react-native-paper`, `wix/react-native-ui-lib`, and `CRED-CLUB/neopop-web`.
- The attendee surface should not inherit the visual language of generic SaaS libraries such as Material UI, Ant Design, or Chakra UI. Those repos are useful for coverage of states and patterns, but not for the final look of Spaces.
- The strongest fit for attendee interaction behavior comes from mobile-first frameworks and primitives: `ionic-framework` for native-feeling PWA shell behavior, `radix-ui/primitives` for accessible interaction patterns, and `shadcn/ui` for composable stateful component structure.
- The strongest fit for the host app comes from `react-native`, `expo`, `react-native-paper`, and `react-native-ui-lib`, but those references should influence the host milestone later rather than M1 visual direction.
- `neopop-web` is a lower-star niche reference, but it is worth noting as an India-first mobile design system with assertive motion. It is a secondary influence, not the main visual model for Spaces.

## UI Direction From Research
- Keep the attendee UI bespoke and editorial, as defined in the product docs, rather than adopting a library-branded look.
- Build the attendee flow as an edge-to-edge, single-task mobile experience with one primary action per state.
- Prefer grouped lists, full-width hero content, and inline or overlay state changes over dashboard-style chrome.
- Treat skeletons, offline messaging, expiry strips, and ended-state overlays as first-class parts of the experience, not fallback afterthoughts.
- Keep motion short and functional: entry, pin, and expiry transitions should feel native, not decorative.

## Risks
- Delivery risk: M1 can sprawl if product-complete attendee behavior is mixed with future host or realtime infrastructure work.
- UX risk: current prototype screens may encourage screen-by-screen patching instead of building the intended session journey.
- Data or analytics risk: if entry, search, and save events are not scoped cleanly, later host summaries will become inconsistent.

## Exit To Planning
- [x] Discovery evidence captured
- [x] Open questions reduced to acceptable risk
- [x] Touched surfaces and dependencies named
- [x] Acceptance direction is clear enough for `spec.md` and `plan.md`
