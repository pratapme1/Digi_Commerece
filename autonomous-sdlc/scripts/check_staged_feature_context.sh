#!/usr/bin/env bash
set -euo pipefail

mapfile -t staged_files < <(git diff --cached --name-only --diff-filter=ACMR)

if (( ${#staged_files[@]} == 0 )); then
  exit 0
fi

mapfile -t staged_feature_files < <(printf '%s\n' "${staged_files[@]}" | grep -E '^autonomous-sdlc/features/[0-9]{3}-[^/]+/' || true)

if printf '%s\n' "${staged_files[@]}" | grep -Eq '^autonomous-sdlc/features/[0-9]{3}-[^/]+/retro\.md$' && \
   ! printf '%s\n' "${staged_files[@]}" | grep -Eq '^autonomous-sdlc/knowledge/lessons\.md$'; then
  echo "A staged retro requires a staged update to autonomous-sdlc/knowledge/lessons.md." >&2
  exit 1
fi

mapfile -t staged_feature_dirs < <(printf '%s\n' "${staged_feature_files[@]}" | sed -E 's#^(autonomous-sdlc/features/[0-9]{3}-[^/]+).*#\1#' | sort -u)

for feature_dir in "${staged_feature_dirs[@]}"; do
  bash autonomous-sdlc/scripts/check_feature.sh "$feature_dir" >/dev/null
done

mapfile -t non_feature_files < <(printf '%s\n' "${staged_files[@]}" | grep -Ev '^autonomous-sdlc/features/[0-9]{3}-[^/]+/' || true)

if (( ${#non_feature_files[@]} > 0 )) && (( ${#staged_feature_dirs[@]} == 0 )); then
  echo "Staged implementation or repo changes require a staged feature workspace update." >&2
  echo "Create or update a feature folder under autonomous-sdlc/features/ and stage it in the same commit." >&2
  exit 1
fi
