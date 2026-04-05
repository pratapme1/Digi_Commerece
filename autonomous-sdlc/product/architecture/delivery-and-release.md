# Delivery And Release

## Status
- Decision status: approved for v1 pilot
- Decision date: 2026-04-04

## CI/CD Decisions To Lock
- build pipeline per surface:
  - attendee web checks and deploys through GitHub Actions plus Vercel
  - host mobile builds through GitHub Actions running Flutter checks and platform release commands
  - backend migrations and function deployment through GitHub Actions plus Supabase CLI
- test gates by branch and environment:
  - PRs must pass repository checks, type checks, tests, and Playwright attendee or host flows
  - staging and production deploy jobs use protected GitHub environments with reviewers
- artifact packaging and deployment path:
  - web deployments are created from Git commits
  - mobile preview builds are installable binaries
  - mobile production binaries are store submissions
- release approval model:
  - protected `main`
  - human approval for staging and production environments
- rollback steps:
  - web via Vercel rollback
  - mobile OTA via EAS Update channel rollback when runtime-compatible
  - database via forward fix or guarded rollback plan, not ad hoc manual edits

## Required Checks Before Production Work
- lint or static validation
- automated tests for core attendee and host journeys
- environment-aware deploy checks
- release evidence recorded in the repository

## Delivery Model
### Pull Requests
- Every change lands through a PR into `main`.
- Attendee web gets a preview deployment automatically.
- Production-impacting jobs should use GitHub environments with reviewers before they can proceed.

### Attendee Web Release
- PR merge to `main` creates the production web deployment.
- Production incidents can be reversed through Vercel rollback to a prior deployment.

### Host Mobile Release
- Internal QA builds use Flutter Android and iOS build jobs with installable artifacts.
- Production app-store submissions use `flutter build appbundle` for Android and `flutter build ipa` for iOS from a macOS runner.
- Mobile fixes always ship through a fresh binary or approved platform release path; there is no Expo OTA layer.

### Database And Functions
- Schema changes are versioned in the repository.
- Apply migrations to staging before production.
- Prefer backward-compatible migrations that can survive one deploy cycle before cleanup.

## Release Questions
- What ships from one repo versus multiple deliverables?
  - one monorepo, multiple deployables: attendee web, host mobile, database migrations, edge functions
- How are mobile builds versioned?
  - native binaries by semantic app version and build number
- How is the attendee PWA promoted between environments?
  - preview from PRs, staging from protected deploy job, production from protected `main`
- What is the minimum release checklist for pilot readiness?
  - green CI
  - migration review complete
  - staging signoff complete
  - rollback path named
  - release note and QA evidence committed

## Rule
Deployment is part of the system design. It cannot stay implicit once real app implementation begins.
