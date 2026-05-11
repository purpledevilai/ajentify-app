---
date: 2026-05-11
topic: "Deliverable B: Layout Split — current state audit"
repos_touched: [ajentify-app]
tags: [research, layout, route-groups, amplify, providers, auth]
status: complete
last_updated: 2026-05-11
---

# Deliverable B: Layout Split — Current State Audit

## 1. Root Layout (`src/app/layout.tsx`)

**Full path:** `src/app/layout.tsx`

### Directives & Exports
- **`'use client'` directive:** YES — present at line 1.
- **`metadata` export:** NO — there is no `export const metadata` or `export const generateMetadata`. The page title is set via a literal `<title>Ajentify</title>` tag inside the `<head>` block (line 30).

### `<head>` Block
The `<head>` block (lines 29–31) contains only one element:
```html
<head>
  <title>Ajentify</title>
</head>
```
No `<meta>` tags, no font `<link>` tags, no viewport tag, no charset declaration.

### `Amplify.configure()` Call
YES — called at module scope (lines 12–19), outside any component or hook:
```ts
Amplify.configure({
  Auth: {
    Cognito: {
      userPoolId: process.env.NEXT_PUBLIC_AWS_USER_POOL_ID ?? '',
      userPoolClientId: process.env.NEXT_PUBLIC_AWS_USER_POOL_WEB_CLIENT_ID ?? '',
    }
  },
})
```

### Providers Mounted
The component tree in the returned JSX (lines 33–45) mounts, in order:
1. `<NavigationGuardProvider>` (from `next-navigation-guard`)
2. `<ChakraProviders>` (local, wraps `ChakraProvider`)
3. `<AlertProvider>` (local, global alert context)

Inside those providers, a conditional renders either a full-screen `<Spinner>` (when `authStore.isDeterminingAuth` is `true`) or `{children}`.

### `authStore` Usage
- Imports `authStore` from `@/store/AuthStore` (line 7).
- Calls `authStore.checkAuth()` in a `useEffect` with empty dependency array (lines 23–25).
- Reads `authStore.isDeterminingAuth` directly in JSX to gate rendering (line 36).

### All Imports (lines 3–10)
| Line | Import |
|------|--------|
| 3 | `useEffect` from `react` |
| 4 | `ChakraProviders` from `@/app/components/ChakraProviders` |
| 5 | `AlertProvider` from `@/app/components/AlertProvider` |
| 6 | `Amplify` from `aws-amplify` |
| 7 | `authStore` from `@/store/AuthStore` |
| 8 | `NavigationGuardProvider` from `next-navigation-guard` |
| 9 | `observer` from `mobx-react-lite` |
| 10 | `Flex`, `Spinner` from `@chakra-ui/react` |

### Component Wrapping
The layout component is wrapped with `observer(...)` (MobX) and named `RootLayout` (line 21). It is exported as default at line 51.

---

## 2. Authenticated Layout (`src/app/(authenticated)/layout.tsx`)

**Full path:** `src/app/(authenticated)/layout.tsx`

### Directives
- **`'use client'` directive:** YES — present at line 1.

### All Imports (lines 3–11)
| Line | Import |
|------|--------|
| 3 | `React`, `useEffect`, `useState` from `react` |
| 4 | `observer` from `mobx-react-lite` |
| 5 | `Flex`, `Box` from `@chakra-ui/react` |
| 6 | `useBreakpointValue` from `@chakra-ui/react` |
| 7 | `Header` from `./components/Header` |
| 8 | `Sidebar` from `./components/Sidebar` |
| 9 | `useRouter` from `next/navigation` |
| 10 | `authStore` from `@/store/AuthStore` |
| 11 | `reaction` from `mobx` |

### Structure
- Wrapped with `observer(...)`, named `AuthenticatedLayout`, exported as default (lines 13, 91).
- Uses `useRouter` from Next.js.
- Reads `authStore.signedIn` and `authStore.user` reactively.
- Calls `authStore.loadUser()` if user is signed in but user object is null.
- On sign-out (detected via MobX `reaction`), redirects to `/signin` (line 19).
- Manages responsive sidebar open/close state with `useState` and `useBreakpointValue`.

