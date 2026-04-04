#!/usr/bin/env bash
set -euo pipefail

if [[ $# -lt 1 ]]; then
  echo "Usage: bash autonomous-sdlc/scripts/new_feature.sh <slug> [title]" >&2
  exit 1
fi

script_dir="$(CDPATH= cd -- "$(dirname -- "$0")" && pwd)"
root_dir="$(CDPATH= cd -- "$script_dir/../.." && pwd)"
features_dir="$root_dir/autonomous-sdlc/features"
templates_dir="$root_dir/autonomous-sdlc/templates"

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

for template in spec.md plan.md tasks.md qa-report.md release-notes.md retro.md; do
  sed \
    -e "s/{{FEATURE_ID}}/$next_id/g" \
    -e "s/{{FEATURE_TITLE}}/$title/g" \
    -e "s/{{FEATURE_SLUG}}/$slug/g" \
    -e "s/{{DATE}}/$today/g" \
    "$templates_dir/$template" > "$feature_dir/$template"
done

echo "Created feature workspace: $feature_dir"
