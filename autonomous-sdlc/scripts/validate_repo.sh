#!/usr/bin/env bash
set -euo pipefail

script_dir="$(CDPATH= cd -- "$(dirname -- "$0")" && pwd)"
root_dir="$(CDPATH= cd -- "$script_dir/../.." && pwd)"

cd "$root_dir"

required_root_files=(
  "AGENTS.md"
  "README.md"
  "CONTRIBUTING.md"
  "SECURITY.md"
  "SUPPORT.md"
  ".github/pull_request_template.md"
  ".github/CODEOWNERS"
  ".github/workflows/repository-checks.yml"
)

missing=0
for path in "${required_root_files[@]}"; do
  if [[ ! -f "$path" ]]; then
    echo "Missing required file: $path" >&2
    missing=1
  fi
done

if (( missing )); then
  exit 1
fi

bash -n autonomous-sdlc/scripts/new_feature.sh
bash -n autonomous-sdlc/scripts/check_feature.sh
bash -n autonomous-sdlc/scripts/validate_repo.sh

for feature_dir in autonomous-sdlc/features/[0-9][0-9][0-9]-*; do
  if [[ -d "$feature_dir" ]]; then
    bash autonomous-sdlc/scripts/check_feature.sh "$feature_dir"
  fi
done

echo "Repository validation passed."

