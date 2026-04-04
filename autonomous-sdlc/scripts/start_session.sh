#!/usr/bin/env bash
set -euo pipefail

echo "Start here:"
echo "1. Read autonomous-sdlc/knowledge/lessons.md"
echo "2. Read AGENTS.md"
echo "3. Review open feature workspaces"
echo

echo "Open features:"
find autonomous-sdlc/features -maxdepth 1 -mindepth 1 -type d | sort