### Providers Mounted
**None.** This layout does not mount any context providers. It renders a structural shell: `Header` + `Sidebar` + a `Box` content area wrapping `{children}`.

### `authStore` Usage
- Reads `authStore.signedIn` (lines 17, 29, 35).
- Reads `authStore.user` (line 22).
- Calls `authStore.loadUser()` (line 23).

---

## 3. Public Layout (`src/app/(public)/layout.tsx`)

**ABSENT.** The file `src/app/(public)/layout.tsx` does **not exist**. The `(public)` route group has no dedicated layout file. Its routes inherit directly from the root layout.

---

## 4. `ChakraProviders` Component (`src/app/components/ChakraProviders.tsx`)

**Full path:** `src/app/components/ChakraProviders.tsx`

### Directives
- **`'use client'` directive:** YES — present at line 1.

### All Imports (lines 3–4)
| Line | Import |
|------|--------|
| 3 | `ChakraProvider` from `@chakra-ui/react` |
| 4 | `theme` from `@/theme/theme` |

### What It Does
Thin wrapper component. Renders `<ChakraProvider theme={theme}>{children}</ChakraProvider>`. Accepts `{ children: React.ReactNode }` prop. Exported as default (line 6). No state, no hooks, no other logic.

---

## 5. `Amplify.configure` — All Occurrences

**Single occurrence found.**

| File | Line | Context |
|------|------|---------|
| `src/app/layout.tsx` | 12 | Module-scope call, before component definition |

No other files in `src/` contain `Amplify.configure`.

### `lib/amplify.ts`
**ABSENT.** The file `src/lib/amplify.ts` does **not exist**. The `src/lib/` directory contains three files: `JSONRPCPeer.ts`, `SimpleWebSocketClient.ts`, and `tilltrue.ts`. No Amplify-specific lib file exists.

---

## 6. Route Groups in `src/app/`

### Top-level `src/app/` contents
```
(authenticated)/
(public)/
components/
favicon.ico
fonts/
globals.css
layout.tsx
page.tsx
```

There is **no `(auth)/` route group.** There are exactly two route groups: `(authenticated)` and `(public)`.

### `(public)/` Group Contents
```
chat-page/
landing/
privacy/
signin/
signup/
```
No `layout.tsx` in this group (see §3 above).

### `(authenticated)/` Group Contents
```
agent-builder/
agents/
api-keys/
chat/
chat-page-builder/
chat-pages/
components/
contexts/
create-team/
documents/
gmail/
google-calendar/
integrations/
json-document-builder/
layout.tsx
outlook/
profile/
sre-builder/
sres/
stages/
tool-builder/
tools/
usage/
```

### Current Location of Pages
| Page | Path |
|------|------|
| Sign-in | `src/app/(public)/signin/page.tsx` |
| Sign-up | `src/app/(public)/signup/page.tsx` |

---

## 7. Signin Page (`src/app/(public)/signin/page.tsx`)

### Directives
- **`'use client'` directive:** YES — present at line 1.

### All Imports (lines 3–9)
| Line | Import |
|------|--------|
| 3 | `React`, `useState`, `useEffect` from `react` |
| 4 | `observer` from `mobx-react-lite` |
| 5 | `Box`, `Flex`, `FormControl`, `FormLabel`, `Input`, `Button`, `Heading`, `Text`, `Stack` from `@chakra-ui/react` |
| 6 | `authStore` from `@/store/AuthStore` |
| 7 | `useRouter` from `next/navigation` |
| 8 | `reaction` from `mobx` |
| 9 | `ForgotPasswordModal` from `./components/ForgotPasswordModal` |

### Store Imports
- **`authStore`** (from `@/store/AuthStore`) — only store imported.

### Notable Behavior
- On sign-in success (`authStore.signedIn === true`), redirects to `/agents` (line 17).
- Uses MobX `reaction` to reactively listen for auth state changes.
- Calls `authStore.submitSignIn()` on button click (line 38).
- Reads `authStore.email`, `authStore.password`, `authStore.signInLoading`, `authStore.signInError`.

---

