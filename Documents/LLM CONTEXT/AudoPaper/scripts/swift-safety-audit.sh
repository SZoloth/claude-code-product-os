#!/usr/bin/env bash
set -euo pipefail

ROOT="${1:-Audo/Audo}"

echo "Scanning Swift sources under: $ROOT"

declare -A PATTERNS=(
  ["force cast (as!)"]='as\s*!'
  ["force try (try!)"]='try\s*!'
  ["fatalError calls"]='\bfatalError\b'
  ["escaped quote inside interpolation"]='\\\([^)]*\\"'
  ["declaration inside argument (access control)"]='\([^)]+,\s*(private|public|fileprivate|internal)\b'
  ["declaration inside argument (let/var)"]='\([^)]+,\s*(let|var)\s+\w+\s*='
)

fail=0
for label in "${!PATTERNS[@]}"; do
  patt="${PATTERNS[$label]}"
  hits=$(grep -RIn --include='*.swift' -E "$patt" "$ROOT" || true)
  if [[ -n "$hits" ]]; then
    echo "[FAIL] $label found:" >&2
    echo "$hits" >&2
    fail=1
  else
    echo "[OK] $label: none"
  fi
done

# Advisory checks (do not fail build)
echo "[INFO] Checking logger usage without OSLog import (advisory)"
while IFS= read -r -d '' f; do
  if ! grep -qE '^\s*import\s+OSLog\b' "$f"; then
    echo "[WARN] $f uses logger.* without 'import OSLog'"
  fi
done < <(grep -RIl --include='*.swift' -E 'logger\.[a-zA-Z]+\(' "$ROOT" -Z || true)

exit $fail
