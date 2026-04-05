# ADR 002: Managed Delivery Topology

## Status
- Accepted
- Date: 2026-04-04

## Context
The team needs a delivery model that supports:
- fast attendee web deployment and rollback
- native host builds and internal QA distribution
- environment-specific data isolation
- small-team operational overhead

## Decision
- Deploy the attendee PWA on Vercel.
- Use EAS Build, EAS Submit, and EAS Update for the host app.
- Use managed Supabase projects for development, staging, and production.
- Use GitHub Actions plus protected environments as the CI/CD control plane.
- Use Sentry plus platform logs for observability.

## Why
- Vercel creates a deployment URL per successful build and provides rollback for production deployments.
- Expo’s EAS toolchain is the cleanest release path for React Native in this product shape.
- Supabase projects give clear environment boundaries for data, auth, and functions without custom platform engineering up front.
- GitHub environments provide reviewer gates for staging and production jobs.

## Consequences
- The team depends on several managed services rather than one self-hosted platform.
- Secrets and environment configuration must be disciplined across GitHub, Vercel, Expo, and Supabase.
- Release runbooks must cover web, mobile, and schema changes separately.

## Alternatives Considered
- Self-hosting web and backend from day one
- Manual mobile release handling without EAS
- One production environment with no staging isolation
