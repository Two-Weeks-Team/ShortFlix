#!/usr/bin/env bash
# lighthouse-pwa.sh — assert PWA score >= 90 on the deployed (or local) web target.
# Usage:
#   TARGET_URL=http://localhost:3000 bash scripts/lighthouse-pwa.sh
#   TARGET_URL=https://shortflix-web-...run.app bash scripts/lighthouse-pwa.sh
# Requires: Node 20+ (npx) and a Chromium binary on PATH (or CI env with chrome installed).

set -euo pipefail

TARGET_URL="${TARGET_URL:-http://localhost:3000}"
THRESHOLD_PWA="${THRESHOLD_PWA:-90}"
THRESHOLD_PERF="${THRESHOLD_PERF:-70}"
THRESHOLD_A11Y="${THRESHOLD_A11Y:-90}"
OUT_DIR="${OUT_DIR:-.lighthouse-out}"

mkdir -p "$OUT_DIR"

echo "Running Lighthouse against $TARGET_URL"
echo "Thresholds: PWA>=${THRESHOLD_PWA} Perf>=${THRESHOLD_PERF} A11y>=${THRESHOLD_A11Y}"

# Use lighthouse via npx (pinned major).
npx --yes lighthouse@12 "$TARGET_URL" \
  --quiet \
  --chrome-flags="--headless=new --no-sandbox --disable-gpu --disable-dev-shm-usage" \
  --form-factor=mobile \
  --throttling-method=simulate \
  --only-categories=performance,accessibility,pwa \
  --output=json \
  --output-path="$OUT_DIR/report.json"

# Extract scores using node (always available on a Node-installed runner).
node - "$OUT_DIR/report.json" "$THRESHOLD_PWA" "$THRESHOLD_PERF" "$THRESHOLD_A11Y" <<'NODE'
const fs = require('fs');
const [, , reportPath, pwaT, perfT, a11yT] = process.argv;
const r = JSON.parse(fs.readFileSync(reportPath, 'utf8'));
const score = (cat) => Math.round((r.categories[cat]?.score ?? 0) * 100);
const pwa = score('pwa'), perf = score('performance'), a11y = score('accessibility');
console.log(`Lighthouse scores: pwa=${pwa} perf=${perf} a11y=${a11y}`);
let bad = false;
if (pwa < +pwaT)   { console.error(`FAIL: PWA score ${pwa} < ${pwaT}`); bad = true; }
if (perf < +perfT) { console.error(`FAIL: Performance score ${perf} < ${perfT}`); bad = true; }
if (a11y < +a11yT) { console.error(`FAIL: Accessibility score ${a11y} < ${a11yT}`); bad = true; }
if (bad) process.exit(1);
console.log('OK — all thresholds met.');
NODE
