#!/usr/bin/env bash
set -euo pipefail

if [[ $# -lt 1 ]]; then
  echo "Usage: bash autonomous-sdlc/scripts/new_feature.sh <slug> [title]" >&2
  exit 1
fi

script_dir="$(CDPATH= cd -- "$(dirname -- "$0")" && pwd)"
root_dir="$(CDPATH= cd -- "$script_dir/../.." && pwd)"
features_dir="$root_dir/autonomous-sdlc/features"

raw_slug="$1"
title="${2:-$1}"
slug="$(printf '%s' "$raw_slug" | tr '[:upper:]' '[:lower:]' | sed -E 's/[^a-z0-9]+/-/g; s/^-+//; s/-+$//; s/-+/-/g')"

if [[ -z "$slug" ]]; then
  echo "Error: slug must contain at least one letter or number." >&2
  exit 1
fi

mkdir -p "$features_dir"

max_id=0
shopt -s nullglob
for path in "$features_dir"/*-*; do
  base="$(basename "$path")"
  prefix="${base%%-*}"
  if [[ "$prefix" =~ ^[0-9]{3}$ ]]; then
    value=$((10#$prefix))
    if (( value > max_id )); then
      max_id=$value
    fi
  fi
done
shopt -u nullglob

next_id="$(printf '%03d' $((max_id + 1)))"
feature_dir="$features_dir/$next_id-$slug"

if [[ -e "$feature_dir" ]]; then
  echo "Error: feature directory already exists: $feature_dir" >&2
  exit 1
fi

mkdir -p "$feature_dir"
today="$(date +%F)"

render_template() {
  case "$1" in
    spec.md)
      cat <<'EOF'
# Feature Spec: __FEATURE_ID__ __FEATURE_TITLE__

## Summary
State the user-facing change in 2-4 sentences.

## Problem
What is broken, missing, or unclear today?

## Outcome
What should be true when this feature is complete?

## Users And Surfaces
- Primary users:
- Touched files or surfaces:

## Scope
- In scope:
- Out of scope:

## Acceptance Criteria
- [ ] Criterion 1
- [ ] Criterion 2
- [ ] Criterion 3

## Risks
- Risk:

## Clarifications
- Open question:

## Approval
- Status: draft
- Approved by:
- Date: __DATE__
EOF
      ;;
    plan.md)
      cat <<'EOF'
# Implementation Plan: __FEATURE_ID__ __FEATURE_TITLE__

## Summary
Describe the chosen solution in 2-4 sentences.

## Architecture
- Key approach:
- Why this shape:
- Rejected alternative:

## Touched Areas
- Files:
- Docs:
- External dependencies:

## Research Notes
- Finding:

## Implementation Slices
1. Slice 1
2. Slice 2
3. Slice 3

## Test And QA Plan
- Local checks:
- Manual checks:

## Rollout And Rollback
- Rollout:
- Rollback:

## Approval
- Status: pending
- Approved by:
- Date: __DATE__
EOF
      ;;
    tasks.md)
      cat <<'EOF'
# Tasks: __FEATURE_ID__ __FEATURE_TITLE__

## Build
- [ ] Confirm spec approval
- [ ] Confirm plan approval
- [ ] Implement slice 1
- [ ] Implement slice 2
- [ ] Implement slice 3

## Verification
- [ ] Run local validation
- [ ] Perform manual QA
- [ ] Update qa-report.md

## Release
- [ ] Update release-notes.md
- [ ] Update retro.md
EOF
      ;;
    qa-report.md)
      cat <<'EOF'
# QA Report: __FEATURE_ID__ __FEATURE_TITLE__

## Status
- Result: pending

## Checks Run
- Check:

## Evidence
- Evidence:

## Defects
- Defect:

## Residual Risks
- Risk:

## Signoff
- Reviewer:
- Date: __DATE__
EOF
      ;;
    release-notes.md)
      cat <<'EOF'
# Release Notes: __FEATURE_ID__ __FEATURE_TITLE__

## Summary
Describe the shipped change.

## Files And Surfaces
- File:

## Verification Summary
- Evidence:

## Rollout
- Step:

## Rollback
- Step:

## Follow-ups
- Follow-up:
EOF
      ;;
    retro.md)
      cat <<'EOF'
# Retrospective: __FEATURE_ID__ __FEATURE_TITLE__

## What Worked
- Item:

## What Did Not Work
- Item:

## Standards To Update
- Standard:

## Follow-up Actions
- Action:
EOF
      ;;
    *)
      echo "Unknown template: $1" >&2
      return 1
      ;;
  esac
}

for template in spec.md plan.md tasks.md qa-report.md release-notes.md retro.md; do
  render_template "$template" | sed \
    -e "s/__FEATURE_ID__/$next_id/g" \
    -e "s/__FEATURE_TITLE__/$title/g" \
    -e "s/__FEATURE_SLUG__/$slug/g" \
    -e "s/__DATE__/$today/g" > "$feature_dir/$template"
done

echo "Created feature workspace: $feature_dir"
