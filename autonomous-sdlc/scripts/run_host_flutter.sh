#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
export PATH="$ROOT_DIR/.tooling/shims:$ROOT_DIR/.tooling/flutter/bin:$PATH"

DEVICE="${1:-linux}"
cd "$ROOT_DIR/apps/host-flutter"

if [[ -f "$ROOT_DIR/.env" ]]; then
  flutter run -d "$DEVICE" --dart-define-from-file="$ROOT_DIR/.env"
else
  flutter run -d "$DEVICE"
fi
