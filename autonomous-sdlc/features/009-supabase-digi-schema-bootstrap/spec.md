# Feature Spec: 009 Supabase Digi Schema Bootstrap

## Summary
Prepare the Supabase side of the repo for the first real database change and add the `"Digi"` application schema migration. Attempt the remote apply with the provided `.env`, and if the credentials are insufficient, record the exact blocker instead of claiming the schema was created.

## Problem
The repo has no tracked Supabase migration path yet, and the requested `"Digi"` schema does not have a safe, repeatable way to be created from source control. The current `.env` also lacks a direct database credential, so remote SQL execution may not be possible from the available secrets alone.

## Outcome
The repository should contain a tracked migration for the `"Digi"` schema, local environment files should stay out of Git, and the remote execution status should be documented with evidence rather than assumed.

## Users And Surfaces
- Primary users: maintainers bootstrapping the real Supabase-backed product stack
- Touched files or surfaces: `.gitignore`, `supabase/`, feature workspace `009`

## Scope
- In scope:
  - create the initial `supabase/` migration path
  - add a migration that creates schema `"Digi"`
  - verify whether the current `.env` can apply the change remotely
  - document the remote blocker if the available credentials are insufficient
- Out of scope:
  - adding full Supabase CLI project config
  - creating tables inside `"Digi"`
  - provisioning Supabase infrastructure from code in this step

## Acceptance Criteria
- [x] The repo contains a tracked SQL migration that creates schema `"Digi"`.
- [x] Local `.env` files are ignored by the repository.
- [x] The remote apply path is verified against the provided `.env`, and the result is documented accurately.

## Risks
- Risk: the provided `.env` may not contain enough privilege to execute arbitrary SQL remotely

## Clarifications
- Open question: remote schema creation still requires a direct Postgres credential or Supabase management credential beyond the current `.env`

## Approval
- Status: approved
- Approved by: supabase bootstrap pass
- Date: 2026-04-04
