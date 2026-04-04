# Repository Guidelines

## Project Structure & Module Organization
The root currently contains the two HTML prototypes, `spaces_final.html` and `spaces_host.html`, plus product docs `spaces_prd.docx` and `spaces_ux_guide.docx`. The new `autonomous-sdlc/` folder is the operating system for delivery work: `standards/` holds repo rules, `agents/` defines role responsibilities, `workflows/` documents each phase, `templates/` stores artifact templates, `features/` holds numbered workspaces such as `001-booking-flow`, and `scripts/` contains helper commands. GitHub issue and PR templates live in `.github/`.

## Build, Test, and Development Commands
There is still no package manager or app build pipeline in this workspace. Use these commands from the repo root:

```bash
python3 -m http.server 8000
bash autonomous-sdlc/scripts/new_feature.sh booking-flow "Booking Flow"
bash autonomous-sdlc/scripts/check_feature.sh autonomous-sdlc/features/001-booking-flow
bash autonomous-sdlc/scripts/validate_repo.sh
npm run verify
```

The first command serves the prototypes locally. The second creates a complete feature workspace. The third validates one feature workspace. The fourth validates repository-level GitHub and workflow wiring. The fifth runs the full quality gates, including Playwright browser smoke tests.

## Coding Style & Naming Conventions
Use 2-space indentation in HTML, CSS, JavaScript, Markdown, and shell scripts. Keep filenames lowercase; root prototype files use underscores, while feature workspaces use a three-digit prefix plus slug, for example `002-host-onboarding`. Prefer semantic class names and organize inline CSS and scripts by screen or feature.

## Testing Guidelines
Playwright smoke tests now cover both HTML prototypes, but manual browser validation is still required for visible UI changes. Verify both prototypes, core interactions, and mobile-sized layouts, then record evidence in the feature workspace `qa-report.md`. Run `npm run verify` before handoff or push.

## Commit & Pull Request Guidelines
Git is now initialized locally. Use short imperative commit subjects such as `Refine host dashboard card states`. Install hooks with `npm run hooks:install`. The hooks block commits that lack feature-context updates and block direct pushes to `main`. Open pull requests with the template in `.github/pull_request_template.md`, link the relevant feature workspace artifacts, summarize risk, and include screenshots or recordings for visible UI changes.

## Security & Configuration Tips
Do not embed secrets, private endpoints, or unsafe third-party scripts in prototypes or docs. Treat any future auth, payments, uploads, or personal-data work as high-risk and route it through the approval gates documented in `autonomous-sdlc/governance/approval-matrix.md`.
