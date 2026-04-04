#!/usr/bin/env bash
set -euo pipefail

if [[ $# -lt 1 ]]; then
  echo "Usage: bash autonomous-sdlc/scripts/connect_github_remote.sh <repo-url-or-name>" >&2
  echo "Example: bash autonomous-sdlc/scripts/connect_github_remote.sh https://github.com/pratapme1/Digi_Commerece.git" >&2
  echo "Example: bash autonomous-sdlc/scripts/connect_github_remote.sh Digi_Commerece" >&2
  exit 1
fi

input="$1"

if [[ "$input" == http*://* || "$input" == git@*:* ]]; then
  remote_url="$input"
elif [[ "$input" == */* ]]; then
  remote_url="https://github.com/$input.git"
else
  remote_url="https://github.com/pratapme1/$input.git"
fi

if ! git rev-parse --is-inside-work-tree >/dev/null 2>&1; then
  echo "Error: run this inside the git repository." >&2
  exit 1
fi

if git remote get-url origin >/dev/null 2>&1; then
  git remote set-url origin "$remote_url"
else
  git remote add origin "$remote_url"
fi

echo "Origin set to: $remote_url"
git remote -v