## 8. Signup Page (`src/app/(public)/signup/page.tsx`)

### Directives
- **`'use client'` directive:** YES — present at line 1.

### All Imports (lines 3–14)
| Line | Import |
|------|--------|
| 3 | `React`, `useEffect` from `react` |
| 4 | `observer` from `mobx-react-lite` |
| 5 | `Flex`, `Box`, `Button` from `@chakra-ui/react` |
| 6 | `ArrowBackIcon` from `@chakra-ui/icons` |
| 7 | `signUpStore` from `@/store/SignUpStore` |
| 8 | `UserDetailsStep` from `./components/UserDetailsStep` |
| 9 | `VerificationStep` from `./components/VerificationStep` |
| 10 | `CreateOrganizationStep` from `./components/CreateOrganizationStep` |
| 11 | `SuccessStep` from `./components/SuccessStep` |
| 12 | `Alert` from `@/app/components/Alert` |
| 13 | `motion`, `AnimatePresence` from `framer-motion` |
| 14 | `useRouter` from `next/navigation` |

### Store Imports
- **`signUpStore`** (from `@/store/SignUpStore`) — only store imported.

### Notable Behavior
- Multi-step wizard; step key read from `signUpStore.step`.
- Steps: `userDetails`, `verification`, `createOrganization`, `success`.
- Uses `framer-motion` `AnimatePresence` + `motion.div` for slide transitions between steps.
- Calls `signUpStore.reset()` on component unmount.
- No redirect logic for already-authenticated users.

---

## 9. Provider Files

### `(authenticated)/providers.tsx`
**ABSENT.** `src/app/(authenticated)/providers.tsx` does not exist.

### `(public)/providers.tsx`
**ABSENT.** `src/app/(public)/providers.tsx` does not exist.

### `(auth)/providers.tsx`
**ABSENT.** There is no `(auth)/` route group at all, therefore no providers file within it.

---

## 10. `AmplifyConfig` Component

### `src/components/` directory
**ABSENT.** The directory `src/components/` does not exist at all (only `src/app/components/` exists).

### `src/app/components/AmplifyConfig.tsx`
**ABSENT.** No file matching `AmplifyConfig*` exists anywhere under `src/`.

The full contents of `src/app/components/` are:
- `Alert.tsx`
- `AlertProvider.tsx`
- `Card.tsx`
- `ChakraProviders.tsx`
- `CodeSnippet.tsx`
- `ContentOrSpinner.tsx`
- `FormLableToolTip.tsx`
- `ModelSelector.tsx`

---

## Summary Table

| Item | Exists? | Notes |
|------|---------|-------|
| `src/app/layout.tsx` | YES | `'use client'`, `Amplify.configure` at module scope, `authStore.checkAuth` in `useEffect`, 3 providers |
| `src/app/(authenticated)/layout.tsx` | YES | `'use client'`, auth guard via `reaction`, no additional providers |
| `src/app/(public)/layout.tsx` | **NO** | No layout; routes inherit root layout directly |
| `src/app/components/ChakraProviders.tsx` | YES | `'use client'`, thin `ChakraProvider` + custom theme wrapper |
| `src/app/components/AlertProvider.tsx` | YES | React context provider for global alerts (not `'use client'` directive noted) |
| `Amplify.configure` occurrences | 1 | Only in `src/app/layout.tsx:12` |
| `src/lib/amplify.ts` | **NO** | Does not exist |
| `(auth)/` route group | **NO** | Does not exist |
| `(public)/` route group | YES | Contains: `chat-page`, `landing`, `privacy`, `signin`, `signup` |
| `(authenticated)/` route group | YES | Contains 20+ feature directories + `layout.tsx` |
| `src/app/(public)/signin/page.tsx` | YES | Imports `authStore` |
| `src/app/(public)/signup/page.tsx` | YES | Imports `signUpStore` |
| `(authenticated)/providers.tsx` | **NO** | Does not exist |
| `(public)/providers.tsx` | **NO** | Does not exist |
| `AmplifyConfig.tsx` (any location) | **NO** | Does not exist |
| `src/components/` directory | **NO** | Does not exist; only `src/app/components/` exists |
