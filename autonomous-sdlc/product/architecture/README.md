# Architecture Gate

Use this folder before any milestone that moves beyond prototype behavior into a real application stack.

## Purpose
- Turn product intent into an approved technical shape.
- Prevent framework, backend, database, auth, realtime, and deployment decisions from being made ad hoc during implementation.
- Make infrastructure and release expectations explicit before production-oriented coding starts.

## Current Baseline
- `M1A Architecture And Delivery Baseline` is complete for the v1 pilot.
- Approved stack:
  - attendee web: `Next.js 16 App Router` on `Vercel`
  - host mobile: `Expo SDK 55` + `React Native` + `Expo Router`
  - backend and data: `Supabase` Auth, Postgres, Storage, Edge Functions, and Realtime
  - observability: `Sentry` plus platform logs
- The detail lives in `stack-decision.md`, `system-overview.md`, `security-and-data.md`, `infrastructure-and-environments.md`, `delivery-and-release.md`, and the ADRs.

## Required Outputs
1. `stack-decision.md`
2. `system-overview.md`
3. `security-and-data.md`
4. `infrastructure-and-environments.md`
5. `delivery-and-release.md`
6. ADR records in `adrs/`

## Gate Rule
Do not start real app implementation for `M2` or later until these documents exist and the decision status inside them is no longer `pending`.

Prototype-only work may proceed without a locked production stack, but it must say so explicitly in the phase discovery brief and plan.

## Working Order
1. Read the latest product discovery and milestone docs.
2. Capture the architecture discovery brief in `../discovery/`.
3. Fill the required architecture documents in this folder.
4. Record major decisions as ADRs.
5. Update the feature workspace that introduced or changed the architecture gate.

## Scope
- frontend and mobile stack
- backend runtime and service shape
- data model, database, and storage choices
- auth and identity approach
- realtime transport
- infrastructure, environments, secrets, and observability
- CI/CD, deployment, rollback, and release evidence
