# Implementation Plan: 003 Guardrails And Learning

## Summary
Implement guardrails at three levels: local git hooks, repository scripts, and GitHub CI. Keep the checks lightweight enough to run often, but strong enough to catch missing feature context, failed smoke tests, and attempts to push directly to `main`.

## Architecture
- Key approach: combine staged-file policy checks, pre-push quality gates, Playwright browser tests, and a durable lessons file
- Why this shape: it creates defense in depth without requiring a large app framework
- Rejected alternative: relying on documentation and human discipline alone

## Touched Areas
- Files: `package.json`, `playwright.config.ts`, `tests/e2e/`, `.githooks/`, `autonomous-sdlc/scripts/`, `autonomous-sdlc/knowledge/`, `.github/workflows/repository-checks.yml`, repo docs
- Docs: contributor guide, autonomous SDLC README, workflow docs
- External dependencies: `@playwright/test`

## Research Notes
- Finding: the current prototypes are stable enough for smoke tests based on titles, nav state changes, and a small number of interactive controls.
- Finding: local git hooks are the most reliable way to stop accidental direct pushes or context-free commits before GitHub ever sees them.

## Implementation Slices
1. Add Node/Playwright tooling and smoke tests.
2. Add local hooks and quality-gate scripts.
3. Add lessons memory and session-start flow, then update docs and CI.

## Test And QA Plan
- Local checks: `npm install`, `npx playwright install chromium`, `npm run hooks:install`, `npm run verify`
- Manual checks: confirm hooks install, inspect new docs, review lessons memory and session-start output

## Rollout And Rollback
- Rollout: install hooks locally and require PR flow for future branches
- Rollback: remove `.githooks/`, Playwright tooling, and the related scripts if a simpler process is preferred

## Approval
- Status: approved
- Approved by: local implementation pass
- Date: 2026-04-04
