#!/usr/bin/env bash
set -euo pipefail

URL="${1:-http://127.0.0.1:8080}"
STAMP="$(date +%Y%m%d-%H%M%S)"
OUT_DIR="${2:-perf-reports/$STAMP}"

if ! command -v lighthouse >/dev/null 2>&1; then
  echo "lighthouse CLI is required. Install with: npm i -g lighthouse"
  exit 1
fi

mkdir -p "$OUT_DIR"

echo "[perf] URL: $URL"
echo "[perf] output: $OUT_DIR"

lighthouse "$URL" \
  --chrome-flags="--headless=new --no-sandbox" \
  --preset=desktop \
  --only-categories=performance \
  --output=json \
  --output-path="$OUT_DIR/desktop.json" \
  --quiet

lighthouse "$URL" \
  --chrome-flags="--headless=new --no-sandbox" \
  --form-factor=mobile \
  --only-categories=performance \
  --output=json \
  --output-path="$OUT_DIR/mobile.json" \
  --quiet

if command -v jq >/dev/null 2>&1; then
  echo "[perf] Desktop score: $(jq -r '.categories.performance.score * 100' "$OUT_DIR/desktop.json")"
  echo "[perf] Mobile score:  $(jq -r '.categories.performance.score * 100' "$OUT_DIR/mobile.json")"
fi

echo "[perf] done"
