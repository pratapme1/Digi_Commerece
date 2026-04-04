#!/usr/bin/env bash
set -euo pipefail

bash autonomous-sdlc/scripts/validate_repo.sh
npm run test:unit
npm run typecheck
npm run host:web:export
bash autonomous-sdlc/scripts/verify_supabase_schema.sh
npx playwright test
