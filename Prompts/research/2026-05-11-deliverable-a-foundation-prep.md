---
date: 2026-05-11
topic: "Deliverable A: Foundation Prep — current state audit"
repos_touched: [ajentify-app]
tags: [research, eslint, vitest, testing, lint-arch, foundation]
status: complete
last_updated: 2026-05-11
---

# Deliverable A: Foundation Prep — Current State Audit

Workspace root: `/workspace`  
Project name: `ajentify-app` (from `package.json` `"name"` field)

---

## 1. ESLint Configuration

**File:** `/workspace/.eslintrc.json` (3 lines)

```json
{
  "extends": ["next/core-web-vitals", "next/typescript"]
}
```

### Presets extended

| Preset | What it bundles |
|--------|----------------|
| `next/core-web-vitals` | The base `eslint-config-next` (which includes `eslint-plugin-react`, `eslint-plugin-react-hooks`, `@next/eslint-plugin-next`) plus two rules upgraded from warn → error: `@next/next/no-html-link-for-pages` and `@next/next/no-sync-scripts` |
| `next/typescript` | TypeScript-specific rules from `typescript-eslint` recommended set |

No additional `rules` block is defined. All configuration comes from the two presets above.

### Specific rule status

| Rule | Status |
|------|--------|
| `react-hooks/exhaustive-deps` | **Not explicitly configured.** Included transitively through `eslint-plugin-react-hooks` (bundled in `eslint-config-next`). Default severity from the plugin is `warn`. There is **one inline suppression** at `src/app/(authenticated)/stages/components/StageAssignmentField.tsx:105` (`// eslint-disable-next-line react-hooks/exhaustive-deps`), confirming the rule is active at runtime. |
| `@typescript-eslint/no-floating-promises` | **Not configured.** Absent from `.eslintrc.json`. Not part of `next/typescript`'s default enabled rules. |
| `react/jsx-no-target-blank` | **Not explicitly configured.** May be included transitively through `eslint-plugin-react`'s recommended set (bundled via `eslint-config-next`). No inline suppressions found. |
| `@typescript-eslint/no-explicit-any` | **Not explicitly configured.** Appears to be active via `next/typescript`; confirmed by inline suppressions present at: `src/app/(authenticated)/documents/page.tsx:264`, `src/app/(authenticated)/sres/page.tsx:338`, `src/app/(authenticated)/tools/page.tsx:276`, `src/app/(authenticated)/agents/page.tsx:328`. |

### ESLint-disable patterns found in source

Three files carry whole-file `/* eslint-disable */` suppressions at line 1:

- `src/api/tokenstreamingservice/TokenStreamingService.ts:1`
- `src/lib/JSONRPCPeer.ts:1`
- `src/types/context.ts:1`

Inline `eslint-disable-next-line` suppressions:

- `src/app/components/chatbox/ChatBox.tsx:110` — suppresses `@typescript-eslint/no-unused-vars`
- `src/app/(authenticated)/documents/page.tsx:264` — suppresses `@typescript-eslint/no-explicit-any`
- `src/app/(authenticated)/sres/page.tsx:338` — suppresses `@typescript-eslint/no-explicit-any`
- `src/app/(authenticated)/tools/page.tsx:276` — suppresses `@typescript-eslint/no-explicit-any`
- `src/app/(authenticated)/tool-builder/[[...tool_id]]/page.tsx:104` — suppresses `@typescript-eslint/no-unused-vars`
- `src/app/(authenticated)/agents/page.tsx:328` — suppresses `@typescript-eslint/no-explicit-any`
- `src/app/(authenticated)/stages/components/StageAssignmentField.tsx:105` — suppresses `react-hooks/exhaustive-deps`

---

## 2. package.json Scripts and devDependencies

**File:** `/workspace/package.json`

### Scripts

```json
"scripts": {
  "dev": "next dev",
  "build": "next build",
  "start": "next start",
  "lint": "next lint"
}
```

| Script | Present | Command |
|--------|---------|---------|
| `dev` | Yes | `next dev` |
| `build` | Yes | `next build` |
| `start` | Yes | `next start` |
| `lint` | Yes | `next lint` |
| `test` | **ABSENT** | — |
| `typecheck` | **ABSENT** | — |
| `lint:arch` | **ABSENT** | — |

### devDependencies

```json
"devDependencies": {
  "@types/node": "^20",
  "@types/react": "^19",
  "@types/react-dom": "^19",
  "@types/react-syntax-highlighter": "^15.5.13",
  "eslint": "^8",
  "eslint-config-next": "15.0.4",
  "postcss": "^8",
  "tailwindcss": "^3.4.1",
  "typescript": "^5"
}
```

| Package | Present |
|---------|---------|
| `vitest` | **ABSENT** |
| `@vitejs/plugin-react` | **ABSENT** |
| `@testing-library/react` | **ABSENT** |
| `@testing-library/jest-dom` | **ABSENT** |
| `jsdom` | **ABSENT** |
| `jest` / `@jest/core` | **ABSENT** |

---

## 3. Test Infrastructure

### Config files

