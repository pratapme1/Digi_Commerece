# Stack Decision

## Status
- Decision status: approved for v1 pilot
- Decision date: 2026-04-04
- Last verified against official docs: 2026-04-04
- Required before: `M2 Host App Core Setup And Go Live`

## Product Constraints Already Locked
- Attendee surface is a zero-install PWA.
- Host surface is a native mobile app.
- Shared system must support spaces, sessions, content cards, presence, saves, and analytics.
- Live behavior includes pinning, expiry, session end, and later host controls.

## Decisions To Lock
- Monorepo and language: `pnpm` workspaces with end-to-end TypeScript
- Attendee app stack: `Next.js 16 App Router` on React and TypeScript
- Host app stack: `Expo SDK 55` + `React Native` New Architecture + `Expo Router`
- Backend runtime: `Supabase Edge Functions` for privileged commands and webhook-style logic
- Primary database: `Supabase Postgres`
- File or asset storage: `Supabase Storage`
- Auth provider and session model:
  - hosts: `Supabase Auth` with phone OTP
  - attendees: short-lived guest session token minted per live session; no account
- Realtime transport: `Supabase Realtime` private channels with Broadcast + Presence for v1
- Hosting platform:
  - attendee PWA: `Vercel`
  - host mobile distribution: `EAS Build`, `EAS Submit`, and `EAS Update`
  - data platform: managed `Supabase` projects per environment
- Observability: `Sentry` for web and mobile errors plus platform logs from Vercel, Expo, and Supabase

## Evaluation Criteria
- Supports the locked product shape without workarounds.
- Keeps QR entry fast on mid-range phones.
- Keeps host live controls low-latency and predictable.
- Fits a small team operating one codebase.
- Has a clear path to CI/CD, staging, and rollback.

## Why This Stack
- `Next.js App Router` is the strongest web-first choice for the attendee PWA because the official docs position it as the current file-system router using React server features, and it gives the team a mature deployment path on Vercel for QR-driven web entry.
- `Expo` is the fastest credible path for the host native app. Official Expo docs show `EAS Build` as the standard route from Expo or React Native projects to installable Android and iOS binaries, with internal distribution and first-class support for `expo-updates`.
- `Expo Router` keeps the host app on a routing model that supports deep links and URL-like addresses across platforms while staying inside the Expo ecosystem.
- `Supabase` gives the smallest managed surface area that still covers relational data, auth, storage, functions, and realtime in one platform. That is a better fit for the current team and repo than introducing a heavier custom backend too early.
- `Vercel` is the cleanest deployment target for the attendee web surface because every deployment gets a URL automatically and the platform supports fast rollback to a previous production deployment.
- `Sentry` gives one cross-surface error and tracing tool that supports both Next.js and React Native.

## Rejected Alternatives
- `Expo web` for the attendee surface:
  - Rejected because the attendee experience is web-first and should optimize for browser semantics, installability, and web deployment rather than maximizing shared UI code with the host app.
- Bare React Native or Flutter for the host app:
  - Rejected because Expo plus EAS reduces release friction without changing the product shape.
- Custom backend before proving product demand:
  - Rejected because it adds more operational burden than the current phase justifies.
- Dedicated realtime infrastructure on day one:
  - Rejected for now because Supabase Realtime is sufficient for the v1 pilot if access is kept private and payloads stay minimal.

## Known Risks And Mitigations
- Risk: Supabase Realtime Authorization is still `public beta`.
  - Mitigation: use private channels only, keep payloads non-sensitive, enforce RLS on `realtime.messages`, keep JWT lifetimes short, and treat migration to a dedicated session coordinator as a named future option if latency or authorization limits show up in staging.
- Risk: two separate frontend apps increase surface area.
  - Mitigation: share domain types, event contracts, design tokens, and validation logic from workspace packages rather than forcing one UI stack across both surfaces.
- Risk: host auth depends on OTP delivery quality in India.
  - Mitigation: start with Supabase phone OTP and Twilio Verify, validate delivery and resend behavior in staging, and leave provider replacement isolated to the auth configuration layer.

## Notes
- The current HTML prototypes and Playwright setup are implementation scaffolds, not proof of the final production stack.
- This decision is intentionally optimized for a v1 pilot and a small team. It is not a permanent commitment to avoid future service extraction.

## Source Checks
- Next.js App Router docs, last updated March 31, 2026: `https://nextjs.org/docs/app`
- Expo Router product page: `https://expo.dev/router`
- EAS Build docs, updated 2026: `https://docs.expo.dev/build/introduction/`
- Expo Updates and EAS Update docs, updated 2026: `https://docs.expo.dev/versions/latest/sdk/updates/` and `https://docs.expo.dev/build/updates/`
- Supabase Auth docs: `https://supabase.com/docs/guides/auth`
- Supabase Phone Login docs: `https://supabase.com/docs/guides/auth/phone-login`
- Supabase Database overview: `https://supabase.com/docs/guides/database/overview`
- Supabase Storage docs: `https://supabase.com/docs/guides/storage`
- Supabase Realtime Broadcast, Presence, and Authorization docs: `https://supabase.com/docs/guides/realtime/broadcast`, `https://supabase.com/docs/guides/realtime/presence`, `https://supabase.com/docs/guides/realtime/authorization`
- Vercel deployment and rollback docs: `https://vercel.com/docs/concepts/get-started/deploy` and `https://vercel.com/docs/instant-rollback`
- Sentry docs for Next.js and React Native: `https://docs.sentry.io/platforms/javascript/guides/nextjs/` and `https://docs.sentry.io/platforms/react-native/`
