---
date: 2026-05-11
topic: "Deliverable F: Auth Gating Boundary — current state audit"
repos_touched: [ajentify-app]
tags: [research, auth, middleware, dashboard-boot, cookies, redirect]
status: complete
last_updated: 2026-05-11
---

# Deliverable F: Auth Gating Boundary — Current State Audit

## 1. AuthStore (`src/store/AuthStore.ts`)

### `checkAuth()` — lines 77–82

```ts
checkAuth = async () => {
    this.isDeterminingAuth = true;
    const token = await this.getAccessToken();
    this.signedIn = token !== undefined;
    this.isDeterminingAuth = false;
}
```

- Does **not** call the backend `/user` endpoint. It calls `getAccessToken()` (lines 66–75), which calls `fetchAuthSession()` from `aws-amplify/auth` and returns `session.tokens?.accessToken.toString()`.
- Sets `signedIn = true` if an Amplify token is present; `signedIn = false` if `getAccessToken()` returns `undefined` (i.e. throws or has no token).
- Sets `isDeterminingAuth = true` at entry, `false` at exit.

### `submitSignIn()` — lines 84–97

```ts
async submitSignIn(): Promise<void> {
    this.signInLoading = true;
    this.signInError = '';
    this.signedIn = false;         // reset to false before attempt

    try {
        await signIn({ email: this.email, password: this.password });
        this.signedIn = true;       // set true after successful await
    } catch (error) {
        this.signInError = ...;
    } finally {
        this.signInLoading = false;
    }
}
```

- Sets `signedIn = false` at the start (defensive reset), then `signedIn = true` directly after `await signIn(...)` resolves successfully. This is a post-await direct assignment — not "optimistic" in the sense of setting before the network call, but it does bypass re-running `checkAuth()`.
- Does **not** call `checkAuth()` after sign-in.

### `isDeterminingAuth` field — line 32

```ts
isDeterminingAuth = true;
```

- Initialized to `true` in the class body.
- Set to `true` at the start of `checkAuth()`, then `false` at the end (lines 78, 81).
- **Never** touched by `submitSignIn()`, `signOut()`, or any other method.

### `signedIn` field — line 33

```ts
signedIn = false;
```

Set to `true` in:
- `checkAuth()` line 80 — when Amplify token is present.
- `submitSignIn()` line 91 — after successful sign-in API call.

Set to `false` in:
- `submitSignIn()` line 87 — at the start of a sign-in attempt.
- `signOut()` line 117 — after all stores are reset.
- `checkAuth()` line 80 — when Amplify token is absent/undefined.

### `loggingOut` field

**Does not exist** anywhere in `AuthStore`.

### `forceRefreshAccessToken()` method

**Does not exist** anywhere in `AuthStore` or the codebase.

### `handleAuthFailure()` method

**Does not exist** anywhere in `AuthStore` or the codebase.

---

## 2. Per-Page Redirect Machinery

### Root layout — `src/app/layout.tsx` (lines 21–48)

```tsx
const RootLayout = observer(({ children }) => {
  useEffect(() => {
    authStore.checkAuth();
  }, []);   // runs once on mount

  return (
    <html>
      <body>
        ...
        {authStore.isDeterminingAuth ? (
          <Flex justify="center" align="center" width="100vw" height="100vh">
            <Spinner size="lg" />
          </Flex>
        ) : (
          children
        )}
        ...
      </body>
    </html>
  );
});
```

- `checkAuth()` is called once on mount via `useEffect(fn, [])`.
- While `isDeterminingAuth === true` (the default at store creation), the entire app renders a full-viewport spinner.
- Once `checkAuth()` resolves (`isDeterminingAuth = false`), `children` are rendered. At that point `signedIn` is already set.
- This is the **only place `checkAuth()` is called** from the app shell. (Exception: signup success step, see §8.)

### Index page — `src/app/page.tsx` (lines 10–44)

```tsx
const IndexPage = observer(() => {
  const router = useRouter();

  const routeBasedOnAuth = (isSignedIn: boolean) => {
    if (isSignedIn) {
      router.push('/agents');
    } else {
      router.push('/landing');
    }
  }

  useEffect(() => {
    const disposer = reaction(
      () => authStore.signedIn,
      (isSignedIn) => { routeBasedOnAuth(isSignedIn); }
    );
    routeBasedOnAuth(authStore.signedIn);   // immediate call on every render
    return () => { disposer(); };
  });  // NO deps array — runs on every render

  return (
    <Flex justify="center" align="center" width="100vw" height="100vh">
      <Spinner size="lg" />
    </Flex>
  );
});
```

