# Feature Workspaces

Each feature lives in its own numbered folder:

```text
autonomous-sdlc/features/001-example-feature/
```

Required files:
- `spec.md`
- `plan.md`
- `tasks.md`
- `qa-report.md`
- `release-notes.md`
- `retro.md`

Use `bash autonomous-sdlc/scripts/new_feature.sh <slug> "<Title>"` to create a new workspace.

For milestone-sized product work, start in `autonomous-sdlc/product/` first so the design approach, milestones, backlog, and discovery brief are aligned before implementation.
