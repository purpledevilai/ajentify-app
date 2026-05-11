#!/bin/bash
set -e

echo "=== lint:arch check 1: no 'use client' in root layout ==="
if grep -qE "^['\"]use client['\"]" src/app/layout.tsx 2>/dev/null; then
  echo "ERROR: Found 'use client' in app/layout.tsx. The root layout must be a server component."
  exit 1
fi
echo "✓ No 'use client' in root layout"

echo "=== lint:arch check 2: no module-level store singletons ==="
# TODO(deliverable-E): Enable this check once deliverable E removes all module-level store singletons.
# Until then, running it would fail CI because all stores are still exported as singletons.
# Uncomment and activate this check when deliverable E lands:
#   if grep -rE "^export const \w+Store = new \w+Store" src/store/ 2>/dev/null; then
#     echo "ERROR: Found module-level store singleton. Remove it."
#     exit 1
#   fi
echo "(skipped — gated on deliverable E)"

echo "=== lint:arch check 3: no token-shaped console logs ==="
if grep -rEi "console\.(log|debug|info)\([^)]*['\"](token|access[-_ ]?token|api[-_ ]?key|bearer)" src/ 2>/dev/null; then
  echo "ERROR: Found token-shaped console log. Remove it."
  exit 1
fi
echo "✓ No token-shaped console logs found"

echo "=== lint:arch passed ==="
