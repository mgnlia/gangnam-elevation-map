#!/usr/bin/env bash
set -euo pipefail

RUNS="${1:-5}"
OUT_DIR="${2:-desktop-gain-reports/$(date +%Y%m%d-%H%M%S)}"
MAIN_PORT="${MAIN_PORT:-18081}"
OPT_PORT="${OPT_PORT:-18080}"
CHROME_PATH="${CHROME_PATH:-/Applications/Google Chrome.app/Contents/MacOS/Google Chrome}"

if ! [[ "$RUNS" =~ ^[0-9]+$ ]] || [ "$RUNS" -lt 1 ]; then
  echo "RUNS must be a positive integer"
  exit 1
fi

if ! command -v npx >/dev/null 2>&1; then
  echo "npx is required"
  exit 1
fi

if ! command -v jq >/dev/null 2>&1; then
  echo "jq is required"
  exit 1
fi

if [ ! -x "$CHROME_PATH" ]; then
  echo "Chrome executable not found at: $CHROME_PATH"
  echo "Set CHROME_PATH to your browser executable"
  exit 1
fi

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
mkdir -p "$OUT_DIR"

MAIN_DIR="$(mktemp -d /tmp/seoul-main-desktop-XXXXXX)"
git -C "$ROOT_DIR" archive main | tar -x -C "$MAIN_DIR"

MAIN_PID=""
OPT_PID=""
cleanup() {
  if [ -n "$OPT_PID" ]; then kill "$OPT_PID" >/dev/null 2>&1 || true; fi
  if [ -n "$MAIN_PID" ]; then kill "$MAIN_PID" >/dev/null 2>&1 || true; fi
}
trap cleanup EXIT

python3 -m http.server "$OPT_PORT" >/tmp/seoul-opt-desktop-server.log 2>&1 &
OPT_PID="$!"
python3 -m http.server "$MAIN_PORT" >/tmp/seoul-main-desktop-server.log 2>&1 --directory "$MAIN_DIR" &
MAIN_PID="$!"
sleep 1

run_desktop_lh() {
  local url="$1"
  local out="$2"
  npx -y lighthouse "$url" \
    --chrome-path="$CHROME_PATH" \
    --chrome-flags='--headless=new --no-sandbox' \
    --preset=desktop \
    --only-categories=performance \
    --output=json \
    --output-path="$out" \
    --quiet >/dev/null
}

echo "[desktop-benchmark] runs=$RUNS out=$OUT_DIR"
for i in $(seq 1 "$RUNS"); do
  echo "[desktop-benchmark] run $i/$RUNS"
  run_desktop_lh "http://127.0.0.1:${MAIN_PORT}" "$OUT_DIR/main-desktop-$i.json"
  run_desktop_lh "http://127.0.0.1:${OPT_PORT}" "$OUT_DIR/opt-desktop-$i.json"
done

RAW_TSV="$OUT_DIR/raw.tsv"
{
  for f in "$OUT_DIR"/*.json; do
    base="$(basename "$f" .json)"
    label="$(echo "$base" | sed -E 's/-[0-9]+$//')"
    jq -r --arg label "$label" '[
      $label,
      (.categories.performance.score*100),
      .audits["first-contentful-paint"].numericValue,
      .audits["largest-contentful-paint"].numericValue,
      .audits["speed-index"].numericValue,
      .audits["interactive"].numericValue,
      .audits["total-blocking-time"].numericValue,
      .audits["cumulative-layout-shift"].numericValue
    ] | @tsv' "$f"
  done
} > "$RAW_TSV"

SUMMARY_TSV="$OUT_DIR/summary.tsv"
awk -F '\t' '
  {
    n[$1]++; s[$1]+=$2; fcp[$1]+=$3; lcp[$1]+=$4; si[$1]+=$5; tti[$1]+=$6; tbt[$1]+=$7; cls[$1]+=$8
  }
  END {
    print "label\truns\tscore_avg\tfcp_avg\tlcp_avg\tsi_avg\ttti_avg\ttbt_avg\tcls_avg";
    for (k in n) {
      printf "%s\t%d\t%.4f\t%.3f\t%.3f\t%.3f\t%.3f\t%.3f\t%.6f\n",
        k, n[k], s[k]/n[k], fcp[k]/n[k], lcp[k]/n[k], si[k]/n[k], tti[k]/n[k], tbt[k]/n[k], cls[k]/n[k];
    }
  }
' "$RAW_TSV" | sort > "$SUMMARY_TSV"

REPORT_MD="$OUT_DIR/desktop-gain-report.md"
awk -F '\t' '
  $1=="main-desktop" { ms=$3; mfcp=$4; mlcp=$5; msi=$6; mtti=$7; mtbt=$8; mcls=$9; mruns=$2 }
  $1=="opt-desktop"  { os=$3; ofcp=$4; olcp=$5; osi=$6; otti=$7; otbt=$8; ocls=$9; oruns=$2 }
  END {
    score_gain_pct = ((os-ms)/ms)*100;
    fcp_gain_pct = ((mfcp-ofcp)/mfcp)*100;
    lcp_gain_pct = ((mlcp-olcp)/mlcp)*100;
    si_gain_pct = ((msi-osi)/msi)*100;
    tti_gain_pct = ((mtti-otti)/mtti)*100;
    tbt_gain_pct = ((mtbt-otbt)/mtbt)*100;
    cls_gain_pct = ((mcls-ocls)/mcls)*100;

    printf "# Desktop Performance Gain Report\n\n";
    printf "- Runs: %d main / %d opt\n", mruns, oruns;
    printf "- Baseline: `main`\n";
    printf "- Candidate: current branch\n\n";
    printf "## Averages\n\n";
    printf "| Metric | main | opt | Gain |\n";
    printf "|---|---:|---:|---:|\n";
    printf "| Score | %.2f | %.2f | %+0.2f%% |\n", ms, os, score_gain_pct;
    printf "| FCP (ms) | %.1f | %.1f | %+0.2f%% |\n", mfcp, ofcp, fcp_gain_pct;
    printf "| LCP (ms) | %.1f | %.1f | %+0.2f%% |\n", mlcp, olcp, lcp_gain_pct;
    printf "| Speed Index (ms) | %.1f | %.1f | %+0.2f%% |\n", msi, osi, si_gain_pct;
    printf "| TTI (ms) | %.1f | %.1f | %+0.2f%% |\n", mtti, otti, tti_gain_pct;
    printf "| TBT (ms) | %.1f | %.1f | %+0.2f%% |\n", mtbt, otbt, tbt_gain_pct;
    printf "| CLS | %.6f | %.6f | %+0.2f%% |\n", mcls, ocls, cls_gain_pct;
    printf "\n";
  }
' "$SUMMARY_TSV" > "$REPORT_MD"

cat "$REPORT_MD"
echo
echo "[desktop-benchmark] artifacts:"
echo "  $OUT_DIR"
echo "  $RAW_TSV"
echo "  $SUMMARY_TSV"
echo "  $REPORT_MD"
