#!/usr/bin/env bash
#
# lint:arch — three architectural invariants enforced as regex checks.
#
# Invariants:
#   1. No `'use client'` in any layout.tsx under src/app/.
#      (Project 10 deliverable B: the root and every route-group layout
#      stays a server component except (authenticated)/layout.tsx and
#      (auth)/layout.tsx which are explicitly client. We allow them via
#      the carve-out below.)
#   2. No module-level store singletons (`export const xxxStore = new XxxStore()`)
#      under src/store/. Stores are constructed by RootStore / AuthFlowStore
#      and consumed via useStores() / useAuthFlowStores() (Project 10
#      deliverable E). The two deprecated chat-page stores carve themselves
#      out until project 08 deletes them entirely.
#   3. No token-shaped console logs anywhere under src/.
#
# Each check is one bash pipeline. Any hit prints the offending file/line
# and the script exits non-zero.

set -uo pipefail

fail=0

# ---------- 1. No 'use client' in layouts ----------
# Allow-list: layouts that are explicitly client components per the plan.
#   - src/app/(authenticated)/layout.tsx (Chakra useBreakpointValue, hosts <DashboardBoot>)
#   - src/app/(auth)/layout.tsx          (mounts auth-flow providers)
# Everything else under src/app/**/layout.tsx must be a server component.
hits_use_client_in_layout=$(
  find src/app -type f -name 'layout.tsx' \
    -not -path 'src/app/(authenticated)/layout.tsx' \
    -not -path 'src/app/(auth)/layout.tsx' \
    -print0 \
  | xargs -0 grep -lE "^['\"]use client['\"]" 2>/dev/null \
  || true
)
if [ -n "$hits_use_client_in_layout" ]; then
  echo "lint:arch [1/3] FAIL: 'use client' found in a layout that should be a server component:"
  echo "$hits_use_client_in_layout" | sed 's/^/  /'
  fail=1
fi

# ---------- 2. No module-level store singletons ----------
# Carve-outs (deprecated; deleted in project 08):
#   - src/store/ChatPagesStore.ts
#   - src/store/ChatPageBuilderStore.ts
hits_singletons=$(
  grep -rEn "^export const [a-zA-Z_]+Store = new [A-Za-z_]+Store" src/store/ \
    --include='*.ts' \
    | grep -v -E "src/store/(ChatPagesStore|ChatPageBuilderStore)\.ts:" \
    || true
)
if [ -n "$hits_singletons" ]; then
  echo "lint:arch [2/3] FAIL: module-level store singleton(s) found (forbidden outside the chat-page deprecation carve-out):"
  echo "$hits_singletons" | sed 's/^/  /'
  fail=1
fi

# ---------- 3. No token-shaped console logs ----------
hits_token_logs=$(
  grep -rEni "console\.(log|debug|info)\([^)]*['\"](token|access[-_ ]?token|api[-_ ]?key|bearer)" src/ \
    --include='*.ts' --include='*.tsx' \
    || true
)
if [ -n "$hits_token_logs" ]; then
  echo "lint:arch [3/3] FAIL: token-shaped console log found:"
  echo "$hits_token_logs" | sed 's/^/  /'
  fail=1
fi

if [ "$fail" -ne 0 ]; then
  exit 1
fi

echo "lint:arch: ok"
exit 0
