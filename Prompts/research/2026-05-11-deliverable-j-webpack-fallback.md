---
date: 2026-05-11
topic: "Deliverable J: Webpack Fallback Cleanup — current state audit"
repos_touched: [ajentify-app]
tags: [research, webpack, next-config, amplify, bundle, child-process]
status: complete
last_updated: 2026-05-11
---

# Deliverable J: Webpack Fallback Cleanup — Current State Audit

## 1. `next.config.ts` — Full Contents

File: `/workspace/next.config.ts`

```typescript
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  webpack: (config) => {
    config.resolve.fallback = {
      ...config.resolve.fallback,
      child_process: false, // Ignore 'child_process' in the client-side build
    };
    return config;
  },
};

export default nextConfig;
```

### Webpack Configuration Details

- **Fallbacks defined:** One entry — `child_process: false`
- The spread `...config.resolve.fallback` preserves any existing fallbacks that Next.js/webpack sets by default before adding the custom entry.
- The inline comment reads: `"Ignore 'child_process' in the client-side build"`
- **No other webpack customizations** exist (no aliases, no plugins, no loaders, no module rules).

### Other Webpack Fallbacks

Only one `false` entry is present in the entire fallbacks config:

| Module         | Value   |
|----------------|---------|
| `child_process` | `false` |

No other Node-built-in modules (`fs`, `path`, `os`, `crypto`, `stream`, `net`, `tls`, `http`, `https`, `buffer`, `url`, etc.) are explicitly silenced.

### Experimental Flags

None. There is no `experimental` block anywhere in `next.config.ts`.

### `serverExternalPackages` / `serverComponentsExternalPackages`

Neither key is present in `next.config.ts`.

### `transpilePackages`

Not present in `next.config.ts`.

---

## 2. `package.json` — AWS / Amplify Package Versions

File: `/workspace/package.json`

### `dependencies` (AWS-related)

| Package        | Version Constraint | Notes                        |
|----------------|--------------------|------------------------------|
| `aws-amplify`  | `^6.10.2`          | Only AWS package in deps     |

No `@aws-amplify/*` sub-packages appear in `dependencies` or `devDependencies`. The monorepo sub-packages (`@aws-amplify/auth`, `@aws-amplify/api`, etc.) are not independently listed — they are consumed transitively through `aws-amplify`.

### `devDependencies` (relevant to bundle / webpack analysis)

| Package              | Present? |
|----------------------|----------|
| `@next/bundle-analyzer` | **No** |

### Scripts

```json
"scripts": {
  "dev": "next dev",
  "build": "next build",
  "start": "next start",
  "lint": "next lint"
}
```

No `analyze` script exists.

---

## 3. Amplify Imports Inventory

All files in `/workspace/src/` that import from `aws-amplify` or `aws-amplify/*`:

| File | Line | Import Statement |
|------|------|-----------------|
| `src/app/layout.tsx` | 6 | `import { Amplify } from 'aws-amplify';` |
| `src/api/auth/signIn.ts` | 1 | `import { signIn as awsSignIn } from "aws-amplify/auth";` |
| `src/api/auth/signUp.ts` | 1 | `import { signUp as awsSignUp } from "aws-amplify/auth";` |
| `src/api/auth/signOut.ts` | 1 | `import { signOut as awsSignOut } from "aws-amplify/auth";` |
| `src/api/auth/confirmSignUp.ts` | 2 | `import { confirmSignUp as awsConfirmSignUp } from "aws-amplify/auth";` |
| `src/api/auth/forgotPassword.ts` | 1 | `import { resetPassword } from 'aws-amplify/auth';` |
| `src/api/auth/resetPassword.ts` | 1 | `import { confirmResetPassword } from 'aws-amplify/auth';` |
| `src/api/user/updateUser.ts` | 1 | `import { updateUserAttributes } from 'aws-amplify/auth';` |
| `src/store/AuthStore.ts` | 2 | `import { fetchAuthSession } from "aws-amplify/auth";` |

**Additional note — commented-out legacy import:**

`src/api/auth/confirmSignUp.ts` line 1 contains a commented-out v5-era import:
```typescript
// import { Auth } from 'aws-amplify';
```
This is dead code; it is not active.

**Summary by entry-point used:**

| Entry-point       | Symbol(s) imported                                                   |
|-------------------|----------------------------------------------------------------------|
| `aws-amplify`     | `Amplify` (used for `Amplify.configure()` in `layout.tsx`)           |
| `aws-amplify/auth`| `signIn`, `signUp`, `signOut`, `confirmSignUp`, `resetPassword`, `confirmResetPassword`, `updateUserAttributes`, `fetchAuthSession` |

All active Amplify usage is auth-only. No `aws-amplify/api`, `aws-amplify/storage`, `aws-amplify/analytics`, or similar sub-packages are imported anywhere in `src/`.

---

## 4. Node Module Patterns in `/workspace/src/`

Searched for direct imports of Node built-in modules (`child_process`, `fs`, `path`, `os`, `crypto`, `stream`, `net`, `tls`, `http`, `https`) and `node:` protocol imports within `/workspace/src/`.

**Result: zero matches found.**

No file in `src/` directly imports any Node-specific built-in module. The `child_process: false` fallback in `next.config.ts` is therefore not caused by application-level source code importing `child_process`. It is present to suppress a `child_process` reference that surfaces transitively through a dependency (most likely `aws-amplify` or one of its transitive deps) during the client-side webpack bundle.

---

## 5. Bundle Analyzer Setup

- `@next/bundle-analyzer` is **not** in `package.json` (neither `dependencies` nor `devDependencies`).
- There is **no** `analyze` script in `package.json`.
- No `ANALYZE` environment variable wiring exists in `next.config.ts`.

---

## 6. Summary Table — `next.config.ts` Feature Inventory

| Feature                          | Present? | Value / Notes                     |
|----------------------------------|----------|------------------------------------|
| `webpack` override               | Yes      | Adds `child_process: false` fallback |
| `resolve.fallback.child_process` | Yes      | `false`                            |
| Any other `resolve.fallback.*`   | No       | Only `child_process`               |
| `experimental` block             | No       | —                                  |
| `serverExternalPackages`         | No       | —                                  |
| `serverComponentsExternalPackages` | No     | —                                  |
| `transpilePackages`              | No       | —                                  |
| `@next/bundle-analyzer`          | No       | Not installed, no analyze script   |
| Custom loaders / plugins         | No       | —                                  |
| Aliases (`resolve.alias`)        | No       | —                                  |
