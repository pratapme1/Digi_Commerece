# Product Planning

Use this folder before starting any major product phase.

## Working Order
1. Read `design-approach.md` to understand the locked product shape.
2. Read `milestones.md` to see the current delivery order and exit criteria.
3. Pull the next ready items from `backlog.md`.
4. Start the phase with `discovery-template.md` or the matching discovery brief in `discovery/`.
5. Before `M2` or any real app-stack work, complete the architecture gate in `architecture/`.
6. For `M0`, read the shared contracts in `foundation/`.
7. Open or update the matching feature workspace in `autonomous-sdlc/features/`.

## Folder Map
- `discovery/`: completed milestone discovery briefs
- `foundation/`: shared product contracts produced by `M0`
- `architecture/`: required stack, system design, security, infrastructure, and deployment decisions before production-oriented milestones

## Source Documents
- `spaces_prd.docx`
- `spaces_ux_guide.docx`
- `spaces_final.html`
- `spaces_host.html`

## Rule
Every milestone starts with discovery. No milestone should move into implementation until the discovery brief, spec, and plan all agree on scope, dependencies, and success criteria. No production-oriented milestone should move forward until the architecture gate is complete.
