#!/usr/bin/env bash
set -euo pipefail

branch="$(git branch --show-current)"

if [[ "$branch" == "main" ]]; then
  echo "Direct pushes to main are blocked. Push a feature branch and open a pull request." >&2
  exit 1
fi

if [[ ! -d node_modules ]]; then
  echo "Missing node_modules. Run 'corepack pnpm install' and 'npx playwright install chromium' before pushing." >&2
  exit 1
fi

bash autonomous-sdlc/scripts/run_quality_gates.sh
