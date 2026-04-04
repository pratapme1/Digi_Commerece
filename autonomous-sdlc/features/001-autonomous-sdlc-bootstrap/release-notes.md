# Release Notes: 001 Autonomous SDLC Bootstrap

## Summary
Added a repo-local autonomous software delivery system that future work can follow from intake through retrospective.

## Files And Surfaces
- File: `autonomous-sdlc/README.md`
- File: `autonomous-sdlc/constitution.md`
- File: `autonomous-sdlc/standards/`
- File: `autonomous-sdlc/agents/`
- File: `autonomous-sdlc/workflows/`
- File: `autonomous-sdlc/templates/`
- File: `autonomous-sdlc/scripts/`
- File: `.github/`
- File: `AGENTS.md`

## Verification Summary
- Evidence: helper scripts create and validate feature workspaces
- Evidence: contributor guidance now points to the new workflow
- Evidence: bootstrap feature artifacts demonstrate how the system is meant to be used

## Rollout
- Step: start all new work by creating a feature workspace with `new_feature.sh`
- Step: use `autonomous-sdlc/README.md` as the workflow entry point
- Step: keep specs, plans, tasks, QA, and retrospectives inside feature folders

## Rollback
- Step: remove `autonomous-sdlc/` and `.github/` if a different delivery system is chosen later
- Step: revert `AGENTS.md` to a lightweight contributor guide if the repo stays prototype-only

## Follow-ups
- Follow-up: initialize Git and wire real PR and CI automation when the repo is ready
- Follow-up: decide whether to adopt live GitHub Agentic Workflows for triage and CI diagnosis
