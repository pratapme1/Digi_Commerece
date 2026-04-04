# GitHub Repository Settings

Apply these settings once the remote repository exists.

## Default Branch
- Set the default branch to `main`.

## Branch Protection For `main`
- Require pull requests before merging.
- Require at least 1 approval.
- Dismiss stale approvals when new commits are pushed.
- Require conversation resolution before merging.
- Require status checks before merging.
- Require linear history.
- Disable force pushes.
- Disable branch deletion.

## Merge Strategy
- Enable squash merge.
- Disable merge commits unless there is a strong reason to preserve them.

## Recommended Checks
- `Repository Checks / validate`
- Add Playwright quality checks through the same workflow and mark them as required before merge.

## Ownership
- Keep `.github/CODEOWNERS` in sync with the actual maintainers.

## Security
- Enable secret scanning if available.
- Add a repository security policy.

## Optional Agentic Automation
- Use the `.github/workflows/*.md` files as the starting point for GitHub Agentic Workflows if `gh aw` is enabled on the repo.