- Routes to `/agents` if `signedIn`, otherwise `/landing`.
- The page itself renders only a spinner.
- The `useEffect` has **no dependency array** — it re-runs on every render. A new `reaction` disposer is created and torn down each render cycle.
- Does **not** guard on `isDeterminingAuth` — relies on the root layout's spinner gate.

### Authenticated layout — `src/app/(authenticated)/layout.tsx` (lines 13–91)

```tsx
const AuthenticatedLayout = observer(({ children }) => {
  const router = useRouter();

  const routeBasedOnAuth = (isSignedIn: boolean) => {
    if (!isSignedIn) {
      router.push('/signin');   // line 19
      return;
    }
    if (!authStore.user) {
      authStore.loadUser();     // line 23
    }
  }

  useEffect(() => {
    const disposer = reaction(
      () => authStore.signedIn,
      (isSignedIn) => { routeBasedOnAuth(isSignedIn); }
    );
    routeBasedOnAuth(authStore.signedIn);   // immediate call on every render
    return () => { disposer(); };
  });  // NO deps array — runs on every render

  // ... sidebar logic ...

  return (
    <Flex height="100vh" flexDirection="column">
      <Header ... />
      <Flex flex="1" ...>
        <Sidebar ... />
        <Box flex="1" ...>
          {children}   // line 84 — rendered unconditionally
        </Box>
      </Flex>
    </Flex>
  );
});
```

- `children` (the protected page content) are rendered **unconditionally** — there is no gate on `signedIn` or `isDeterminingAuth` in the JSX return.
- The redirect to `/signin` happens only inside the `useEffect`, which fires **after** the component has already painted. This means protected content is briefly visible before the redirect fires if `signedIn === false`.
- In practice, because the root layout blocks rendering while `isDeterminingAuth === true`, by the time this layout paints, `signedIn` is already determined — so the flash window is between React rendering the authenticated shell and the `useEffect` firing (one commit cycle).
- When `signedIn === true`, calls `authStore.loadUser()` if `authStore.user` is not yet loaded.

### Sign-in page — `src/app/(public)/signin/page.tsx` (lines 11–125)

(Covered in detail in §9 below.)

### Agents page — `src/app/(authenticated)/agents/page.tsx` (lines 335–344)

```tsx
useEffect(() => {
  if (!authStore.signedIn) return;   // guards data load, does NOT redirect
  router.prefetch('/agent-builder');
  agentsStore.loadAgents();
  toolsStore.loadTools();
  modelsStore.loadModels();
  stagesStore.loadStages();
});  // NO deps array
```

- Guards data loading but does **not** independently redirect to `/signin`.
- Relies entirely on the parent authenticated layout for redirect behavior.

---

## 3. DashboardBoot Component

**Does not exist.** A search of `/workspace/src/` for any file matching `DashboardBoot*` returned 0 results. There is no equivalent component in `src/components/auth/`, `src/app/components/`, or anywhere else in the codebase.

---

## 4. BootSplash / Boot Loading Component

**Does not exist.** Searches for `*splash*` and `*boot*` in `/workspace/src/` returned 0 results. There is no dedicated boot splash or initial loading animation component. The nearest equivalent is the inline `<Spinner>` rendered inside the root layout (`src/app/layout.tsx` lines 37–39) while `authStore.isDeterminingAuth === true`, but this is inline JSX, not a separate component.

---

## 5. Middleware

**Does not exist.** Neither `/workspace/src/middleware.ts` nor `/workspace/middleware.ts` exists. No Next.js middleware is present in the project. All auth gating is done client-side via MobX reactions and `useEffect` hooks.

---

## 6. Cookie Patterns