| File | Present |
|------|---------|
| `/workspace/vitest.config.ts` | **ABSENT** |
| `/workspace/vitest.config.js` | **ABSENT** |
| `/workspace/jest.config.ts` | **ABSENT** |
| `/workspace/jest.config.js` | **ABSENT** |
| `/workspace/setup*.ts` (any test setup) | **ABSENT** |
| `/workspace/src/**/*.test.ts` | **ABSENT** (0 files) |
| `/workspace/src/**/*.test.tsx` | **ABSENT** (0 files) |
| `/workspace/src/**/*.spec.ts` | **ABSENT** (0 files) |
| `/workspace/src/**/*.spec.tsx` | **ABSENT** (0 files) |
| `/workspace/src/**/__tests__/` | **ABSENT** (0 directories) |

**Summary:** There is zero test infrastructure in the repository. No test runner is configured, no test files exist, no test setup files exist.

---

## 4. Console.log Patterns (Token / Key)

### Pattern: `console.log.*[Tt]oken`

Two matches, both in `src/api/tokenstreamingservice/TokenStreamingService.ts`:

- **Line 52:** `console.log(\`Connected to token streaming service at ${this.tokenStreamingUrl}\`)`  
  Logs the WebSocket URL string. The word "token" appears in the service name, **not** as a variable containing a credential value. `this.tokenStreamingUrl` is an endpoint URL.

- **Line 114:** `console.log('Closed token streaming service connection')`  
  Static string literal. The word "token" appears in the service name only. No credential value is logged.

**Important context:** `TokenStreamingService.ts` has `/* eslint-disable */` at line 1.  
The `connect_to_context` RPC call at line 54–57 passes `access_token: this.accessToken` as an RPC argument, but this value is **not** passed to `console.log`.

### Pattern: `console.log.*[Kk]ey`

**No matches found.**

### Pattern: `console.debug.*[Tt]oken`

**No matches found.**

### Pattern: `console.info.*[Tt]oken`

**No matches found.**

### All console.* calls in `/workspace/src`

For completeness, all `console.*` call sites found:

| File | Line | Call |
|------|------|------|
| `src/app/(authenticated)/chat/components/ChatHeading.tsx` | 60 | `console.error("Failed to fetch context", err)` |
| `src/app/(authenticated)/components/Sidebar.tsx` | 91 | `console.log(\`Switch to ${org.name}\`)` (inside onClick) |
| `src/app/components/chatbox/ChatBox.tsx` | 101 | `console.log("Tool call:", id, name, input)` |
| `src/app/components/chatbox/ChatBox.tsx` | 106 | `console.log("Tool response:", id, name, output)` |
| `src/app/components/chatbox/ChatBox.tsx` | 112 | `console.log("Received events:", events)` |
| `src/app/components/chatbox/ChatBox.tsx` | 119 | `console.log("WebSocket closed")` |
| `src/app/components/chatbox/ChatBox.tsx` | 129 | `console.error("Failed to connect to context:", err)` |
| `src/utils/api/checkResponseAndParseJson.ts` | 7 | `console.error('Error parsing response JSON:', error)` |
| `src/api/tokenstreamingservice/TokenStreamingService.ts` | 52 | `console.log(\`Connected to token streaming service at ${this.tokenStreamingUrl}\`)` |
| `src/api/tokenstreamingservice/TokenStreamingService.ts` | 114 | `console.log('Closed token streaming service connection')` |
| `src/app/(authenticated)/profile/page.tsx` | 47 | `console.error('Failed to save user updates:', error)` |
| `src/app/(authenticated)/profile/page.tsx` | 80 | `console.error('Failed to delete account:', error)` |
| `src/lib/SimpleWebSocketClient.ts` | 26 | `console.error('WebSocket error:', err)` |
| `src/lib/SimpleWebSocketClient.ts` | 37 | `console.log('WebSocket closed.')` |
| `src/lib/SimpleWebSocketClient.ts` | 49 | `console.warn('WebSocket is not open')` |
| `src/lib/JSONRPCPeer.ts` | 60 | `console.error('Failed to parse message', e)` |
| `src/lib/JSONRPCPeer.ts` | 67 | `console.warn('No handler for method:', parsed.method)` |
| `src/lib/JSONRPCPeer.ts` | 86 | `console.warn('Unknown response ID', parsed)` |
| `src/store/CreateTeamStore.ts` | 134 | `console.error('Error getting link data:', error)` |
| `src/store/CreateTeamStore.ts` | 155 | `console.log("Polling job status")` |
| `src/store/CreateTeamStore.ts` | 159 | `console.error('Error creating team:', error)` |
| `src/store/CreateTeamStore.ts` | 173 | `console.log("Job:", job)` |
| `src/store/CreateTeamStore.ts` | 192 | `console.log("Polling job status repeate")` |
| `src/store/CreateTeamStore.ts` | 197 | `console.error('Error polling job status:', error)` |
| `src/store/ChatPagesStore.ts` | 33 | `console.error('Failed to load chat pages', error)` |
| `src/store/StructuredResponseEndpointBuilderStore.ts` | 474 | `console.log("Error deleting parameter definition", error)` |
| `src/store/ModelsStore.ts` | 21 | `console.error("Failed to load models:", error)` |
| `src/app/(authenticated)/agent-builder/[[...agent_id]]/components/MemoryTools.tsx` | 42 | `console.log(error)` |
| `src/app/(authenticated)/agent-builder/[[...agent_id]]/components/MemoryTools.tsx` | 84 | `console.log(error)` |
| `src/store/ChatPageStore.ts` | 90 | `console.log('Error loading context history:', error)` |
| `src/store/AuthStore.ts` | 72 | `console.error('Failed to get auth token', error)` |
| `src/store/AuthStore.ts` | 119 | `console.error('Failed to sign out', error)` |
| `src/store/AuthStore.ts` | 128 | `console.error('Failed to load user', error)` |
| `src/store/AuthStore.ts` | 176 | `console.error('User not loaded')` |
| `src/store/AuthStore.ts` | 189 | `console.error('Failed to update user:', error)` |
| `src/store/AuthStore.ts` | 196 | `console.error('User not loaded')` |
| `src/store/AuthStore.ts` | 203 | `console.error('Failed to delete account:', error)` |

