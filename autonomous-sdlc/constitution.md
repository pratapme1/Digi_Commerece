# Constitution

## 1. Specs Before Code
Do not start implementation until the problem, scope, and acceptance criteria are written down in `spec.md`.

## 2. Standards Before Autonomy
Agents must load relevant standards before making design or code decisions. Generic output is not acceptable when repo-specific patterns are known.

## 3. Evidence Before Decisions
Architecture, library, security, and performance decisions must be backed by codebase evidence, docs, or tests.

## 4. Small, Reversible Changes
Prefer thin vertical slices, incremental commits, and low-blast-radius edits over large rewrites.

## 5. Verification Before Merge
No feature is complete until implementation, QA evidence, and open risks are captured in the feature workspace.

## 6. Security And Privacy By Default
Never embed secrets, private URLs, or unsafe automation. High-risk actions require explicit approval.

## 7. Memory After Delivery
Every meaningful feature should leave behind reusable knowledge: updated standards, release notes, or retrospective learnings.