**No cookie-based auth patterns exist.** A search across all of `/workspace/src/` for `aj_signed_in` and `document.cookie` returned **zero matches**. Auth state is managed entirely in-memory via the MobX `AuthStore` (using Amplify's `fetchAuthSession()` under the hood — which stores the Cognito tokens in browser `localStorage`, not cookies).

---

## 7. `getUser` API — `src/api/user/getUser.ts`

```ts
export async function getUser(): Promise<User> {
  try {
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/user`, {
        headers: {
            'Authorization': await authStore.getAccessToken() || '',
            'Content-Type': 'application/json'
        },
    });
    return await checkResponseAndGetJson(response) as unknown as User;
  } catch (error) {
    throw Error((error as Error).message || 'An unknown error occurred getting the user');
  }
}
```

- Calls `GET <NEXT_PUBLIC_API_BASE_URL>/user` with the Amplify access token as a Bearer-style `Authorization` header.
- Returns the `User` object. Throws on failure.
- Does **not** set `signedIn` or any auth state — it only fetches user profile data.
- Called from `authStore.loadUser()` (lines 123–133 of AuthStore), which is triggered by the authenticated layout when `signedIn === true` and `user` is not yet loaded.
- `checkAuth()` does **not** call `getUser` — `checkAuth` only checks the Amplify token.

---

## 8. Auth-Related `useEffect` Patterns Across Authenticated Pages

### Redirect-issuing `useEffect`s

Only one component issues a redirect: `src/app/(authenticated)/layout.tsx` line 19 via `router.push('/signin')` inside the `reaction` / immediate-call pattern.

### Data-guard `useEffect`s (no redirect, just bail)

All authenticated pages guard their data-loading `useEffect`s with `if (!authStore.signedIn) return;`:

| File | Line | Pattern |
|------|------|---------|
| `src/app/(authenticated)/agents/page.tsx` | 336 | `if (!authStore.signedIn) return;` |
| `src/app/(authenticated)/tools/page.tsx` | 284 | `if (!authStore.signedIn) return;` |
| `src/app/(authenticated)/stages/page.tsx` | 157 | `if (!authStore.signedIn) return;` |
| `src/app/(authenticated)/stages/[stage_id]/page.tsx` | 120 | `if (!authStore.signedIn) return;` |
| `src/app/(authenticated)/chat-pages/page.tsx` | 27 | `if (!authStore.signedIn) return;` |
| `src/app/(authenticated)/sres/page.tsx` | 346 | `if (!authStore.signedIn) return;` |
| `src/app/(authenticated)/contexts/page.tsx` | 74 | `if (!authStore.signedIn) return;` |
| `src/app/(authenticated)/contexts/[context_id]/page.tsx` | 217 | `if (!authStore.signedIn || !contextId) return;` |
| `src/app/(authenticated)/documents/page.tsx` | 272 | `if (!authStore.signedIn) return;` |
| `src/app/(authenticated)/integrations/page.tsx` | 74 | `if (!authStore.signedIn) return;` |
| `src/app/(authenticated)/api-keys/page.tsx` | 55 | `if (!authStore.signedIn) return;` (inside `fetchKeys` callback) |
| `src/app/(authenticated)/usage/page.tsx` | 56 | `if (!authStore.signedIn) return;` (inside `fetchUsage` callback) |

None of these issue a `router.push` — they all just early-return, deferring redirect responsibility entirely to the layout.

### Signup success step — `src/app/(public)/signup/components/SuccessStep.tsx` (lines 11–14)

```tsx
const handleGoToHome = async () => {
    await authStore.checkAuth()
    router.push('/');
}
```

- Explicitly calls `checkAuth()` before navigating to `/`, which re-determines the auth state after the signup flow. This is the only place (besides the root layout mount) where `checkAuth()` is called.

---

## 9. Post-Signin Navigation

From `src/app/(public)/signin/page.tsx` (lines 15–34):

```tsx
const routeBasedOnAuth = (signedIn: boolean) => {
    if (signedIn) {
        router.push('/agents');   // push, not replace
    }
    // no else — does nothing if not signed in
}

