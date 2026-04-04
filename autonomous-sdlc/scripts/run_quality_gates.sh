#!/usr/bin/env bash
set -euo pipefail

bash autonomous-sdlc/scripts/validate_repo.sh
npx playwright test
