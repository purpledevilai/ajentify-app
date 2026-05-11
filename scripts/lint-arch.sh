#!/bin/bash
set -e

echo "=== lint:arch check 1: no 'use client' in root layout ==="
if grep -qE "^['\"]use client['\"]" src/app/layout.tsx 2>/dev/null; then
  echo "ERROR: Found 'use client' in app/layout.tsx. The root layout must be a server component."
  exit 1
fi
echo "✓ No 'use client' in root layout"

echo "=== lint:arch check 2: no module-level store singletons ==="
# Carve-outs (both deleted in project 08 when the deprecated chat-pages surface is removed):
#   ChatPagesStore.ts       — chatPagesStore singleton (deprecated chat-pages feature)
#   ChatPageBuilderStore.ts — chatPageBuilderStore singleton (deprecated chat-page-builder feature)
if grep -rE "^export const [a-z][A-Za-z]*Store = new [A-Z][A-Za-z]*Store" src/store/ \
  --exclude="ChatPagesStore.ts" --exclude="ChatPageBuilderStore.ts" 2>/dev/null | grep .; then
  echo "ERROR: Found module-level store singleton. Use RootStore or AuthFlowStore instead."
  exit 1
fi
echo "✓ No module-level store singletons"

echo "=== lint:arch check 3: no token-shaped console logs ==="
if grep -rEi "console\.(log|debug|info)\([^)]*['\"](token|access[-_ ]?token|api[-_ ]?key|bearer)" src/ 2>/dev/null; then
  echo "ERROR: Found token-shaped console log. Remove it."
  exit 1
fi
echo "✓ No token-shaped console logs found"

echo "=== lint:arch passed ==="
