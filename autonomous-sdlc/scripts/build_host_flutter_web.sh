#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
export PATH="$ROOT_DIR/.tooling/shims:$ROOT_DIR/.tooling/flutter/bin:$PATH"

cd "$ROOT_DIR/apps/host-flutter"

if [[ -f "$ROOT_DIR/.env" ]]; then
  flutter build web --pwa-strategy=none --dart-define-from-file="$ROOT_DIR/.env" -o "$ROOT_DIR/dist/host-flutter-web"
else
  flutter build web --pwa-strategy=none -o "$ROOT_DIR/dist/host-flutter-web"
fi