useEffect(() => {
    const disposer = reaction(
        () => authStore.signedIn,
        (signedIn) => { routeBasedOnAuth(signedIn); }
    );
    routeBasedOnAuth(authStore.signedIn);  // runs immediately on every render
    return () => { disposer(); };
});  // NO deps array
```

- Uses `router.push('/agents')` (not `router.replace`).
- Navigation fires in two ways:
  1. Immediately when the `useEffect` runs and `authStore.signedIn` is already `true` (e.g. if the user navigates back to `/signin` while already authenticated).
  2. Via the `reaction` callback when `authStore.signedIn` transitions from `false` to `true` — which happens in `submitSignIn()` after the Amplify sign-in call succeeds.
- The sign-in button calls `authStore.submitSignIn()` (line 38), which sets `signedIn = true` after the await (line 91 of AuthStore), which fires the reaction, which calls `router.push('/agents')`.

---

## 10. Flash Behavior Analysis

### Root layout (`src/app/layout.tsx`)

The root layout gates **all children** behind `isDeterminingAuth`:

```tsx
{authStore.isDeterminingAuth ? (
  <Spinner />
) : (
  children
)}
```

- `isDeterminingAuth` starts as `true` (AuthStore line 32).
- `checkAuth()` is called in `useEffect(fn, [])` — i.e., after first paint of the root layout.
- On the **very first paint**, the root layout renders the spinner (since `isDeterminingAuth` is still `true`). Then `checkAuth()` is called, `fetchAuthSession()` resolves, and `isDeterminingAuth` becomes `false`, causing a re-render that shows `children`.
- This prevents any authenticated or public page from rendering before auth state is known.

### Authenticated layout (`src/app/(authenticated)/layout.tsx`)

The authenticated layout does **not** gate content rendering:

```tsx
return (
  <Flex height="100vh" ...>
    <Header ... />
    <Flex flex="1" ...>
      <Sidebar ... />
      <Box flex="1" ...>
        {children}   // rendered unconditionally
      </Box>
    </Flex>
  </Flex>
);
```

- `{children}` (the protected page) is always rendered, regardless of `signedIn` state.
- The redirect to `/signin` lives in a `useEffect`, which runs **after** the component has painted.
- **Potential flash**: If a user somehow lands on an authenticated route with `signedIn === false` (and `isDeterminingAuth === false`), the full authenticated layout (Header + Sidebar + page content) will paint for one commit cycle before the `useEffect` fires and `router.push('/signin')` is called.
- In the normal boot sequence, this window is narrow: the root layout's spinner blocks rendering until `checkAuth()` resolves, so by the time the authenticated layout paints, `signedIn` is already `false` and the redirect fires in the next microtask/effect flush.

### Index page (`src/app/page.tsx`)

Renders only a `<Spinner>` — no protected content is ever shown. The `useEffect` immediately routes based on `signedIn`. Since the root layout's spinner gate ensures `checkAuth()` has completed before this page renders, the spinner here is very briefly visible (one frame) before `router.push` fires.

---

## Summary: What Does NOT Exist

| Feature | Status |
|---------|--------|
| `loggingOut` field on AuthStore | **Absent** |
| `forceRefreshAccessToken()` on AuthStore | **Absent** |
| `handleAuthFailure()` on AuthStore | **Absent** |
| `DashboardBoot` component | **Absent** |
| Boot splash / loading animation component | **Absent** (inline spinner only in root layout) |
| `middleware.ts` (Next.js middleware) | **Absent** |
| `aj_signed_in` cookie | **Absent** (no cookies used for auth) |
| `document.cookie` usage | **Absent** |
| Backend `/user` call inside `checkAuth()` | **Absent** (`checkAuth` only reads Amplify token) |
| `router.replace` for post-signin nav | **Absent** (`router.push` is used) |

## Summary: Auth Flow as It Currently Exists

1. App boots → root layout (`src/app/layout.tsx`) renders spinner (`isDeterminingAuth = true`).
2. Root layout `useEffect` fires → `authStore.checkAuth()` → `fetchAuthSession()` from Amplify → sets `signedIn` and `isDeterminingAuth = false`.
3. Root layout re-renders → removes spinner → shows `children`.
4. If at `/`, `IndexPage` routes to `/agents` or `/landing` based on `signedIn`.
5. If at `/agents` (or any authenticated route), `AuthenticatedLayout` renders **full shell including children immediately**, then `useEffect` fires and redirects to `/signin` if `!signedIn`.
6. If at `/signin`, `SignInPage` renders immediately; upon successful `submitSignIn()`, reaction fires → `router.push('/agents')`.
7. `authStore.loadUser()` is called lazily from the authenticated layout when `signedIn === true` and `user` is not yet loaded; calls `GET /user`.
