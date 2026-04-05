# ADR 001: Split-Surface Product Stack

## Status
- Accepted
- Date: 2026-04-04

## Context
The product shape is already locked at a high level:
- attendee surface is a QR-driven PWA
- host surface is a native mobile app
- both surfaces share sessions, content, presence, and analytics

The repo started as static prototypes, but real implementation now needs a durable application stack.

## Decision
- Use a Node and TypeScript monorepo.
- Build the attendee surface in Next.js App Router.
- Build the host surface in Flutter.
- Use Supabase for Postgres, Auth, Storage, Edge Functions, and Realtime.

## Why
- This matches the locked product shape instead of forcing one UI technology across fundamentally different surfaces.
- Flutter matches the requirement for one native host codebase that targets both Android and iOS without relying on a web-export fallback.
- Next.js is the strongest web-first choice for the attendee PWA and fits QR-driven web deployment cleanly.
- Supabase minimizes custom backend overhead while still supporting the data and live-session model.

## Consequences
- The repo will contain at least two deployable apps.
- Shared logic must live in packages, not in a single universal UI tree.
- Realtime access rules and session token design become important early.

## Alternatives Considered
- One universal Expo app for both host and attendee
- React Native or Expo for the host app
- Custom backend before proving the v1 product
