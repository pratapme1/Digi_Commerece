#!/usr/bin/env bash
set -euo pipefail

echo "Start here:"
echo "1. Read autonomous-sdlc/lessons.md"
echo "2. Read autonomous-sdlc/process.md and AGENTS.md"
echo "3. Read autonomous-sdlc/product/design-approach.md and milestones.md for product work"
echo "4. If the work affects stack, infra, deployment, or M2+, read autonomous-sdlc/product/architecture/README.md"
echo "5. Review open feature workspaces"
echo

echo "Open features:"
find autonomous-sdlc/features -maxdepth 1 -mindepth 1 -type d | sort
