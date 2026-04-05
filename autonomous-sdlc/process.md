# Delivery Process

This file replaces the older role, standards, workflow, and governance folders.

## Constitution
1. Specs before code.
2. Repo-specific context before autonomy.
3. Evidence before decisions.
4. Small, reversible changes.
5. Verification before merge.
6. Security and privacy by default.
7. Leave reusable memory behind.

## Repo Rules
- Treat `spaces_prd.docx` and `spaces_ux_guide.docx` as the product source material.
- Treat the root HTML files as prototypes; production-oriented work should follow the approved stack and delivery rules in `autonomous-sdlc/product/architecture/`.
- Use 2-space indentation in HTML, CSS, JavaScript, Markdown, and shell scripts.
- Keep filenames lowercase. Root prototypes use underscores; feature workspaces use `NNN-slug`.
- Preserve the current premium, mobile-first visual direction unless the spec says otherwise.
- Validate affected prototypes and app surfaces after visible changes and record evidence in `qa-report.md`.
- Do not commit secrets, private endpoints, or unsafe third-party scripts.
- Treat auth, payments, uploads, personal data, and production-impacting changes as high-risk.

## Workflow
1. Intake
   - Read `autonomous-sdlc/lessons.md`.
   - For major product work, read `autonomous-sdlc/product/design-approach.md`, `milestones.md`, and `backlog.md`.
   - Start a discovery brief before milestone-sized work.
2. Discover and Spec
   - Inspect current behavior, product docs, and affected files.
   - Write or update `spec.md` with scope, non-goals, and testable acceptance criteria.
3. Architecture and Stack Gate
   - Required before `M2` or any milestone that chooses a real frontend, backend, database, auth, realtime, infrastructure, or deployment model.
   - Fill the documents in `autonomous-sdlc/product/architecture/`.
   - Record major technical decisions as ADRs.
4. Plan and Research
   - Confirm discovery is complete enough to plan.
   - Write `plan.md` with approach, touched areas, risks, and test strategy.
5. Implement
   - Work from `tasks.md`.
   - Make thin slices and validate after each slice.
6. Verify and Fix
   - Prove acceptance criteria with local checks and manual QA.
   - Record evidence and residual risk in `qa-report.md`.
7. Release and Learn
   - Update `release-notes.md` and `retro.md`.
   - Promote durable lessons into `autonomous-sdlc/lessons.md`.

## Roles
- `orchestrator`: owns flow, artifacts, and handoffs
- `researcher`: resolves unstable or external facts
- `architect`: turns scope into a low-risk design
- `builder`: implements from `tasks.md` in reversible slices
- `qa`: validates behavior, regressions, and residual risk
- `release-manager`: prepares merge, rollout, and follow-up notes

## Approval Gates
- Autonomous by default:
  - read repository files
  - create or update feature artifacts
  - make low-risk code and documentation edits
  - run local validation commands
  - perform targeted research on unstable dependencies
- Requires human approval:
  - dependency additions or major upgrades
  - production stack selection or major architecture changes
  - destructive file or history operations
  - schema, infrastructure, deployment, or credential changes
  - security-sensitive features such as auth, payments, uploads, or personal data handling
  - milestone-order changes or large product-scope tradeoffs
  - merge and release decisions
- Mandatory gates:
  1. Discovery gate for major phases
  2. Architecture gate for production-oriented work
  3. Spec gate
  4. Plan gate
  5. Verification gate
  6. Release gate

## Automation Rules
- Local hooks may block context-free commits and unsafe pushes.
- CI should validate the same core checks as local quality gates.
- Repository automation should summarize, gate, and report more often than it mutates files.
- Do not let unattended automation merge high-risk work.
