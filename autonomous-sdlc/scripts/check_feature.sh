#!/usr/bin/env bash
set -euo pipefail

if [[ $# -ne 1 ]]; then
  echo "Usage: bash autonomous-sdlc/scripts/check_feature.sh <feature-directory>" >&2
  exit 1
fi

feature_dir="$1"

if [[ ! -d "$feature_dir" ]]; then
  echo "Error: feature directory not found: $feature_dir" >&2
  exit 1
fi

required_files=(
  "spec.md"
  "plan.md"
  "tasks.md"
  "qa-report.md"
  "release-notes.md"
  "retro.md"
)

missing=0
for file in "${required_files[@]}"; do
  if [[ ! -f "$feature_dir/$file" ]]; then
    echo "Missing: $feature_dir/$file" >&2
    missing=1
  fi
done

if (( missing )); then
  exit 1
fi

checks=(
  "spec.md:^# Feature Spec:"
  "spec.md:^## Acceptance Criteria$"
  "plan.md:^# Implementation Plan:"
  "plan.md:^## Implementation Slices$"
  "tasks.md:^# Tasks:"
  "qa-report.md:^# QA Report:"
  "release-notes.md:^# Release Notes:"
  "retro.md:^# Retrospective:"
)

failed=0
for check in "${checks[@]}"; do
  file="${check%%:*}"
  pattern="${check#*:}"
  if ! rg -q "$pattern" "$feature_dir/$file"; then
    echo "Missing required section in $file: $pattern" >&2
    failed=1
  fi
done

if rg -n "{{FEATURE_|{{DATE}}" "$feature_dir" >/dev/null 2>&1; then
  echo "Unresolved template placeholders found in $feature_dir" >&2
  failed=1
fi

open_tasks="$( { grep -E '^- \[ \]' "$feature_dir/tasks.md" || true; } | wc -l | tr -d ' ' )"
done_tasks="$( { grep -E '^- \[[xX]\]' "$feature_dir/tasks.md" || true; } | wc -l | tr -d ' ' )"

echo "Feature workspace: $feature_dir"
echo "Completed tasks: $done_tasks"
echo "Open tasks: $open_tasks"

if (( failed )); then
  exit 1
fi

echo "Workspace structure looks valid."
