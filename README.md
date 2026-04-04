# Digi_Commerece

This repository currently contains product prototypes and an autonomous software delivery scaffold.

## Current Contents
- `spaces_final.html`: guest or member-side prototype
- `spaces_host.html`: host-side prototype
- `spaces_prd.docx`: product requirements document
- `spaces_ux_guide.docx`: UX guidance
- `autonomous-sdlc/`: repo-local operating system for agentic delivery

## Local Preview
Serve the repository root and open the HTML prototypes in a browser:

```bash
python3 -m http.server 8000
```

## Autonomous Workflow
Start new work with a feature workspace:

```bash
bash autonomous-sdlc/scripts/new_feature.sh booking-flow "Booking Flow"
```

Validate the repository or a feature workspace:

```bash
bash autonomous-sdlc/scripts/validate_repo.sh
bash autonomous-sdlc/scripts/check_feature.sh autonomous-sdlc/features/001-booking-flow
npm run verify
```

## GitHub Integration
GitHub templates and workflow files live in `.github/`. Branch protection and repository rules are documented in `autonomous-sdlc/governance/github-repo-settings.md`.

## Hooks And Session Continuity
Install local hooks with `npm run hooks:install`. Start future sessions with `npm run session:start` so the current lessons and open feature workspaces are loaded before development begins.