No `console.log` call directly emits a raw token, API key, or secret value.

---

## 5. TypeScript Configuration

**File:** `/workspace/tsconfig.json`

```json
{
  "compilerOptions": {
    "target": "ES2017",
    "lib": ["dom", "dom.iterable", "esnext"],
    "allowJs": true,
    "skipLibCheck": true,
    "strict": true,
    "noEmit": true,
    "esModuleInterop": true,
    "module": "esnext",
    "moduleResolution": "bundler",
    "resolveJsonModule": true,
    "isolatedModules": true,
    "jsx": "preserve",
    "incremental": true,
    "plugins": [{ "name": "next" }],
    "paths": { "@/*": ["./src/*"] }
  },
  "include": ["next-env.d.ts", "**/*.ts", "**/*.tsx", ".next/types/**/*.ts"],
  "exclude": ["node_modules"]
}
```

| Option | Value | Notes |
|--------|-------|-------|
| `strict` | `true` | Enables all strict type-checking options: `strictNullChecks`, `strictFunctionTypes`, `strictBindCallApply`, `strictPropertyInitialization`, `noImplicitAny`, `noImplicitThis`, `alwaysStrict` |
| `noEmit` | `true` | TypeScript only type-checks; Next.js/SWC handles transpilation |
| `target` | `ES2017` | Compile target |
| `moduleResolution` | `bundler` | Next.js 15 bundler resolution mode |
| `isolatedModules` | `true` | Each file treated as an isolated module; required for SWC |
| `incremental` | `true` | Incremental compilation enabled |
| `noUncheckedIndexedAccess` | **Not set** | Not enabled |
| `noImplicitReturns` | **Not set** | Not enabled (not part of `strict`) |
| `noFallthroughCasesInSwitch` | **Not set** | Not enabled |
| `exactOptionalPropertyTypes` | **Not set** | Not enabled |

---

## 6. CI Configuration

| Location | Present |
|----------|---------|
| `/workspace/.github/` | **ABSENT** — directory does not exist |
| `/workspace/.github/workflows/*.yml` | **ABSENT** |
| `/workspace/.circleci/` | **ABSENT** |
| `/workspace/.gitlab-ci.yml` | **ABSENT** |
| `/workspace/Makefile` | **ABSENT** |
| `/workspace/Jenkinsfile` | **ABSENT** |
| `/workspace/.travis.yml` | **ABSENT** |

**Summary:** No CI configuration of any kind exists in the repository. There are no automated pipelines, no build gates, no lint-on-PR checks.

---

## Summary Table: Foundation Gaps vs. What Exists

| Item | Current State |
|------|--------------|
| ESLint base | `next/core-web-vitals` + `next/typescript` only |
| `react-hooks/exhaustive-deps` | Active (via plugin default), severity = `warn`; 1 inline suppression |
| `@typescript-eslint/no-explicit-any` | Active (via `next/typescript`); 4 inline suppressions |
| `@typescript-eslint/no-floating-promises` | Not configured |
| `react/jsx-no-target-blank` | Not explicitly configured |
| `no-console` rule | Not configured |
| `test` script | Absent |
| `typecheck` script | Absent |
| `lint:arch` script | Absent |
| `vitest` in devDependencies | Absent |
| `@testing-library/react` in devDependencies | Absent |
| `@testing-library/jest-dom` in devDependencies | Absent |
| `jsdom` in devDependencies | Absent |
| vitest.config.ts | Absent |
| jest.config.ts | Absent |
| Test setup file | Absent |
| Any `.test.ts(x)` / `.spec.ts(x)` files | Absent (0 files) |
| CI workflows | Absent (no .github, no .circleci) |
| Token/key values logged via console | None found |
| Whole-file `/* eslint-disable */` | 3 files: `TokenStreamingService.ts`, `JSONRPCPeer.ts`, `types/context.ts` |
| TypeScript `strict` | Enabled |
