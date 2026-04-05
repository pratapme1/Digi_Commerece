#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
export PATH="$ROOT_DIR/.tooling/shims:$ROOT_DIR/.tooling/flutter/bin:$PATH"

cd "$ROOT_DIR/apps/host-flutter"
flutter test
