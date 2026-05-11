# Project 10 — Frontend Foundations

**Estimate:** 🟡 2–3 CWP
**Status:** Planned — **gates project 08.**
**Gate:** Must land before page-by-page Shadcn migration begins in project 08. None of these change behaviour the user sees; all of them change the shape of every future page.
**Owner:** Keanu + AI contexts
**Related projects:** 08 (AI-first frontend kit — this is its prerequisite); 09 (interactive landing demo — needs the layout split and auth boundary in place to render the public route group cleanly).

## Objective

Get the `ajentify-app` foundation right *before* any page-by-page Shadcn migration starts, so every new page built on top of it inherits the correct patterns instead of perpetuating the existing ones.

This is not a feature project. The user sees nothing when it ships. It exists because if the foundation isn't fixed first, every page rewritten in project 08 will have to relitigate the same problems individually, and the patterns we then ship in `frontend-governance.md` will be misshapen because they were discovered against bad bones.

**Done = a coding agent doing project 08 can mechanically follow the governance doc (`frontend-governance.md`) and produce correct pages without needing to re-derive the architecture.**

## Architecture model

`ajentify-app` is **three apps in one repo**, with three different shapes. This project is what makes them cleanly separable. Each gets its own route group, its own provider stack, its own bundle.

**The authenticated dashboard (`(authenticated)/`) is a "browser app"** — same shape as Linear, Notion, Cursor:

- After sign-in, a single branded splash/boot screen covers the moment while auth resolves and route chunks prefetch. The user sees one loading state for "the app booting," not a different spinner per page.
- Once "in," the dashboard is snappy. Every top-level authenticated route has been prefetched in the background, so navigating between pages is instant.
- The MobX root store is constructed once at boot and lives in memory; every store's code ships together with the authenticated layout. Page transitions don't load store JS — only data.
- Each page handles its own data load with in-page skeletons. Using Next's `loading.tsx` mechanism exists as a cold-cache fallback, not the primary loading mechanism.
- The trade-off is a heavier first authenticated paint for snappy everything-after. For a power-user dashboard the user spends hours in, this is the right trade.

**The auth-flow surface (`(auth)/` — signin, signup, forgot-password, eventual SSO callbacks) is a small client app**:

- Lives in its own route group with its own minimal provider stack: an `<AuthFlowStoreProvider>` that constructs `AuthStore` and `SignUpStore` independently of the dashboard's `RootStore`. Two `AuthStore` instances coexist in the codebase — one in the auth-flow bundle (drives the signin/signup forms; talks to Amplify; sets the `aj_signed_in` cookie on success), one in the dashboard's `RootStore` (drives the dashboard's mid-session interceptor and signed-in user surface). They share state via Amplify's session store and the cookie, not via a shared JS instance.
- The auth-flow bundle ships Amplify, MobX, and Chakra (until the shadcn migration), but **not** the dashboard list-cache stores, builder stores, or `RootStore`. It's heavier than `(public)` and lighter than `(authenticated)`.
- After a successful signin, the explicit handoff is `router.replace('/agents')`. The dashboard's `<DashboardBoot>` then mounts, runs its own `auth.checkAuth()` against the backend, and the boot splash covers the round-trip. There is no reaction-driven cross-bundle navigation.

**The public surface (`(public)/` — marketing + docs + privacy) is RSC-first with optional client islands**:

- Landing, docs, privacy, etc. are server components by default. Crawlers see fully-rendered HTML with no JS execution required. Lighthouse and SEO ride on this.
- The dashboard's `RootStore`, MobX, Amplify, and Chakra do **not** ship to public chunks. The auth-flow's `AuthStore` and `SignUpStore` don't either. The public route group has its own minimal provider stack and may opt out of providers entirely.
- Client interactivity is opt-in per island. A small "auth-aware" island on docs pages can personalize code snippets to the signed-in user's API key / agent IDs / tool names — but the default (placeholder) version is what the server renders and the crawler indexes. Personalization is a hydration-time enhancement, never a server-render dependency.

These are not implementation details — they are the architecture project 08 and project 01 build on. Every deliverable below exists to lock one of them in.

## What's wrong today (the audit)

From the 2026-05-04 frontend audit, re-checked against the codebase 2026-05-07. Each item below maps to a deliverable.

1. **`app/layout.tsx` is `'use client'`.** This forces the entire tree to be client-rendered, blocks the Next.js `metadata` API, and bundles Chakra/Amplify/MobX into the marketing site. `<title>Ajentify</title>` is hand-written into `<head>`, bypassing Next's metadata pipeline.
2. **No `<Link>` anywhere in the dashboard.** Every navigation is `router.push(...)` from event handlers. No prefetch, no middle-click, no Cmd+click open-in-new-tab, no right-click "copy link". `agents/page.tsx:337` even does a manual `router.prefetch(...)` inside an effect to compensate. `<Link>` only shows up in `(public)/landing/components/*`.
3. **No `loading.tsx` / `error.tsx` / `not-found.tsx`.** Every page rolls its own skeletons and an unhandled throw kills the whole app.
4. **`useEffect` with no deps array, replicated across files.** `app/page.tsx`, `(authenticated)/layout.tsx`, `(public)/signin/page.tsx`, `(authenticated)/agents/page.tsx`, `(authenticated)/create-team/page.tsx`, `(authenticated)/chat/page.tsx`, every builder page. Each one tears down and rebuilds work on every render. Works because the effects are idempotent; one non-idempotent line and it explodes.
5. **`Amplify.configure(...)` runs at module-evaluation time of the root layout.** Should be in a single `lib/amplify.ts` consumed by the providers component.
6. **Auth gating is 100% client-side and doesn't actually validate.** `authStore.checkAuth` reads the local Amplify token, sets `signedIn = token !== undefined`, and that's it. A revoked or expired token still passes. The dashboard JS bundle ships to logged-out visitors. Redirects happen via `useEffect` + `reaction()` + `router.push()` after hydration, which produces a visible flash. There is no global 401 handler.
7. **Singleton-per-file MobX stores with no root.** `AuthStore.signOut()` has to manually `.reset()` 14 stores by name (and `refreshDashboardCaches.ts` is a second partial registry). Every new store added has to be registered in two places by hand.
8. **God stores hold page-scoped state.** `AgentBuilderStore` is 494 lines, `ToolBuilderStore` 569, `StructuredResponseEndpointBuilderStore` 521. They mix list caches, "currently being edited resource" form state, related data fetches, and per-page UI state (`presentedAgentTool`, `showPromptArgsInput`, `promptArgsInput`, etc.). The "currently editing" slice has no reason to be a singleton — its lifetime is exactly the lifetime of one builder page.
9. **Cross-store dependency by direct module import, with circular chains already present.** `AgentBuilderStore` imports `agentsStore` (`store/AgentBuilderStore.ts:11`). More critically, **three circular import chains already exist** at the module level: `AuthStore` ↔ `ChatPageBuilderStore`, `AuthStore` ↔ `StructuredResponseEndpointBuilderStore`, and `AuthStore` ↔ `ToolBuilderStore`. Each of the three builder stores imports `authStore` to read `authStore.user?.organizations[0].id` in `initiateNew()`, and `AuthStore` imports all three builder singletons to call their `reset()` in `signOut()`. The JS module system tolerates these because singletons are only read at call-time, not at module parse-time. Deliverable E breaks all three chains: `AuthStore.signOut()` stops importing builder stores, and the builders receive `authStore` via constructor injection instead.
10. **`next.config.ts` ships a `child_process: false` webpack fallback.** Confirmed transitive through `aws-amplify` (`^6.10.2`, v6) — no file in `src/` directly imports any Node built-in. The fallback is a global webpack config entry and is expected to remain after the layout split, because Amplify still runs in `(authenticated)/` and `(auth)/` bundles. The investigation in deliverable J is whether aws-amplify v6's modular `aws-amplify/auth` imports already avoid the `child_process` reference (eliminating the need for the workaround entirely), or whether it must stay and simply be documented.
11. **`react-hooks/exhaustive-deps` ESLint rule is not enabled.** It would have caught every missing-deps `useEffect` in the audit.
12. **No SEO foundations.** No `app/sitemap.ts`, no `app/robots.ts`, no `metadata` export on any page, no per-route OG tags.
13. **No clear server / client / form / cache boundary.** Going forward, server state, builder/page-domain state, trivial UI state, and cached resource lists need clearly different homes — RSC fetch where future server-cookie auth permits, MobX list-cache stores on `RootStore`, **per-page MobX instances for domain-rich builder pages**, and `useState` for trivial page-local UI. Today they're all in MobX (singletons) or all in `useState` ad-hoc, with the singleton-vs-page-lifetime mismatch causing real bugs.
14. **`AlertProvider` is doing two unrelated jobs poorly.** A single global modal-style alert handles both error reporting and transient confirmations ("copied to clipboard"), and the only way for stores to surface anything is for every page to inject `showAlert` into every store via `setShowAlert(...)` inside a `useEffect` (16 page call sites and 18 stores wired). The constructor injection of the new root store would inherit this awkwardness if we don't kill it first; deliverable C does.
15. **No central API client.** Every `src/api/**/*.ts` file (~60 files) constructs its own `fetch` call, attaches a token via `await authStore.getAccessToken()`, and parses the response with a buggy helper (`checkResponseAndGetJson` re-reads the response body twice in the error path). The 401 interceptor required by deliverable F has nowhere to live.
16. **Auth-flow pages live in `(public)/` and import dashboard-store singletons.** `(public)/signin/page.tsx` imports `authStore`, `(public)/signup/*` imports `signUpStore` (5 files). After the singletons are deleted in deliverable E, these pages have no path to the stores they need. They also pull MobX + Amplify into the `(public)` bundle, defeating the layout split goal of "marketing chunks shed Amplify/MobX." The fix is the new `(auth)/` route group described in the Architecture model: signin, signup (and its step components), and forgot-password move there, leaving `(public)/` truly RSC-first.
17. **Tools and SREs re-fetch parameter definitions per builder, with no shared cache.** `ToolBuilderStore.loadParameterDefinition()` and `StructuredResponseEndpointBuilderStore`'s equivalent each call `getParameterDefinition(pdId)` ad-hoc. The list-cache pattern that exists for agents/tools/models doesn't exist for parameter definitions, so opening the same tool twice re-fetches its PD twice, and the tool/SRE list pages can't show parameter info without per-row API calls. A list-cache `ParameterDefinitionsStore` (load all PDs for the org once, expose a `getByPdId(id)` lookup) is the missing peer.
18. **Embedded chat-page surface (`/chat-pages`, `/chat-page-builder`, `(public)/chat-page/[id]`, `ChatPagesStore`, `ChatPageBuilderStore`) is being deprecated.** It's listed here so the executing agent knows: do **not** touch any of these in this project, do **not** include their routes in the prefetch list, do **not** sweep their API files through the new chokepoint, do **not** convert their builder. They will be deleted in project 08's page-by-page pass. Treat them as cold storage — the foundation work routes around them.

## Order of operations

This section is read first by the executing agent. **This plan is executed as a sequential agent lineage on a single feature branch.** Each deliverable is implemented by one agent, which commits its work to the branch before the next agent picks up. There is one PR for the whole project; it accumulates commits as deliverables land.

**Quality gate per deliverable:** After completing each deliverable, the implementing agent runs `lint`, `typecheck`, `test`, and `next build` and fixes any failures before committing. The branch must compile and pass checks at every commit — not just at the end.

**Handoff protocol:** Each implementing agent reads this plan, identifies the first unchecked deliverable, implements it fully, runs the quality gate, commits with a message like `feat(10): deliverable A — foundation prep`, and stops. The orchestrator then dispatches the next agent for the following deliverable.

The order is not arbitrary. It reflects three constraints:

1. **The codebase has to compile at every checkpoint.** Reordering breaks builds (e.g. running E before D removes the `authStore` singleton before the API client knows how to find auth a different way; running G before C tries to fix dep arrays on `useEffect`s that C deletes outright).
2. **Some deliverables clear boilerplate that other deliverables would otherwise inherit.** C deletes the `setShowAlert` plumbing before E does the root-store sweep, so the sweep is much smaller.
3. **Some lints want the codebase already cleaned up.** G enables `react-hooks/exhaustive-deps` at error level *after* the dep-less effects have been deleted by C and E.

Order:

- **A. Foundation prep** — ESLint rules (`exhaustive-deps` stays at warn for now), `lint:arch` script, vitest + RTL, CI grep guard.
- **B. Layout split** — server root layout, **three** route-group providers (`(public)/`, `(auth)/`, `(authenticated)/`), `lib/amplify.ts`. Move signin/signup into the new `(auth)/`. Public chunks shed Amplify/MobX/dashboard stores; auth-flow chunks shed dashboard stores. Independent of A.
- **C. Alerts → explicit error state and toasts** — delete `AlertProvider`/`Alert.tsx`, replace with `xxxError` observable fields on stores, Chakra's `useToast` for transient feedback. Deletes `setShowAlert` everywhere.
- **D. API client chokepoint** — build `src/api/client.ts` with auth and 401-interceptor bindings; sweep `src/api/**/*.ts` to use it (skipping the deprecated `chatpage/*` files and the auth-flow Amplify wrappers). Bindings wired up at the singleton-`authStore` level for now; deliverable E moves them to the root-store-owned `authStore`.
- **E. Root store + per-store DI** — introduce `ParameterDefinitionsStore`. Construct stores in dep-order, kill module singletons, expose `useStores()` for the dashboard. Construct a separate `<AuthFlowStoreProvider>` in `(auth)/providers.tsx` for the signin/signup pages (its own `AuthStore` + `SignUpStore` instances). Re-bind the API client's auth callbacks to the root-store-owned `authStore`. After this step there is no `export const xxxStore = new XxxStore()` anywhere.
- **F. Auth gating boundary** — `<DashboardBoot>`, real `/user` validation in `AuthStore.checkAuth`, hardened 401 interceptor (lives in D's chokepoint, wired through E's bindings), coarse middleware gate. Removes the optimistic `signedIn = true` flip from `submitSignIn`.
- **G. Enable `react-hooks/exhaustive-deps` at error + sweep** — promote the rule (already on at warn via `next/core-web-vitals`) to error level, fix every surviving warning. Of the **15 warnings** present today, roughly 12 are removed as a side effect of C and E/F; G fixes the ~3 that survive.
- **H. Builder stores: singleton → per-page instance** — four sequential commits, one per builder (`Tool`, `Agent`, `SRE`, `JsonDocument`), each committed separately to the branch. The `ChatPageBuilder` is **not** included — that surface is being deprecated and will be deleted in project 08. Each converted builder gets a focused domain-logic test before the next builder begins.
- **I. Navigation, prefetch, and segment files** — `<Link>` sweep (excluding deprecated chat-page routes), `DASHBOARD_ROUTES` + `router.prefetch(...)` effect inside `<DashboardBoot>`, `loading.tsx` / `error.tsx` / `not-found.tsx` per segment, `app/sitemap.ts` and `app/robots.ts`.
- **J. Webpack fallback cleanup** — investigate `child_process: false` in `next.config.ts`; remove if possible, otherwise leave a comment naming the offending import.

## Deliverables

### Must-ship (gates project 08)

#### A. Foundation prep

Ship before any structural changes. Tiny PR; biggest correctness-per-line in the project.

- [x] Add `vitest`, `@vitejs/plugin-react`, `@testing-library/react`, `@testing-library/jest-dom`, and `jsdom` to `devDependencies`. Add a `test` script in `package.json` (`vitest run` for CI, `vitest` for watch). CI runs `test` alongside `lint`, `typecheck`, and `lint:arch`. (vitest is the boring choice over jest given Next 15 + Vite-shaped test infra; if the team has already standardized on jest elsewhere, stick.)
- [x] Add a `typecheck` script to `package.json` (`"typecheck": "tsc --noEmit"`). The script does not currently exist — `package.json` only has `dev`, `build`, `start`, and `lint`. Every subsequent deliverable's PR must pass `typecheck` before merging.
- [x] Migrate `.eslintrc.json` to flat `eslint.config.mjs` (or keep the legacy file — Next 15 supports both). Enable:
  - `@typescript-eslint/no-floating-promises` (error)
  - `react/jsx-no-target-blank` (error)
  - `@typescript-eslint/no-explicit-any` — already active via the `next/typescript` preset; no explicit entry needed. Leave the inherited severity at `warn` (promote to error in a later cleanup project).
- [x] **Leave `react-hooks/exhaustive-deps` at warn.** It's already enabled at warn level via the `next/core-web-vitals` preset that `.eslintrc.json` extends. Promoting it to error now would fail on dozens of files that deliverables C and E delete entirely, producing busywork that gets thrown away. Deliverable G promotes it to error after C and E land.
- [x] Add a `lint:arch` script in `package.json` running three regex checks (each one bash line, exits non-zero on a hit). CI runs `lint:arch` alongside `lint`, `typecheck`, and `test`:
  1. **No `'use client'` in layouts.** `! grep -lE "^['\"]use client['\"]" src/app/**/layout.tsx`
  2. **No module-level store singletons.** `! grep -rE "^export const \w+Store = new \w+Store" src/store/`
  3. **No token-shaped console logs.** `! grep -rEi "console\\.(log|debug|info)\\([^)]*['\"](token|access[-_ ]?token|api[-_ ]?key|bearer)" src/`
- [x] Confirm there is no surviving `console.log('Token:', token)` in `src/`. (As of 2026-05-07 there is none; the CI guard above prevents regression.)
- [x] Address the three files carrying whole-file `/* eslint-disable */` suppressions at line 1: `src/api/tokenstreamingservice/TokenStreamingService.ts`, `src/lib/JSONRPCPeer.ts`, and `src/types/context.ts`. Either fix the underlying violations and remove the suppression, or add them to an explicit ESLint `ignorePatterns` / `overrides` block with a comment naming the reason. Unaddressed whole-file disables give those files zero ESLint coverage.
- [x] Create a CI workflow from scratch — no `.github/workflows/`, `.circleci/`, or any other CI configuration currently exists in the repository. The workflow must run `lint`, `typecheck`, `test`, and `lint:arch` and must gate merges on all four passing.

#### B. The layout split

- [x] Strip `'use client'` from `app/layout.tsx`. Make it a server component. **Current state of root layout (all of this is removed as part of this step):** it is wrapped with `observer(...)`, mounts three providers in order — `<NavigationGuardProvider>` → `<ChakraProviders>` → `<AlertProvider>` — calls `authStore.checkAuth()` in a `useEffect` with an empty dependency array, and gates rendering on `authStore.isDeterminingAuth`. Distribution when stripped: `NavigationGuardProvider` moves to `(authenticated)/providers.tsx` only (the `(auth)/` and `(public)/` routes do not need route-change guards); `ChakraProviders` moves to the route-group provider files described below; `AlertProvider` is removed from root and **not** added to any new provider (it is deleted in deliverable C); `authStore.checkAuth()` and the `isDeterminingAuth` rendering gate are removed from root here and re-housed in `<DashboardBoot>` (deliverable F).
- [x] Export a `metadata` (and later `generateMetadata`) from `app/layout.tsx`. Replace the hand-rolled `<head><title>` block.
- [x] **Move signin/signup into a new `(auth)/` route group** before touching providers:
  - `git mv src/app/(public)/signin src/app/(auth)/signin`
  - `git mv src/app/(public)/signup src/app/(auth)/signup`
  - Update imports nothing — the `@/` paths the pages use don't change. The on-disk URL structure is unchanged (Next route groups don't appear in the URL).
  - `(public)/chat-page/[chat_page_id]/` stays where it is for now (it's RSC, doesn't import dashboard stores). It will be deleted by project 08 along with the rest of the chat-pages surface.
- [x] Create **three separate provider files** — they are not the same module, and an executing agent must not collapse them into one:
  - `app/(authenticated)/providers.tsx` (`'use client'`) — the full dashboard stack: ChakraProvider (until shadcn migration removes it), the future ShadcnThemeProvider, NavigationGuardProvider, **`<StoreProvider>` constructed with `RootStore`** (added in deliverable E), and the `<DashboardBoot>` boundary (added in deliverable F). **This is the only file in the repo that imports `RootStore`.**
  - `app/(auth)/providers.tsx` (`'use client'`) — the auth-flow stack: ChakraProvider (until shadcn), `<AmplifyConfig />`, and **`<AuthFlowStoreProvider>`** (added in deliverable E) constructing `AuthStore` and `SignUpStore` independently of the dashboard's `RootStore`. **Does not import `RootStore` or any dashboard list-cache/builder store.** Imports `AuthStore` and `SignUpStore` *as classes only* — the same modules `RootStore` imports, just instantiated separately.
  - `app/(public)/providers.tsx` (`'use client'`) — only what public routes genuinely need (e.g. the future ShadcnThemeProvider, theming primitives). **Does not import `RootStore`, `AuthStore`, `SignUpStore`, or any dashboard store.** Marketing pages may opt out of mounting it entirely and stay pure RSC.
- [x] Create `lib/amplify.ts` exporting a single `configureAmplify()` call. Invoke from a tiny `<AmplifyConfig />` client component rendered once inside both `(authenticated)/providers.tsx` and `(auth)/providers.tsx`. `(public)/` does not call it; landing/docs/privacy never instantiate Amplify.
- [x] Each route group gets its own `layout.tsx`:
  - `app/(public)/layout.tsx` — server component. Mounts `(public)/providers.tsx` only if/where needed. SEO-friendly.
  - `app/(auth)/layout.tsx` — client component. Mounts `(auth)/providers.tsx`. Renders centered card-style chrome (matching today's signin/signup look) so individual pages don't each duplicate the layout shell.
  - `app/(authenticated)/layout.tsx` — client component (it uses Chakra's `useBreakpointValue` for the sidebar, and will host `<DashboardBoot>` after deliverable F). Mounts `(authenticated)/providers.tsx`.
- [x] Verify the bundles split as expected:
  - **Source checks (CI-greppable):**
    - `(public)/` contains no `RootStore` import and no `from '@/store/` import. (After signin/signup move, this becomes true; before, it isn't.)
    - `(auth)/` contains no `RootStore` import and no import from a dashboard list-cache or builder store (only `AuthStore` and `SignUpStore` are allowed).
    - `(authenticated)/` and the auth-flow code do not cross-import each other's providers.
  - **Install `@next/bundle-analyzer`** (it is not currently in `package.json`): add it to `devDependencies`, add an `"analyze": "ANALYZE=true next build"` script, and wire it in `next.config.ts` with the standard `withBundleAnalyzer` wrapper (enabled only when `process.env.ANALYZE === 'true'`). This is a prerequisite for the screenshot check below and for deliverable J's bundle investigation.
  - **Bundle analyzer screenshot in the PR** confirms:
    - `(public)/` chunks exclude `mobx`, `aws-amplify`, `AuthStore`, `SignUpStore`, and dashboard store code. The landing page currently imports `@chakra-ui/react` directly (`(public)/landing/page.tsx:1`); that's fine for now and will be replaced when project 09 rewrites the landing surface. The success criterion is "no Chakra chunk gets pulled in by `(public)/` files that don't directly import it," not "Chakra absent from public bundles entirely."
    - `(auth)/` chunks include `aws-amplify`, `mobx`, `AuthStore`, `SignUpStore`, and Chakra, and **exclude** every other store under `@/store/` and any `(authenticated)/` page chunk.
    - `(authenticated)/` chunks are largely unchanged in shape from today.

#### C. Alerts → explicit error state and toasts

The current `AlertProvider` is the source of two systemic problems: (1) every page injects `showAlert` into every store via `xxxStore.setShowAlert(showAlert)` inside a `useEffect`, which is the largest single source of dep-less effects in the codebase; (2) the same modal alert is overloaded for both error reporting (which deserves inline UI per page) and "copied to clipboard"-style transient toasts (which deserve a toast). Removing it now untangles deliverables E and G; doing it during the shadcn migration would mix two refactors.

##### C.1 The replacement pattern

Three categories of feedback, three homes:

- **Error states from store actions** → observable fields on the store. Stores expose `xxxError: string | null` (or per-action error fields when a store has multiple action surfaces). Pages render the error inline next to the affected UI. No callbacks.

  ```ts
  // Before
  async loadAgents(force = false) {
    try { ... }
    catch (error) {
      this.showAlert({ title: "Whoops", message: (error as Error).message });
    }
  }

  // After
  agentsError: string | null = null;
  async loadAgents(force = false) {
    this.agentsError = null;
    try { ... }
    catch (error) { this.agentsError = (error as Error).message; }
  }
  ```

- **Transient confirmations** ("copied", "deleted") → Chakra's built-in `useToast`. Stays Chakra until the shadcn migration in project 08, which will swap the toast primitive for shadcn's `<Sonner>`/`<Toaster>` in one move. **Stores never toast.** Pages toast directly:

  ```ts
  const toast = useToast();
  await navigator.clipboard.writeText(value);
  toast({ status: 'success', title: 'Copied', duration: 2000 });
  ```

- **Destructive confirms** ("delete this agent?") → Chakra's existing `<AlertDialog>` per-page (already used in `agents/page.tsx`). Already correct; no change.

##### C.2 Mechanical sweep

- [x] Delete `src/app/components/AlertProvider.tsx` and `src/app/components/Alert.tsx`. `<AlertProvider>` is currently mounted in the root `app/layout.tsx`; deliverable B removes it from there when root layout is stripped to a server component. Do not add it to `(authenticated)/providers.tsx` or any other route-group provider — it is being deleted here in C.
- [x] Delete every `setShowAlert` method and `showAlert` field from every store that has them. Sweep instruction: `rg -l "setShowAlert|showAlert" src/store/` finds the set; treat that grep as the source of truth, not the audit's hand-written list.
  - Stores that carry the standard `setShowAlert(showAlert) → showAlert(...)` plumbing today and need the full sweep (drop the field, drop the setter, replace each call site with an `xxxError` field per the C.1 pattern): `AgentsStore`, `ToolsStore`, `StagesStore`, `ContextsStore`, `IntegrationsStore`, `JsonDocumentsStore`, `StructuredResponseEndpointStore`, `ChatPageStore`, `CreateTeamStore`, `AgentBuilderStore`, `ToolBuilderStore`, `StructuredResponseEndpointBuilderStore`, `JsonDocumentBuilderStore`.
  - **Out of scope (deprecated):** `ChatPagesStore` and `ChatPageBuilderStore`. Skip them. They're being removed in project 08.
  - **Differently shaped — adapt the pattern, don't apply it literally:**
    - `ModelsStore` has no `showAlert` plumbing today; it just `console.error`s on failure. Add `modelsError: string | null` per the C.1 pattern (so list pages can show a real error instead of a silent empty state) and remove the `console.error`.
    - `SignUpStore` has its own internal alert emulation (`showAlertFlag`, `alertTitle`, `alertMessage`, `alertActions`), not the global `setShowAlert` callback. Replace those four fields with per-action `xxxError` fields (`signUpError`, `confirmSignUpError`, `createOrgError`) and let the signup step components render inline error blocks. The alert-replacement work is mechanical but the field names differ from the rest.
    - `AuthStore` already uses per-action error fields (`signInError`, `forgotPasswordError`); leave those alone. It carries no `showAlert` callback, so nothing to delete on the AuthStore side.
    - `JsonDocumentBuilderStore` is in the full-sweep list above but already has a `dataError: string | null` field (line 18) for JSON parse/validation errors — rendered in-UI, not via `showAlert`. The sweep must **preserve** `dataError`; add API-action error fields (`createDocumentError`, `updateDocumentError`, `deleteDocumentError`) alongside it rather than replacing it.
- [x] Replace every `this.showAlert({ title: 'Whoops', message: ... })` inside a store action with `this.<actionName>Error = (error as Error).message`. The action sets the error before the try block (so retries clear it) and lets `finally` handle the loading flag. Naming: `xxxError` for load errors, `<verbResource>Error` for one-off action errors (`deleteAgentError`, `saveToolError`, etc.). Keep names boring.
- [x] **Sweep every page call site** that calls `setShowAlert` on a store, regardless of whether it's inside a `useEffect`. The audit said "inside a `useEffect`", but at least one page (`(authenticated)/create-team/page.tsx:16`) calls `createTeamStore.setShowAlert(showAlert)` directly in render. Use `rg "setShowAlert" src/app/` to find every site; for each: delete the call, delete the surrounding `useEffect` if that was its only job, add inline error rendering near the loading skeleton:

  ```tsx
  {agents.agentsLoading && <Skeleton />}
  {agents.agentsError && (
    <InlineError message={agents.agentsError} onRetry={() => agents.loadAgents(true)} />
  )}
  {agents.agents && <AgentsList agents={agents.agents} />}
  ```

- [x] Add a tiny `<InlineError />` primitive at `src/app/components/InlineError.tsx`. Renders a Chakra `<Box>` with the error message + an optional retry button. ~20 lines.
- [x] For pages that legitimately need a toast (today: "copied to clipboard" in `(authenticated)/contexts/CopyButton.tsx` and a few list pages after delete actions), wire `useToast()` from `@chakra-ui/react` directly. **Do not** introduce a wrapper.
- [x] Delete `useAlert` imports across the codebase. The hook ceases to exist with the provider.

##### C.3 What survives the sweep

After C, the dependency profile of every store is `{}` (apart from the per-store list-cache deps that deliverable E adds). No `showAlert`. `RootStore`'s constructor in deliverable E will not need to thread `showAlert` (or anything else) into stores, which makes the construction graph in E.1 dramatically simpler.

Action errors are still observable; `observer` components react to them as expected. There is one less thing to register, one less footgun to forget, and the next "I added a new store and forgot to inject `showAlert`" bug class is permanently gone.

#### D. API client chokepoint

This deliverable is a structural move with two end states: (1) every `src/api/**/*.ts` file goes through one helper; (2) the helper has the right shape for the 401 interceptor that deliverable F plugs into. The chokepoint never imports a store directly — it gets its auth-side hooks via a setter, which is what keeps it stable across deliverables D → E → F.

##### D.1 File: `src/api/client.ts`

Public surface (full type signatures shown so the executing agent has no judgment calls left to make):

```ts
// src/api/client.ts

export interface RequestInput<TBody = unknown> {
  method: 'GET' | 'POST' | 'PATCH' | 'PUT' | 'DELETE';
  path: string;            // e.g. '/agents' or '/tools/abc123'
  query?: Record<string, string | number | boolean | undefined>;
  body?: TBody;            // JSON-serialized; pass FormData for the rare upload case
  headers?: Record<string, string>;
  signal?: AbortSignal;
  /** When true, the 401 interceptor is bypassed. Used by auth endpoints. */
  skipAuthInterceptor?: boolean;
}

export interface ApiClientAuthBindings {
  getAccessToken: () => Promise<string | undefined>;
  forceRefreshAccessToken: () => Promise<string | undefined>;
  handleAuthFailure: () => Promise<void>;
}

/** Called once during app boot from `(authenticated)/providers.tsx`. */
export function bindApiClientAuth(bindings: ApiClientAuthBindings): void;

/** The single function every `src/api/**/*.ts` file calls. */
export async function request<TResponse, TBody = unknown>(
  input: RequestInput<TBody>
): Promise<TResponse>;

export class ApiError extends Error {
  status: number;
  body: unknown;
  constructor(status: number, message: string, body: unknown);
}
```

##### D.2 Behaviour of `request<T>`

1. **URL construction.** Concatenate, **don't** use the `new URL(path, base)` two-arg form — that constructor strips any sub-path on `base` (`new URL('/agents', 'https://api.example.com/v1').toString() === 'https://api.example.com/agents'` — `/v1` is gone). Today every caller does `${process.env.NEXT_PUBLIC_API_BASE_URL}${path}` string concat, which preserves sub-paths; the chokepoint must do the same:

   ```ts
   const base = process.env.NEXT_PUBLIC_API_BASE_URL;
   if (!base) throw new Error('NEXT_PUBLIC_API_BASE_URL is not set');
   const trimmedBase = base.replace(/\/$/, '');
   const normalizedPath = input.path.startsWith('/') ? input.path : `/${input.path}`;
   const url = new URL(`${trimmedBase}${normalizedPath}`);
   ```

   Append `input.query` via `url.searchParams.set(k, String(v))` (skipping `undefined` values, coercing booleans/numbers to strings).
2. **Headers.** Default `Content-Type: application/json` for non-`FormData` bodies. Calls `getAccessToken()` from the bound auth and sets `Authorization: <token>` (matching the existing convention — the backend reads the raw Cognito access token as the auth header value, no `Bearer` prefix; verified via `api/agent/getAgents.ts:19`). Merges `input.headers` last so callers can override.
3. **Body.** `JSON.stringify(input.body)` if `input.body` is not `FormData` and not `undefined`. `FormData` is passed through; `Content-Type` is **not** set in that case, so the browser picks the multipart boundary.
4. **401 handling** (skipped entirely when `skipAuthInterceptor: true` or when the bindings are not yet attached):
   - First 401 → call `forceRefreshAccessToken()`. Re-issue the same request once with the refreshed token. If that returns 200, return its body normally. If it returns 401, fall through.
   - Second 401 → call the bound `handleAuthFailure()`. It is responsible for signing out, navigating to `/signin`, and the `loggingOut` sentinel (deliverable F.4). After it resolves, throw `new ApiError(401, 'Unauthorized', body)` so the caller's promise rejects rather than hanging.
5. **Other non-2xx** → parse the response body once (try JSON, fall back to text). Throw `new ApiError(status, message, body)` where `message` is `body.error` if present and `'Request failed with status N'` otherwise. (This replaces `checkResponseAndGetJson`'s buggy two-read flow.)
6. **2xx with empty body** (DELETE typically) → return `undefined as TResponse` if the response body is empty; otherwise parse and return JSON.
7. **Network error / fetch reject** → propagate as-is. The auth interceptor only triggers on actual 401 responses.

##### D.3 What `bindApiClientAuth` looks like at each step

The chokepoint never imports a store directly. The bindings flow in via a setter. This is the only way to keep the chokepoint and the ~60 sweep call sites stable across deliverables D → E.

**Bindings must be in place before the very first request.** `<DashboardBoot>` (deliverable F) calls `auth.checkAuth()` on mount, which calls `getUser()` via `request<T>`. If the bindings are wired in a sibling `useEffect`, React doesn't guarantee that effect runs before the boot effect — the first request can fire with no `Authorization` header, get a 401, the interceptor (correctly) bypasses retry because bindings are missing, and the user is "not signed in" forever on first paint.

The fix is to bind at **render time**, inside a tiny `<ApiClientBinder />` component, not in a `useEffect`. The binder calls `bindApiClientAuth(...)` synchronously in its render body and returns `null`. `bindApiClientAuth` is idempotent (it just overwrites the module-level handler refs), so re-binding on every render is fine. The binder is mounted as the **first child** of the relevant provider, before any siblings that might issue requests.

- **End of deliverable D (no root store yet).** `(authenticated)/providers.tsx` (the file deliverable B introduced) imports the singleton `authStore` and renders:

  ```tsx
  // src/app/(authenticated)/ApiClientBinder.tsx
  'use client';
  import { authStore } from '@/store/AuthStore';
  import { bindApiClientAuth } from '@/api/client';

  export function ApiClientBinder({ children }: { children: React.ReactNode }) {
    bindApiClientAuth({
      getAccessToken: () => authStore.getAccessToken(),
      forceRefreshAccessToken: () => authStore.forceRefreshAccessToken(),
      handleAuthFailure: () => authStore.handleAuthFailure(),
    });
    return <>{children}</>;
  }

  // (authenticated)/providers.tsx
  <ChakraProvider ...>
    <AmplifyConfig />
    <ApiClientBinder>
      {/* DashboardBoot, etc. */}
    </ApiClientBinder>
  </ChakraProvider>
  ```

  `authStore.forceRefreshAccessToken()` and `authStore.handleAuthFailure()` ship as **stubs** in this deliverable: refresh returns `getAccessToken()` (no force), failure does `window.location.assign('/signin')`. The interceptor logic and the call sites are correct from day one; the auth-side handlers are filled in deliverable F.

- **End of deliverable E (root store landed).** `<ApiClientBinder>` moves *inside* `<StoreProvider>` and now reads `auth` from `useStores()`. Still render-time, still synchronous:

  ```tsx
  // src/app/(authenticated)/ApiClientBinder.tsx
  'use client';
  import { useStores } from '@/store/StoreContext';
  import { bindApiClientAuth } from '@/api/client';

  export function ApiClientBinder({ children }: { children: React.ReactNode }) {
    const { auth } = useStores();
    bindApiClientAuth({
      getAccessToken: () => auth.getAccessToken(),
      forceRefreshAccessToken: () => auth.forceRefreshAccessToken(),
      handleAuthFailure: () => auth.handleAuthFailure(),
    });
    return <>{children}</>;
  }

  // (authenticated)/providers.tsx
  <ChakraProvider ...>
    <AmplifyConfig />
    <StoreProvider>
      <ApiClientBinder>
        {/* DashboardBoot, etc. */}
      </ApiClientBinder>
    </StoreProvider>
  </ChakraProvider>
  ```

  The chokepoint and every API call site are unchanged.

- **End of deliverable F.** `auth.forceRefreshAccessToken` and `auth.handleAuthFailure` get their real implementations (Amplify refresh, `loggingOut` sentinel, etc.). The interceptor begins handling 401s correctly with no further code changes.

**Auth-flow side note.** The `(auth)/` route group's signin/signup pages don't need the dashboard's API client interceptor — their only backend calls are direct Amplify ones (`signIn`, `signUp`, `confirmSignUp`, `forgotPassword`, `resetPassword`). They do **not** mount `<ApiClientBinder>`, and `(auth)/providers.tsx` does not call `bindApiClientAuth`. If at some point the auth flow needs a backend call (e.g. eager email-availability check), it goes through `request<T>` with `skipAuthInterceptor: true`, bound separately on the auth-flow side — but it doesn't today.

##### D.4 Sweep of `src/api/**/*.ts`

- [x] For each backend-talking file (64 total fetch-using files: 61 standard auth+fetch + 3 public-access; the chatpage/* carve-out below reduces the sweep to 59), replace the manual `fetch` with a `request<T>` call:

  ```ts
  // Before
  export async function getAgents(options: GetAgentsOptions = {}): Promise<Agent[]> {
    const params = new URLSearchParams();
    if (options.stage) params.set('stage', options.stage);
    const qs = params.toString();
    const url = `${process.env.NEXT_PUBLIC_API_BASE_URL}/agents${qs ? `?${qs}` : ''}`;
    const response = await fetch(url, {
      headers: {
        'Authorization': await authStore.getAccessToken() || '',
        'Content-Type': 'application/json',
      },
    });
    const agentsObj = await checkResponseAndGetJson(response);
    return agentsObj['agents'] as Agent[];
  }

  // After
  export async function getAgents(options: GetAgentsOptions = {}): Promise<Agent[]> {
    const { agents } = await request<{ agents: Agent[] }>({
      method: 'GET',
      path: '/agents',
      query: { stage: options.stage },
    });
    return agents;
  }
  ```

- [x] Auth-flow and Amplify-only API files don't go through `request<T>`. Leave them alone: `src/api/auth/signIn.ts`, `signOut.ts`, `signUp.ts`, `forgotPassword.ts`, `resetPassword.ts`, `confirmSignUp.ts` (all call AWS Amplify auth functions directly), and `src/api/user/updateUser.ts` (calls `updateUserAttributes` from `aws-amplify/auth` — does **not** use fetch, so it is not caught by the sweep grep either).
- [x] **Chat-page-related API files are out of scope.** `src/api/chatpage/*.ts` (`getChatPage`, `getChatPages`, `createChatPage`, `updateChatPage`, `deleteChatPage`) are part of the deprecated chat-pages surface (audit item 19) and will be deleted by project 08. Skip them in the sweep — leave them on the old `fetch` + `checkResponseAndGetJson` pattern. The one wrinkle: `(public)/chat-page/[chat_page_id]/page.tsx` is an RSC that calls `getChatPage`, `getContext`, `createContext` server-side. Today those latter two reach `authStore.getAccessToken()` (which silently returns `undefined` on the server). If we'd swept them through `request<T>`, the SSR call would break. By leaving the chat-page area on the old pattern, the deprecated page keeps working until project 08 deletes it. Do not invent a `requestServer<T>` for this; the carve-out is the right call.
- [x] **Public-access endpoints.** Three fetch files send no `Authorization` header today: `src/api/chatpage/getChatPage.ts` (already covered by the chatpage carve-out above), `src/api/tool/getTool.ts`, and `src/api/structuredresponseendpoint/getSRE.ts`. The latter two are intentionally public read endpoints but are **not** deprecated — include them in the sweep. After the sweep, `request<T>` will attach an `Authorization` header when a token is available. For anonymous visitors the token is `undefined`; `request<T>` must omit the header entirely in that case rather than sending an empty string (the existing `|| ''` fallback is one of the bugs this chokepoint fixes). Verify with the backend that receiving an auth header on these endpoints when signed in does not change their response before merging the sweep PR.
- [x] Delete `src/utils/api/checkResponseAndParseJson.ts` only **if** the chat-page files no longer reference it after the sweep. They do (per the carve-out above), so leave the helper in place; it'll be deleted alongside `src/api/chatpage/*.ts` in project 08.
- [x] Add a focused vitest for `src/api/client.ts` covering: URL construction (preserving sub-paths on `NEXT_PUBLIC_API_BASE_URL`), query serialization (drops `undefined`), 401-then-refresh-then-200 happy path, 401-then-refresh-then-401 unhappy path, non-2xx error shape, empty-body 2xx.

##### D.5 What's deliberately not in the chokepoint

- **WebSocket / streaming clients** (`src/lib/JSONRPCPeer.ts`, `src/lib/SimpleWebSocketClient.ts`, and `src/api/tokenstreamingservice/TokenStreamingService.ts`) stay as-is. They have their own auth handshake (auth is passed as a constructor parameter and injected into the first JSON-RPC message, not as an HTTP header); routing them through `request<T>` doesn't fit.
- **Server-side fetches.** `request<T>` is client-only (uses Amplify under the hood). The "Nice-to-ship" server-cookie session item below would add a parallel `requestServer<T>` helper; not now.
- **Per-call retries beyond the 401-refresh path.** No 5xx auto-retry. If a load 5xxs, the store's error field shows the message and the user retries explicitly.

#### E. Root store + per-store DI

The pattern is **explicit per-store dependency injection**, not pass-the-root. Each store's constructor declares the *specific* stores it depends on. The `RootStore` constructor's body is the dependency graph: stores are constructed in dependency order, and each one receives its concrete dependencies as constructor arguments.

After deliverable C, no store needs `showAlert` — error reporting is observable state on the store itself. The constructor injection in this deliverable is therefore much smaller in surface area than the original draft of this plan suggested.

**`RootStore` holds the dashboard's list/cache stores, the dashboard-side `auth`, and the persistent chat session.** Builder stores (Tool / Agent / SRE / JsonDocument) are **not** on the root — they are page-scoped MobX instances created and owned by the builder pages themselves (deliverable H). The root never constructs them, never resets them, never includes them in `bootLoad()`. **The auth-flow stores `AuthStore` and `SignUpStore`** also live on a *separate* `<AuthFlowStoreProvider>` mounted by `(auth)/providers.tsx` (E.2), so the dashboard's `RootStore.auth` and the auth-flow's `AuthStore` are two different instances of the same class — by design (see Architecture model and E.2).

##### E.1 New: `ParameterDefinitionsStore`

Today both `ToolBuilderStore.loadParameterDefinition()` and the SRE builder's equivalent re-fetch a single PD by id every time a builder opens, with no shared cache. The list-cache pattern that exists for agents/tools/models doesn't exist for parameter definitions. Add it now so it lands as part of the same `RootStore` work, not as a one-off later.

- [x] Create `src/store/ParameterDefinitionsStore.ts`. Shape:

  ```ts
  class ParameterDefinitionsStore {
    parameterDefinitions: ParameterDefinition[] | undefined = undefined;
    parameterDefinitionsLoading = false;
    parameterDefinitionsError: string | null = null;
    private byPdId: Map<string, ParameterDefinition> = new Map();

    constructor() { makeAutoObservable(this); }

    loadParameterDefinitions = async (force = false) => {
      if (this.parameterDefinitions && !force) return;
      this.parameterDefinitionsError = null;
      try {
        this.parameterDefinitionsLoading = true;
        const pds = await getParameterDefinitions();
        this.parameterDefinitions = pds;
        this.byPdId = new Map(pds.map((pd) => [pd.pd_id, pd]));
      } catch (error) {
        this.parameterDefinitionsError = (error as Error).message;
      } finally {
        this.parameterDefinitionsLoading = false;
      }
    };

    /** Synchronous lookup. Returns undefined if the PD isn't cached. */
    getByPdId = (pdId: string): ParameterDefinition | undefined => this.byPdId.get(pdId);

    /** Cache-or-fetch: used by builders that open before the list-cache is warm. */
    ensurePdId = async (pdId: string): Promise<ParameterDefinition | undefined> => {
      const cached = this.byPdId.get(pdId);
      if (cached) return cached;
      try {
        const pd = await getParameterDefinition(pdId);
        this.byPdId.set(pd.pd_id, pd);
        return pd;
      } catch (error) {
        this.parameterDefinitionsError = (error as Error).message;
        return undefined;
      }
    };

    reset = () => {
      this.parameterDefinitions = undefined;
      this.parameterDefinitionsLoading = false;
      this.parameterDefinitionsError = null;
      this.byPdId = new Map();
    };
  }
  ```

- [ ] `ToolBuilderStore` and `StructuredResponseEndpointBuilderStore` consume `ParameterDefinitionsStore` (injected via constructor in deliverable H). On builder open, they call `parameterDefinitions.ensurePdId(pdId)` instead of `getParameterDefinition(pdId)` directly. The standalone `getParameterDefinition` API call is still used by `ensurePdId`'s fallback path; `getParameterDefinitions` (plural) drives the warm-cache list load.
- [x] `bootLoad()` (E.5) calls `parameterDefinitions.loadParameterDefinitions()` alongside `models.loadModels()` so the cache is hot before any builder opens.

##### E.2 Shape of `RootStore`

- [x] Create `src/store/RootStore.ts`. Stores are exposed as **flat named fields**: `root.auth`, `root.agents`, `root.tools`, etc. Not nested under `root.stores`.
- [x] `RootStore` constructor takes no arguments. The example below shows the construction *graph*; the **exact** dependency list each store ends up with is whatever its methods actually reach for, audited at PR time. Stores with no other-store deps take no arguments. **Don't paste the example literally — most stores in the current codebase have zero deps and the audit might leave them that way.**

  ```ts
  constructor() {
    // No-dep leaves first
    this.parameterDefinitions = new ParameterDefinitionsStore();   // new in E.1
    this.models               = new ModelsStore();
    this.contexts             = new ContextsStore();
    this.integrations         = new IntegrationsStore();
    this.stages               = new StagesStore();
    this.tools                = new ToolsStore();
    this.agents               = new AgentsStore();
    this.jsonDocuments        = new JsonDocumentsStore();
    this.sres                 = new StructuredResponseEndpointsStore();
    this.createTeam           = new CreateTeamStore();

    // Persistent chat session (placement here is forward-looking — see E.5)
    this.chat = new ChatPageStore();

    // Auth last; it gets a callback back into the root for resets.
    this.auth = new AuthStore({ resetAll: () => this.resetAll() });
  }
  ```

  Notes on what's *not* on the root:
  - **`SignUpStore` is not here.** It's auth-flow only and lives on `<AuthFlowStoreProvider>` (E.2.1).
  - **`ChatPagesStore` and `ChatPageBuilderStore` are not here.** That feature is being deprecated (audit item 19); leave the old singletons alone. They'll be deleted in project 08.
  - **Builder stores (Tool / Agent / SRE / JsonDocument) are not here.** They're per-page MobX instances (deliverable H).

- [x] **Stores hold their dependencies as private fields and call them directly.** `this.tools.loadTools()` because `tools` was injected, **not** `this.root.tools.loadTools()`. Stores **do not** hold a reference to the root.
- [x] **Stores must not perform side effects in their constructor.** No data fetches, no MobX `reaction()` / `autorun()` setup. Boot-time data loading lives in `RootStore.bootLoad()` (E.5), called once by `<DashboardBoot>` after auth resolution.

##### E.2.1 The auth-flow provider

- [x] Create `src/store/AuthFlowStore.ts` (a thin "root" for the auth-flow side). It does **not** subclass `RootStore`; it owns just the two stores the signin/signup pages need:

  ```ts
  export class AuthFlowStore {
    auth: AuthStore;
    signUp: SignUpStore;

    constructor() {
      // The auth-flow's auth has no resetAll callback because there's no other
      // store on this side to reset. signOut from the auth-flow is rare (the
      // user is already on /signin); when it happens, AuthStore.signOut just
      // calls awsSignOut() and clears the cookie.
      this.auth = new AuthStore({ resetAll: () => this.auth.reset() });
      this.signUp = new SignUpStore();
    }
  }
  ```

- [x] Add `<AuthFlowStoreProvider>` and a `useAuthFlowStores()` hook in `src/store/AuthFlowStoreContext.tsx` (separate file from `StoreContext.tsx`). The naming is intentionally distinct so a developer in a `(auth)` page can't accidentally call `useStores()` and expect the dashboard root.
- [x] Mount `<AuthFlowStoreProvider>` only inside `app/(auth)/providers.tsx`. **Do not** mount it from `(public)/` or `(authenticated)/`.
- [x] The signin and signup pages replace `import { authStore } from '@/store/AuthStore'` (and the same for `signUpStore`) with `const { auth, signUp } = useAuthFlowStores()`.
- [x] **Two `AuthStore` instances exist at runtime** — one in the auth-flow bundle, one in the dashboard's `RootStore`. They share state via Amplify's session store and the `aj_signed_in` cookie, not via JS. This is the intended shape; it's what keeps the auth-flow bundle from pulling in `RootStore`. Document this at the top of `AuthFlowStore.ts` so the next reader doesn't try to "fix" it.

##### E.3 Provider, hook, sweep (dashboard side)

- [x] Add `<StoreProvider>` and a single `useStores()` hook (returning the root for destructuring: `const { agents, auth } = useStores()`) in `src/store/StoreContext.tsx`. **Do not** add a parametrized `useStore('agents')`.
- [x] Mount `<StoreProvider>` only inside `app/(authenticated)/providers.tsx`. The provider constructs `new RootStore()` once and provides it via context. **Do not** mount it from `(public)/` or `(auth)/`.
- [x] Replace every `import { xxxStore } from '@/store/XxxStore'` in components under `(authenticated)/` (and `src/app/components/` for components only used by the dashboard) with `useStores()`. Roughly a 30-file mechanical sweep.
- [x] Delete every module-level singleton (`export const xxxStore = new XxxStore()`) from every store file the dashboard touches **and** from `AuthStore` and `SignUpStore` (those are now constructed by `AuthFlowStore` for the auth-flow side and by `RootStore` for the dashboard side). Each store file exports the class only. The `lint:arch` script from deliverable A will fail CI if one is added back.
  - The two singletons that survive this PR are `chatPagesStore` and `chatPageBuilderStore` (deprecated; deleted in project 08). The `lint:arch` regex (`^export const \w+Store = new \w+Store`) will match them, so the script's exclusion list explicitly carves out `src/store/ChatPagesStore.ts` and `src/store/ChatPageBuilderStore.ts`. Add a comment in `lint:arch` naming the carve-out and the project that removes it (project 08).
- [x] **Update `<ApiClientBinder>` to source `auth` from `useStores()`.** This is the swap-over described in D.3's "End of deliverable E" section — same render-time binding pattern, now reading from the root. The chokepoint and every API call site are untouched.

##### E.4 Reset and refresh

- [x] `RootStore.resetAll()`: iterates its own fields and calls `reset()` on each that has one. The implementation is the root's job; individual stores don't know about each other for reset.
- [x] `AuthStore.signOut()` is a thin wrapper: it calls Amplify's `awsSignOut()`, deletes the `aj_signed_in` cookie (`document.cookie = 'aj_signed_in=; Path=/; Max-Age=0'`), then calls the `resetAll` callback it received in its constructor, then sets `signedIn = false`. **Do not** restore the manual list of `xxxStore.reset()` calls; that's exactly the pattern this deliverable removes. (Render-phase `redirect('/signin')` from `<DashboardBoot>` re-rendering on the `signedIn` flip handles the navigation; deliverable F.1.) **Circular-import elimination:** because `AuthStore` no longer imports any builder store singleton, the three circular module-level chains identified in audit item 9 (`AuthStore` ↔ `ChatPageBuilderStore`, `AuthStore` ↔ `StructuredResponseEndpointBuilderStore`, `AuthStore` ↔ `ToolBuilderStore`) are broken as a concrete byproduct of this change. The builder stores still receive an `AuthStore` instance via constructor injection (deliverable H), so the dependency direction is preserved — it is simply no longer circular.
- [x] Move `src/store/refreshDashboardCaches.ts` onto `RootStore.refreshDashboardCaches()` and **delete the original file**:

  ```ts
  refreshDashboardCaches() {
    this.agents.loadAgents(true).catch(() => undefined);
    this.tools.loadTools(true).catch(() => undefined);
    this.sres.loadSREs(true).catch(() => undefined);
    this.jsonDocuments.loadDocuments(true).catch(() => undefined);
    this.stages.loadStages(true).catch(() => undefined);
    this.parameterDefinitions.loadParameterDefinitions(true).catch(() => undefined);
  }
  ```

  Boring, explicit, easy to grep. No "opt-in" pattern. Adding a new store that should refresh-on-stage-change means editing one method.

##### E.5 Boot data load order

After `<DashboardBoot>` (deliverable F) confirms the user is signed in, the root store kicks off `bootLoad()`:

- [x] `RootStore.bootLoad()` fires loads in this order:
  1. `parameterDefinitions.loadParameterDefinitions()` and `models.loadModels()` — no dependencies, fired in parallel. PDs are loaded eagerly so builders open instantly with their parameter trees already cached (E.1).
  2. `tools.loadTools()` and `sres.loadSREs()` — fired after step 1 resolves, in parallel with each other (the dep on PDs is a render-time lookup, not a load-time gate, so technically these could go in step 1; sequencing them after step 1 keeps the network burst small and the boot trace easy to read).
  3. `agents.loadAgents()` — fired after step 2.
  4. Lower-priority stores (`integrations`, `stages`, `contexts`) fire alongside step 3, since their data isn't blocked by anything.
- [x] Each `loadXxx` call is awaited only as far as ordering requires. Failures are non-fatal — a load that 401s goes through the interceptor (deliverable F); a load that 5xx-es sets the store's error field (deliverable C) and leaves the store empty.

##### E.6 Where the auth-flow / one-shot stores end up

- **Dashboard side (`RootStore`):** `auth` (a `new AuthStore({ resetAll })`), `createTeam`, and the list-cache stores. `auth` is the one the API client interceptor (D / F.4) talks to.
- **Auth-flow side (`AuthFlowStore`, mounted by `(auth)/providers.tsx`):** `auth` (a *separate* `new AuthStore(...)`) and `signUp`. These are the instances the signin and signup pages use. See E.2.1.
- **`SignUpStore` does not appear on `RootStore`.** It exists only on `AuthFlowStore`. After signup completes, the user is navigated to `/agents` and the dashboard's `RootStore` boots fresh; `signUp` state is discarded with the auth-flow bundle.
- The four live builder stores (Tool, Agent, SRE, JsonDocument) do **not** go on the root — see deliverable H. `ChatPageBuilderStore` is deprecated and isn't decomposed at all.
- `ChatPageStore` (the live-chat session state, **not** `ChatPagesStore` the deprecated list cache) goes on the root at `root.chat`. **Placement here is forward-looking** — today `ChatPageStore` is consumed only by `/chat`, so moving it to the root doesn't change behaviour. Project 08's persistent chat panel (governance §16) is what makes the placement load-bearing; keeping it on the root in this project means project 08 doesn't need to relocate it.

##### E.7 Tests

- [x] Write `src/store/RootStore.test.ts` using the vitest stack from deliverable A. At minimum:
  - Boots a `new RootStore()` without throwing.
  - Calls `root.resetAll()` and asserts every field with a `reset()` method got called and that no error was thrown.
  - Asserts no field is `undefined` after construction (catches dependency-order regressions).
- [x] Write `src/store/AuthFlowStore.test.ts` covering the same three cases for `AuthFlowStore` — boots, resets `auth`, no undefined fields.

#### F. Auth gating boundary

This deliverable owns four things: the boot orchestration component, real backend-validated auth, the hardened 401 interceptor's auth-side implementation (the chokepoint and call sites already exist from D), the post-signin handoff, and the coarse server-side cookie gate. Each item is small; getting any one of them subtly wrong is what makes auth UX bad. Be precise.

##### F.1 `<DashboardBoot>` — the authenticated-side orchestrator

- [x] Create `src/app/components/auth/DashboardBoot.tsx` (`'use client'`). This component is the **single home** of: the boot splash, auth determination, post-auth dashboard prefetch (deliverable I), and the unauthenticated redirect. There is exactly one instance of it in the app, mounted by `app/(authenticated)/layout.tsx`. **Completing the deliverable B migration:** deliverable B already removed `checkAuth()` and the `isDeterminingAuth` spinner from `app/layout.tsx` (the root layout). `<DashboardBoot>` is their new home — it is not being added alongside the root layout's logic, but replacing it for the authenticated route group.
- [x] Behaviour:
  - While `auth.isDeterminingAuth` is true: render `<BootSplash />` (a separate small component holding the branded loading animation; created in this deliverable).
  - When determination resolves to **not signed in**: call `redirect('/signin')` from `next/navigation` **during render** (not in an effect, not in a handler). The component returns `null` after the redirect call; the redirect throws a navigation signal Next catches.
  - When determination resolves to **signed in**: kick off `root.bootLoad()` (deliverable E.5) and the per-route prefetches (deliverable I) in a single effect; render `children`.
- [x] **`redirect()` discipline.** Render-phase only. Not in `useEffect`, not in event handlers, not in `reaction()`. For mid-session sign-outs (the 401 interceptor or a user-clicked Sign Out), do not call `redirect()`; instead let `<DashboardBoot>` re-render via its `observer` decorator on the `signedIn` flip, which re-enters the not-signed-in branch and calls `redirect('/signin')` from the next render. Belt-and-braces: the 401 interceptor also does `window.location.assign('/signin')` (F.4) because it's outside React; whichever fires first, Next dedupes.
- [x] Wrap `app/(authenticated)/layout.tsx`'s body in `<DashboardBoot>`. The layout stays a client component (Chakra `useBreakpointValue` for the sidebar).
- [x] Remove the per-page `useEffect` + `reaction()` + `router.push()` redirect machinery from: `app/page.tsx`, `(authenticated)/layout.tsx`, `(auth)/signin/page.tsx` (moved from `(public)/` in deliverable B). Sweep `src/` for any other `reaction(() => authStore.signedIn, ...)` (or `reaction(() => auth.signedIn, ...)`) patterns and remove them too. **Not in scope for F.1:** `(authenticated)/agents/page.tsx` guards data loading with `if (!authStore.signedIn) return;` but does **not** have `reaction()` + `router.push()` redirect machinery — leave it untouched here (the depless effect is addressed by deliverable G). `(authenticated)/create-team/page.tsx` has a `reaction()` at line 25 that drives a step scroll animation, not an auth redirect; it is also not in scope for F.1.

##### F.2 Real backend-validated auth in `AuthStore.checkAuth`

- [x] In `AuthStore.checkAuth`, after fetching the token, call `getUser()` (`/user`) to validate. **"Signed in" means "the backend returned 200 to a token-bearing `/user` call,"** not "Amplify has a token in localStorage."
- [x] Failure policy:
  - 401 from `/user` → `signOut()` and set `signedIn = false`. Stale token; treat as not signed in.
  - 5xx or network failure → set `signedIn = false`. Cautious policy: a flaky backend should not gate the user *into* the dashboard, only out of it.
  - 200 → set `signedIn = true`, cache the user response on `authStore.user`.
- [x] `isDeterminingAuth` covers the **whole** boot — token fetch + `/user` call. Only flips to `false` after either branch above completes. (`isDeterminingAuth` is already initialized to `true` in `AuthStore`'s class body — preserve this; it ensures `<BootSplash>` renders immediately on first paint before `checkAuth()` has run.)
- [x] **Remove the lazy `loadUser()` call from `app/(authenticated)/layout.tsx`** (currently the layout calls `authStore.loadUser()` when `signedIn === true` and `authStore.user` is null). After F.2, `checkAuth()` already fetches and populates `authStore.user` on a 200 response; leaving the layout's call in place would hit `GET /user` twice per boot. Delete the `if (!authStore.user) { authStore.loadUser(); }` block from the authenticated layout.
- [x] **Delete `this.signedIn = true` from `AuthStore.submitSignIn`** (currently `AuthStore.ts:91`). With F.2 in place, `signedIn` flips only inside `checkAuth` after the backend has confirmed the token; flipping it optimistically inside `submitSignIn` would defeat F.2. The post-signin path becomes: `submitSignIn` resolves → page calls `router.replace('/agents')` → `<DashboardBoot>` mounts → `checkAuth()` runs → `signedIn = true` after `/user` returns 200. The boot splash covers the round-trip (F.3).

##### F.3 The post-signin handoff (replaces the old `reaction()` pattern)

- [x] In `(auth)/signin/page.tsx`, the submit handler does the navigation explicitly. `auth` comes from `useAuthFlowStores()` (E.2.1):

  ```ts
  const { auth } = useAuthFlowStores();
  const onSubmit = async () => {
    await auth.submitSignIn();
    if (!auth.signInError) router.replace('/agents');
  };
  ```

  **Deliberate change from current code:** the existing `(public)/signin/page.tsx` uses `router.push('/agents')`. This deliverable changes it to `router.replace` so `/signin` is not pushed onto the browser's history stack — after signing in, pressing the back button takes the user to wherever they were before `/signin`, not back to the sign-in form.

  After replacing `/agents`, the auth-flow bundle unmounts; `<DashboardBoot>` mounts inside the dashboard bundle; the dashboard's *own* `auth` (a different `AuthStore` instance — see E.2.1) runs its `checkAuth()` (token + `/user`); the boot splash shows for the duration of that round-trip. **This is the intended UX** — "preparing your workspace" is the right thing to see between the click and the dashboard. Do not optimize past it by skipping the splash; the cost is one round-trip and the win is consistency with cold-load and refresh-load.

- [x] In `AuthStore.submitSignIn`, after `await signIn(...)` resolves successfully (and *before* it returns), set the advisory cookie (F.5) inline:

  ```ts
  document.cookie = 'aj_signed_in=1; Path=/; SameSite=Lax';
  ```

  Mirror in the `signUp` confirmation path (`SignUpStore.confirmSignUp` after the auto-signin step) so confirmed-then-signed-in users have the cookie too. This is the only state shared between the two `AuthStore` instances — the cookie and Amplify's session — so getting it set here matters: the dashboard's `AuthStore.checkAuth` reads the same Amplify session right after the navigation.

##### F.4 Hardened 401 interceptor — the auth-side implementation

The chokepoint and `bindApiClientAuth` already exist from deliverable D. This sub-deliverable is the *real* implementation of the auth-side methods that D shipped as stubs.

- [x] `AuthStore.forceRefreshAccessToken()`:
  ```ts
  forceRefreshAccessToken = async (): Promise<string | undefined> => {
    try {
      const session = await fetchAuthSession({ forceRefresh: true });
      return session.tokens?.accessToken.toString();
    } catch {
      return undefined;
    }
  };
  ```
- [x] `AuthStore.handleAuthFailure()`:
  1. Guarded by a `loggingOut` boolean field. If `loggingOut`, return immediately. (Prevents N concurrent failed requests from triggering N sign-outs.)
  2. Set `loggingOut = true`.
  3. Call `awsSignOut()` (Amplify only; **no backend `/logout` call** — see Risks for double-401-loop avoidance).
  4. Call the `resetAll` callback (passed in via constructor in deliverable E).
  5. Set `signedIn = false`. Delete the cookie:
     ```ts
     document.cookie = 'aj_signed_in=; Path=/; Max-Age=0';
     ```
  6. `window.location.assign('/signin')` as a hard navigation. (`<DashboardBoot>` will also re-render on the `signedIn` flip and call `redirect('/signin')` from render; either fires first; Next dedupes.)
  7. Reset `loggingOut = false` in a `finally`.
- [x] **Do not** add interceptor logic that chases 403s or other status codes. The interceptor handles 401 only. 403 (insufficient permissions, distinct from "not signed in") is the page's problem to render.

##### F.5 Middleware — Flavour A: coarse signed-in cookie

- [x] Create `src/middleware.ts`. The matcher covers all `(authenticated)` paths and the `(auth)` paths (`/signin`, `/signup`, plus any future forgot-password / SSO callback paths added under `(auth)/`). Behaviour:
  - Request to an `(authenticated)` URL with no `aj_signed_in` cookie → `NextResponse.redirect(new URL('/signin', req.url))`.
  - Request to an `(auth)` URL with `aj_signed_in` set → `NextResponse.redirect(new URL('/agents', req.url))`. (A signed-in user landing on `/signin` directly should bounce to the dashboard, not see a signin form.)
  - Otherwise → `NextResponse.next()`.
- [x] **Matcher pattern.** Next route groups (the parentheses) are not part of the URL, so the matcher needs to enumerate the actual top-level URL prefixes for each side. Spell them out explicitly rather than negating `(public)`, because the `(public)` set is open-ended (docs, blog, etc. will be added later) and accidentally including a public path in the auth gate is the worst kind of silent regression:

  ```ts
  export const config = {
    matcher: [
      // (authenticated) URL prefixes — extend when adding a new top-level dashboard route
      '/agents/:path*', '/tools/:path*', '/sres/:path*', '/contexts/:path*',
      '/documents/:path*', '/stages/:path*', '/integrations/:path*',
      '/agent-builder/:path*', '/tool-builder/:path*', '/sre-builder/:path*',
      '/json-document-builder/:path*', '/chat/:path*',
      '/api-keys/:path*', '/usage/:path*', '/profile/:path*', '/create-team/:path*',
      '/gmail/:path*', '/google-calendar/:path*', '/outlook/:path*',
      // (auth) URL prefixes
      '/signin', '/signup',
    ],
  };
  ```

  `chat-pages` and `chat-page-builder` are deliberately omitted (deprecated, audit item 19). The shared `(public)/chat-page/[id]` embed remains public and is not gated.
- [x] The cookie is set on successful `signIn()` and confirmed `signUp()` (per F.3) and deleted on every `signOut()` / `handleAuthFailure()` path (per F.4 and E.4). Set/delete strings are spelled out above so the executing agent doesn't mismatch attributes.
- [x] Document at the top of `middleware.ts`:

  ```
  // Coarse, advisory gate. The cookie is forgeable; an attacker setting it
  // manually would see a dashboard whose every API call returns 401, and the
  // interceptor would log them right back out. Real auth lives in the backend
  // + the API client interceptor (Project 10, deliverable F.4). Promote to
  // HttpOnly server-validated session cookies via `runWithAmplifyServerContext`
  // if/when the Nice-to-ship server-cookie item is taken.
  ```

  This comment is part of the deliverable; don't ship without it.

#### G. Promote `react-hooks/exhaustive-deps` to error + sweep

`react-hooks/exhaustive-deps` is already on at **warn** today (it ships with `next/core-web-vitals`, which `.eslintrc.json` extends). Today's CI doesn't fail on warnings, so the warnings have piled up unchecked. Deliverable A leaves the rule at warn; this deliverable promotes it to **error** *after* C and E have deleted the largest sources of violations (15 `setShowAlert` effects from C; 3 auth-redirect `reaction(authStore.signedIn, ...)` patterns from E/F.1 — note that `create-team/page.tsx:25` wraps a scroll-animation `reaction(createTeamStore.step, ...)`, not an auth redirect, so it is **not** removed by E/F and G must address it). Starting count before this deliverable: **15 warnings, 0 errors**; after C and E/F land roughly 12 of those are gone, leaving approximately 3 for G to fix.

- [x] Promote `react-hooks/exhaustive-deps` from `warn` to `error` in the ESLint config.
- [x] Run `next lint`. For each error, choose one of:
  - Add the missing dep. Most cases.
  - Promote the value to a `useRef` or `useCallback` if its identity flips every render but its value shouldn't drive re-runs.
  - Switch to `[]` and add a one-line comment explaining why no deps are needed (rare; e.g. a one-shot mount-time fetch).
  - Pull the work out of React entirely — a MobX `autorun` set up at app boot, a `reaction()` inside an `observer`-derived render. (Should be rare.)
- [x] CI fails on any new violation.
- [x] One intentional inline suppression already exists at `StageAssignmentField.tsx:105` (`// eslint-disable-next-line react-hooks/exhaustive-deps`). Verify it carries a brief reason comment explaining why `value` and `onChange` are deliberately omitted (to avoid reacting to every value change). Preserve the suppression; do not delete it.
- [x] The three whole-file `/* eslint-disable */` files (`TokenStreamingService.ts`, `JSONRPCPeer.ts`, `types/context.ts`) silence ESLint entirely — they will not emit errors when `exhaustive-deps` is promoted and are out of scope for this sweep.

#### H. Builder stores: singleton → per-page instance

Builder pages (`AgentBuilder`, `ToolBuilder`, `StructuredResponseEndpointBuilder`, `JsonDocumentBuilder`) are **domain-rich form pages**, not "forms" in the React Hook Form sense. They run code generators, recursive validators, parameter-tree editors, test harnesses, and save orchestrators that touch multiple backend resources at once. The audit's complaint about these stores is **not** that they exist — it's that they're module-level singletons with a lifetime that doesn't match a page mount, which causes:

**Out of scope: `ChatPageBuilderStore`.** The chat-pages surface is being deprecated (audit item 19). Don't decompose it, don't add it to the per-builder PR list, don't write a focused test for it. The singleton stays in place until project 08 deletes the whole feature.

- Edits to agent A leak into agent B when the user navigates between them.
- Two browser tabs editing different resources stomp each other.
- "Reset to saved" is ambiguous because the cached resource and the in-progress edits live in the same fields.
- Pages have to manually call `xxxBuilderStore.reset()` on mount, and forgetting is a silent bug.

The fix is **not** to move form state into RHF. The fix is to keep MobX, keep the rich domain logic, and **change the lifetime** of these stores from "module singleton" to "instance per page mount." Same class, scoped correctly.

##### H.1 Conversion to per-page instance

- [x] For each builder store, **delete the module-level singleton export** (`export const xxxBuilderStore = new XxxBuilderStore()`). The file exports the class only.
- [x] Add the constructor-injection pattern from deliverable E: the constructor takes `{ ...listStores }` (e.g. `ToolBuilderStore` takes `{ tools, parameterDefinitions }`; `AgentBuilderStore` takes `{ agents }` — `toolsStore` and `modelsStore` are only used by the agent-builder *page*, not by the store itself). The store stores them as private fields. After deliverable C, no `showAlert` dep is needed; errors surface via observable fields per the C.1 pattern.
- [x] **Builder stores are not registered on `RootStore`.** They are not constructed at boot, not iterated by `resetAll()`, not part of `bootLoad()`. The root only knows about list/cache stores and the auth-flow / persistent stores from E.
- [x] Each builder page owns the lifecycle of its store instance. **Use `useState(() => new XxxBuilderStore({...}))[0]`** (preferred for class-based stores that already call `makeAutoObservable(this)` in their constructor). `useMemo(() => new XxxBuilderStore({...}), [])` is equivalent and acceptable. **Do not** use `useLocalObservable` from `mobx-react-lite` — it's intended for plain-object factories and re-wraps an already-observed class instance, which can shadow class methods through MobX's proxy. Class-based stores already manage their own observability via `makeAutoObservable`.
- [x] Each builder gets a small companion hook colocated with the store: `useToolBuilder()`, `useAgentBuilder()`, etc. The hook reads `useStores()` for dependencies, constructs the per-page instance, and returns it. Pages call the hook; they don't construct the store directly.

  ```ts
  // src/store/builders/ToolBuilder/useToolBuilder.ts (or alongside the class file)
  export function useToolBuilder() {
    const { tools, parameterDefinitions } = useStores();
    return useState(() => new ToolBuilderStore({ tools, parameterDefinitions }))[0];
  }
  ```

##### H.2 What pages do

- [x] In each builder page, replace `import { xxxBuilderStore } from '@/store/...'` with `const builder = useXxxBuilder();`.
- [x] On mount, the page calls `builder.setToolWithId(toolId)` / `builder.initiateNew()` (or whichever existing hydration entry point the store has) inside an effect keyed on the URL param. No explicit `builder.reset()` call is needed when the page unmounts — the instance is discarded with the component.
- [x] If the builder needs cleanup beyond instance discard (e.g. an in-flight WebSocket; a `reaction()` disposer it set up — though stores aren't supposed to set up reactions in their constructor anyway), add an optional `dispose()` method to the class and call it from a `useEffect` cleanup in the hook.

##### H.3 Testing

- [x] Write one focused test per builder that exercises the cascading-mutation behaviour the domain logic depends on. Examples for `ToolBuilderStore`: "adding a parameter regenerates the function declaration"; "switching to client-side tool clears `code` and disables `pass_context`"; "validation rejects an enum with no options". These tests are the proof that the domain logic survived the refactor without any behavioural change.

**Do NOT change any domain logic.** Do not delete fields, do not rename methods, do not remove list-cache duplication, do not slim the store. The only changes are: (1) remove the singleton export, (2) add constructor injection for the deps the store actually uses from the persistent root stores, (3) create the `useXxxBuilder()` hook. Everything else in the store file stays exactly as written.

##### H.4 Order of work

- [x] Do this **before** converting the page to shadcn in project 08, not at the same time. One refactor at a time. The shape of the store is now stable; project 08 only swaps the view layer on top of it.
- [x] Convert one builder at a time, committing to the branch after each, before moving to the next. The conversion is mechanical; test each before committing.

#### I. Navigation, prefetch, and segment files

This deliverable is what realizes the "browser app" model from the Architecture section. The dashboard's primary loading strategy is **boot splash + prefetch + in-page skeletons** — `loading.tsx` is a fallback, not the headline mechanism.

##### I.1 `<Link>` sweep

- [ ] Replace every `router.push(staticPath)` with `<Link href={staticPath}>`. Reserve `router.push` for navigations triggered by post-action redirects (e.g. "after `createAgent()`, route to its detail page"). **Sidebar note:** `Sidebar.tsx` already wraps each main-nav tab in a Chakra UI `<Link>` (imported from `@chakra-ui/react`, **not** `'next/link'`) that fires `router.push` in its `onClick` — there is no `href` prop. This is the wrong component: it generates no `<a>` tag, provides no prefetch, and breaks middle-click / Cmd+click. The `<Link>` sweep must replace those Chakra `<Link>` elements with Next.js `<Link>` components (import from `'next/link'`).
- [ ] Replace the manual `router.prefetch` calls (`agents/page.tsx:337`, `tools/page.tsx:285`, `sres/page.tsx:347`, `documents/page.tsx:273`, `contexts/page.tsx:82`, plus any others surfaced by the sweep) with `<Link prefetch>` (the default). The boot-time prefetch in I.2 covers the top-level routes; per-link prefetch covers the rest. **Exception — `contexts/page.tsx:82`:** that effect prefetches `/contexts`, which is the page it already lives on — a no-op. Delete the call outright rather than replacing it with a `<Link>`.
- [ ] **Do not** add `<Link>`s to `/chat-pages`, `/chat-page-builder`, or `(public)/chat-page/[id]` from any new code. The Sidebar entry for "Chat Pages" stays as the existing `router.push` until project 08 deletes the page; touching it here would imply we're keeping it.
- [ ] **Do not** convert the `router.push` calls in `gmail/authcode/page.tsx`, `google-calendar/authcode/page.tsx`, or `outlook/callback/page.tsx`. These are OAuth callback landing pages that users reach via external redirect from a third-party OAuth provider, never via in-app navigation. Their auto-redirect logic lives inside `useEffect` callbacks; they also each have a `handleGoBack` event handler that pushes to `/integrations`. Neither call is a candidate for `<Link>`.

##### I.2 Boot splash & dashboard prefetch

- [x] **Boot splash.** Lives inside `<DashboardBoot>` (created in deliverable F.1). One branded splash for the whole dashboard, not per-page spinners. Renders while `auth.isDeterminingAuth` is `true`.
- [x] **Prefetch the dashboard at boot.** Inside `<DashboardBoot>`, in a single effect that runs after auth resolves to signed-in, fire `router.prefetch(...)` for every `DASHBOARD_ROUTES` entry. The same effect calls `root.bootLoad()` (deliverable E.5). One effect, both jobs.
- [x] **`DASHBOARD_ROUTES` is the source of truth.** Exported from `DashboardBoot.tsx`:

  ```ts
  // Top-level authenticated routes whose chunks are prefetched at boot so
  // navigation between dashboard pages is instant. Adding a route is one line
  // here plus a `loading.tsx` / `error.tsx` for the new segment (per I.3).
  export const DASHBOARD_ROUTES = [
    // High-traffic list pages
    '/agents',
    '/tools',
    '/sres',
    '/contexts',
    '/documents',
    '/stages',
    '/integrations',
    '/chat',
    // Builder entry points (URL params not prefetched separately;
    // their child chunks ride the parent's bundle)
    '/agent-builder',
    '/tool-builder',
    '/sre-builder',
    '/json-document-builder',
    // Lower-traffic but small bundles — included so the dashboard feels
    // uniformly snappy. Pages stay on Project 08's "Defer" list for the
    // shadcn rewrite, but there's no reason their chunks shouldn't be in
    // memory after boot.
    '/api-keys',
    '/usage',
    '/profile',
  ];
  ```

  **Explicitly excluded** from `DASHBOARD_ROUTES`:
  - `/chat-pages` and `/chat-page-builder` — the embedded-chat-page surface is being deprecated (audit item 19). Don't prefetch chunks the user is leaving.
  - `/create-team` — one-shot onboarding flow, prefetching wastes bandwidth on a page most authenticated users will never visit again.
  - `/gmail/authcode`, `/google-calendar/authcode`, `/outlook/callback` — OAuth callbacks; the user lands on them via redirect from a third party, never via in-app navigation.
  - All dynamic-segment children (`/agents/[id]`, `/tool-builder/[[...tool_id]]`, etc.) — the parent's chunk includes the child's loader; per-id prefetching belongs on the list page's `<Link>`s, which Next does for free with the default `prefetch={true}`.

  Adding a new authenticated route is a **one-line addition to `DASHBOARD_ROUTES`** plus `loading.tsx` / `error.tsx` for the new segment.

##### I.3 Segment files

- [ ] Add `loading.tsx` to each top-level segment under `(authenticated)/` as a **cold-cache fallback** consistent with the in-page skeleton style. **Do not** treat it as the user's primary "something is happening" feedback for normal navigation — that's the boot splash (entering the app) and in-page skeletons (data load).
- [ ] Add `error.tsx` to each segment with a "something went wrong" + retry button.
- [ ] Add `not-found.tsx` for dynamic segments that 404 (e.g. `/agents/[id]`, `/contexts/[context_id]`).

##### I.4 SEO surface

- [ ] Add `app/sitemap.ts` and `app/robots.ts`. Static for now; the docs/landing rewrite (project 09) populates them with real entries.

#### J. Webpack fallback cleanup

- [ ] Investigate the `child_process: false` webpack fallback in `next.config.ts`. Research confirms no file in `src/` directly imports `child_process` — the reference is transitive through `aws-amplify` (`^6.10.2`, v6). The fallback is a global webpack config entry; it applies to all client bundles, not just `(public)/`. Because Amplify remains in `(authenticated)/` and `(auth)/` bundles after the layout split, the fallback is expected to **remain** — the layout split alone does not remove the need for it.
- [ ] The actual question to answer: does aws-amplify v6's modular entry point (`aws-amplify/auth`, which is what all 8 auth API files already use) avoid the `child_process` transitive dependency that the root `aws-amplify` entry pulls in? If running a bundle analysis shows `child_process` is no longer surfaced when only `aws-amplify/auth` is used (i.e. after the `Amplify.configure()` call is moved to `lib/amplify.ts` and the root `aws-amplify` import is scoped appropriately), delete the fallback. If it persists, leave the fallback and add a comment naming the package chain (`aws-amplify` → `<X>` → `child_process`) and reference the governance doc.

### Nice-to-ship (after must-ship, can land alongside project 08)

- [ ] **Server-side Cognito session cookies.** Use `runWithAmplifyServerContext` to set an HttpOnly cookie after login; `middleware.ts` reads it for true server-side gating. Eliminates the bundle-shipping-to-anons problem entirely. Would also add a `requestServer<T>` parallel to deliverable D's client-side `request<T>`.
- [ ] **`@ajentify/api-client` extraction.** Move the API surface to a typed package the dashboard, the landing demo (project 09), and `@ajentify/chat` (project 04) all depend on. Defer until the surface stabilizes.
- [ ] **A `<PageShell>` layout primitive** that wraps every authenticated page with consistent header / breadcrumbs / chat-panel slot. Coordinate with project 08.
- [ ] **A typed `useResourceList()` hook** that wraps the MobX list-cache pattern (load, force-reload, loading, error). Eliminates per-page boilerplate. Possibly graduates to React Query later.
- [ ] **An `AGENTS.md` in `ajentify-app/`** that points at `mission-control/frontend-governance.md` so coding agents working in the repo see it without needing the wider context.

## Out of scope (explicitly)

- **No Vite migration.** Stay on Next.js + App Router.
- **No state-library swap.** MobX stays. We are tightening how we use it, not replacing it.
- **No shadcn migration.** That's project 08. This project finishes with Chakra still in place. The point is that when project 08 *does* swap the view layer, it doesn't also have to fix architecture.
- **No new features.** Anything user-visible belongs in another project file.
- **No restyling.** The dashboard looks identical when this project ships. The only visible differences users could notice: faster initial load on landing/signin (because they no longer ship the dashboard bundle), no auth-flash on protected routes, pages that fail gracefully when something throws, and an inline error block where there used to be a modal alert.
- **No migration of low-priority pages' stores.** API Keys, Usage, Profile, Billing, Integrations stay as-is per project 08's "Defer" column. The root store accommodates them; the builder-decomposition rule does not apply to them yet. Their *chunks* still get prefetched (they're listed in `DASHBOARD_ROUTES`); their *page logic* stays Chakra until project 08.
- **No work on the embedded chat-page surface.** `/chat-pages`, `/chat-page-builder`, `(public)/chat-page/[id]`, `ChatPagesStore`, `ChatPageBuilderStore`, and `src/api/chatpage/*.ts` are being deprecated. They are skipped by every sweep in this project (alerts, API client, root store, builder decomposition, prefetch, `<Link>`). The deprecation itself happens in project 08; until then, those files keep working in their current shape.
- **Docs personalization.** Signed-in users seeing their real API keys / agent IDs / tool names auto-filled into docs code snippets is project 01's call to design and ship. Project 10's contribution is keeping the public and authenticated provider stacks separable so a tiny client island on docs pages can later reach a lightweight session/user-resources surface without dragging the dashboard into the public bundle. **Don't build the personalization here.**
- **Per-store code-splitting inside the dashboard.** All store JS shipping together with the authenticated layout is the intentional shape (see Architecture model). Splitting individual stores into separate chunks via `next/dynamic` is a future optimization, not a goal of this project.
- **A new toast / alert library.** Chakra's `useToast` is the toast surface for this project. Project 08 will swap it for shadcn's `<Sonner>`/`<Toaster>` as part of the page-by-page rewrite. Don't introduce a third option here.
- **Sharing one `AuthStore` instance across the auth-flow and dashboard bundles.** It would defeat the layout split — the auth-flow bundle would have to import the dashboard's provider and `RootStore` to reach the shared instance. Two instances coexisting and sharing state via Amplify + the cookie is the right shape (see Architecture model and E.2.1).

## Success criteria

- [ ] `app/layout.tsx` is a server component and exports `metadata`. Verified by checking the route's HTML response includes `<title>` server-rendered.
- [ ] Visiting `/agents` while logged out never executes any authenticated-page React. Verified by log/breakpoint at the top of an authenticated page component.
- [ ] No `useEffect` in `src/` triggers `react-hooks/exhaustive-deps`. CI fails if one is added.
- [ ] `lint:arch` passes: no `'use client'` in any layout, no module-level store singletons (excepting the documented chat-page deprecation carve-out in `lint:arch`), no token-shaped console logs. CI gate.
- [ ] Every dashboard `src/store/*.ts` is constructed *only* through `RootStore` (or, for `AuthStore` and `SignUpStore`, through `RootStore` and `AuthFlowStore` respectively). No `export const xxxStore = new XxxStore()` survives outside the chat-page carve-out.
- [ ] `AlertProvider` and `Alert.tsx` are deleted; no `setShowAlert` calls remain in the codebase.
- [ ] `AuthStore.signOut()` no longer names individual stores. The reset is generic.
- [ ] `refreshDashboardCaches.ts` is deleted; the equivalent lives on `RootStore` as a method.
- [x] **`ParameterDefinitionsStore` exists** on the root, is hydrated by `bootLoad()`, and the `Tool` and `SRE` builders read parameter definitions through it (no direct `getParameterDefinition(pdId)` call from a builder store).
- [ ] **`AuthStore.submitSignIn` does not flip `signedIn = true` directly.** `signedIn` is set only inside `checkAuth` after `/user` returns 200. Verified by greppping `submitSignIn` and reading the body.
- [x] Each builder store (`Tool`, `Agent`, `SRE`, `JsonDocument`) is instantiated per-page via its `useXxxBuilder()` hook — no module-level singleton export remains. `ChatPageBuilderStore` is exempt — deprecated and untouched. Domain logic in each store is unchanged; only the singleton export and constructor injection are modified.
- [ ] Every dashboard API call goes through `src/api/client.ts`. CI grep: `! grep -rE "fetch\\(\`\\$\\{process\\.env\\.NEXT_PUBLIC_API_BASE_URL" src/api/` (catches the old pattern) outside of `src/api/auth/` (Amplify, not backend) and `src/api/chatpage/` (deprecated carve-out).
- [ ] At least one 401 from any API call cleanly logs the user out and redirects, in dev. Verified by manually invalidating a token mid-session.
- [ ] **`(public)/` chunks** (verified via `next build` output or a bundle analyzer) do not include `mobx`, `aws-amplify`, `AuthStore`, `SignUpStore`, or any `@chakra-ui/*` chunk that wasn't directly imported by the route. (Landing imports Chakra directly today; that's fine until project 09.)
- [ ] **`(auth)/` chunks** include `aws-amplify`, `mobx`, `AuthStore`, `SignUpStore`, and Chakra, and **exclude** every other store under `@/store/` and any `(authenticated)/` page chunk.
- [ ] Lighthouse SEO ≥ 90 on `/landing` (no auth-bundle drag, metadata present).
- [ ] **Boot splash + prefetch works end to end.** On first authenticated load, after the splash dismisses, navigating between top-level authenticated routes in `DASHBOARD_ROUTES` makes no chunk-fetch network requests (chunks already prefetched). Verified manually in DevTools' Network panel with caching disabled at boot only.
- [ ] **First-paint sign-in works without a 401-logout flap.** Cold-load `/agents` while signed in: the boot splash shows, `checkAuth` issues exactly one `/user` request that succeeds, and no API call goes out without an `Authorization` header. Verified manually in DevTools' Network panel. (Catches the `<ApiClientBinder>` ordering bug from D.3.)
- [ ] An ESLint + TypeScript run is clean. CI gate.
- [ ] `frontend-governance.md` exists, reflects the patterns this project shipped, is referenced from this project file and from any future PR template, and is short enough to actually be read (target: under ~400 lines).

## Risks

- **Refactor-into-rewrite.** This project is a pile of small refactors and one big one (the root store sweep). If any single deliverable starts touching pages' visible behaviour, stop. That's project 08's lane.
- **Root-store sweep regresses stores.** The mechanical part (replace import → `useStores()`) is safe. The explicit-dependency-injection part is the riskier work — a wrong dependency order or a forgotten dep means a store reads `undefined` at boot and the dashboard never starts. Mitigation: the boot tests (deliverable E.7 — `RootStore.test.ts` and `AuthFlowStore.test.ts`) catch the obvious cases; the executing agent walks the construction graph one pass before merging.
- **The two `AuthStore` instances drift.** `AuthFlowStore.auth` and `RootStore.auth` are separate; if a future change adds a field that one side reads and the other writes (e.g. caching `currentUser` on the auth-flow side and expecting the dashboard to see it), the bundles silently disagree. Mitigation: `AuthStore`'s only cross-bundle state is the Amplify session and the cookie; everything else is local to the instance. A test in `AuthFlowStore.test.ts` asserting the auth-flow `auth` doesn't expose `loadUser` / dashboard-only methods would lock this in (nice-to-have).
- **`<ApiClientBinder>` ordering.** If anyone "fixes" the binder by moving its `bindApiClientAuth` call into a `useEffect`, the first `getUser()` from `<DashboardBoot>` can fire before bindings are attached, hit 401 with no auth header, and leave the user signed out forever on first paint. Mitigation: D.3 spells out the render-time pattern; the success criterion explicitly checks first-paint behaviour; a comment at the top of `ApiClientBinder.tsx` warns against the change.
- **AlertProvider removal regresses error UX.** Mitigation: every store-level error becomes a visible inline error via the `xxxError` observable field; the sweep is mechanical and per-page (one page, one error region). If a page uses `useAlert` for something that doesn't fit either "error" or "transient toast" (rare, e.g. a flow-blocking confirm), use the existing Chakra `<AlertDialog>` per-page pattern — it's already the right shape.
- **API client sweep breaks an endpoint silently.** The sweep is 60 files; a typo in `path` or `query` shape and a request goes wrong. Mitigation: `request<T>` returns typed bodies, so callers fail fast at compile time when the response shape changes; the focused vitest in D.4 covers URL/header/error-shape correctness; smoke-test the dashboard against a real backend before merging the sweep PR.
- **Auth interceptor 401 storm.** N parallel requests fire while the token is expired; all fail 401; interceptor logs out N times. Mitigation is in deliverable F.4: refresh-then-retry-once before treating as logout, and a `loggingOut` sentinel on `AuthStore` so concurrent failures coalesce into one sign-out. Verify by manually invalidating a token mid-page-load.
- **Auth interceptor double-logs-out via `signOut()` itself making an authenticated call.** Today's `signOut()` only calls Amplify (no backend), so there's no loop. Don't add a backend `/logout` call inside `signOut()` without also adding an "in `handleAuthFailure` path" guard.
- **`<DashboardBoot>` flickers worse than the old setup if `checkAuth` is slow.** The whole point of F.1 is that there is one branded splash for the entire boot. If determination is unusually slow, the splash sits there longer rather than flashing partial UI. Acceptable. Mitigation is to make `checkAuth` fast (token fetch + one `/user` call), not to bypass the splash.
- **`redirect()` called repeatedly during MobX-driven re-renders.** `<DashboardBoot>` is an `observer`. Calling `redirect()` twice should be harmless (Next dedupes), but the executing agent should still ensure the determination path is idempotent: while `isDeterminingAuth` is true, return the splash; only check `!signedIn` after determination completes.
- **MDX / docs decisions creep in.** Project 01 owns docs. Don't decide MDX vs `fumadocs` here.
- **Bundle-analyzer surprises.** AWS SDK pulls Node modules into the client. The `child_process: false` workaround exists for a reason. If we can't remove it, document it in the governance doc and in `next.config.ts`.
- **The "fix everything before page rewrites" gate is itself a risk.** If this project balloons to 5+ CWP, project 08 is delayed by however long. Hard rule: if this is still going past 4 CWP, ship what's done and defer the rest as a follow-up project. Don't let the prerequisite eat the headline.
- **Chat-pages deprecation collision.** Project 08 will delete `chat-pages` / `chat-page-builder` / `(public)/chat-page/[id]` / their stores / their API files. If project 08 starts before this project's chat-pages carve-outs (in C.2, D.4, E.3, H, I.1, I.2) are merged, project 08 has to either wait for them or temporarily re-add them. Mitigation: keep the carve-outs in one obvious shape ("audit item 19" cited everywhere) so project 08 can grep them out in one pass when the deletion lands.

## Code paths

**Layout split (deliverable B):**

- Modified: `ajentify-app/src/app/layout.tsx` (becomes a server component, exports `metadata`)
- New: `ajentify-app/src/app/(authenticated)/providers.tsx` (full dashboard provider stack; only file that imports `RootStore`; hosts `<ApiClientBinder>`)
- New: `ajentify-app/src/app/(auth)/providers.tsx` (auth-flow stack; mounts `<AuthFlowStoreProvider>` and `<AmplifyConfig />`; does not import `RootStore`)
- New: `ajentify-app/src/app/(public)/providers.tsx` (minimal — theming primitives only; no `RootStore`, no `AuthFlowStore`, no MobX, no Amplify)
- Modified: `ajentify-app/src/app/(authenticated)/layout.tsx` (mounts the authenticated providers, wraps body in `<DashboardBoot>`)
- New: `ajentify-app/src/app/(auth)/layout.tsx` (mounts the auth-flow providers; renders the centered card-style chrome)
- New: `ajentify-app/src/app/(public)/layout.tsx`
- Moved: `ajentify-app/src/app/(public)/signin/` → `ajentify-app/src/app/(auth)/signin/`
- Moved: `ajentify-app/src/app/(public)/signup/` → `ajentify-app/src/app/(auth)/signup/`
- New: `ajentify-app/src/lib/amplify.ts` and a tiny `ajentify-app/src/app/components/AmplifyConfig.tsx` rendered once inside both `(authenticated)/providers.tsx` and `(auth)/providers.tsx`

**Alerts → errors + toasts (deliverable C):**

- Deleted: `ajentify-app/src/app/components/AlertProvider.tsx`, `ajentify-app/src/app/components/Alert.tsx`
- New: `ajentify-app/src/app/components/feedback/InlineError.tsx`

**API client (deliverable D):**

- New: `ajentify-app/src/api/client.ts` (chokepoint, interceptor home, `bindApiClientAuth`)
- New: `ajentify-app/src/api/client.test.ts`
- New: `ajentify-app/src/app/(authenticated)/ApiClientBinder.tsx` (render-time bind; reads from `useStores()` after E)
- Modified: every `ajentify-app/src/api/**/*.ts` (route through `request<T>`) **except** `src/api/auth/*` (Amplify), `src/api/user/updateUser.ts` (Amplify — `updateUserAttributes`), `src/api/tokenstreamingservice/TokenStreamingService.ts` (WebSocket, no fetch), and `src/api/chatpage/*` (deprecated carve-out)
- Untouched (carved out, deleted by project 08): `src/utils/api/checkResponseAndParseJson.ts` (still referenced by the carved-out `chatpage/*`)

**Auth gating (deliverable F):**

- New: `ajentify-app/src/app/components/auth/DashboardBoot.tsx` (boot splash + auth determination + post-auth prefetch + redirect)
- New: `ajentify-app/src/app/components/auth/BootSplash.tsx` (the branded loading animation)
- New: `ajentify-app/src/middleware.ts` (Flavour A coarse signed-in cookie gate; documented as advisory only; matcher enumerates `(authenticated)` and `(auth)` URL prefixes explicitly — no `(public)` paths gated)

**Stores (deliverable E + H):**

- New: `ajentify-app/src/store/RootStore.ts` (constructs the dashboard's stores in explicit dependency order, owns `resetAll()` / `bootLoad()` / `refreshDashboardCaches()`)
- New: `ajentify-app/src/store/StoreContext.tsx` (context + single `useStores()` hook for the dashboard)
- New: `ajentify-app/src/store/AuthFlowStore.ts` (auth-flow root, owns `auth` + `signUp` instances)
- New: `ajentify-app/src/store/AuthFlowStoreContext.tsx` (context + `useAuthFlowStores()` hook for the `(auth)/` route group)
- New: `ajentify-app/src/store/ParameterDefinitionsStore.ts` (list-cache + `getByPdId` lookup + `ensurePdId` cache-or-fetch; consumed by `Tool` and `SRE` builders)
- New: `ajentify-app/src/store/RootStore.test.ts`, `ajentify-app/src/store/AuthFlowStore.test.ts`
- Modified: every `ajentify-app/src/store/*.ts` (drops `setShowAlert` / `showAlert`, gains `xxxError` observable, gains constructor-injected deps where audited; module-level singleton export deleted) **except**:
  - `ChatPagesStore` and `ChatPageBuilderStore` (deprecated carve-outs; singletons survive until project 08 deletes the feature)
  - `ModelsStore` and `SignUpStore` follow the C.1 error pattern with adapted shape (see C.2)
- Deleted: `ajentify-app/src/store/refreshDashboardCaches.ts`
- New: per-builder `useXxxBuilder.ts` hooks for Tool / Agent / SRE / JsonDocument; per-builder focused tests

**Pages (deliverables F + I):**

- New: `ajentify-app/src/app/sitemap.ts`, `ajentify-app/src/app/robots.ts`
- New: per-segment `loading.tsx`, `error.tsx`, and (where dynamic) `not-found.tsx` files under `(authenticated)/`
- Modified: `ajentify-app/src/app/(authenticated)/agents/page.tsx`, `…/create-team/page.tsx`, `(auth)/signin/page.tsx` (post-move), `app/page.tsx`, every page that called `setShowAlert` (remove redirect machinery, remove `useAlert`, use `<Link>`, use `useStores()` / `useAuthFlowStores()`)

**Tooling:**

- Modified: ESLint config, `package.json` (test, lint:arch scripts)
- Modified: `ajentify-app/next.config.ts` (eventually drop the webpack fallback per J)
- Modified: `mission-control/frontend-governance.md` — updated to reflect the three-app architecture, `(auth)/` provider boundary, two-`AuthStore`-instances reality, `ParameterDefinitionsStore`, `<ApiClientBinder>`, and the `AlertProvider` removal

## Why this is a project, not a backlog cleanup task

These items individually look like cleanup. The reason they are a project:

1. **They share a unifying claim:** the foundation is wrong in a way that compounds with every page added. Every entry in the audit, if not fixed first, becomes a per-page mistake to redo later.
2. **They gate the headline project.** Project 08 (the AI-first frontend kit) is the launch shipping motion. Doing it on top of an unfixed foundation would mean either (a) replicating the same mistakes in shadcn, or (b) doing this work *during* the page rebuild, which conflates two refactors and produces unreviewable diffs.
3. **They're the input to the governance doc.** `frontend-governance.md` is the artifact the coding agent reads before working on the dashboard. That doc is meaningless if the patterns it describes don't exist yet. This project makes the patterns real, the doc names them.

When this project lands, project 08 inherits a frontend where every shadcn page can be written by a coding agent following one short doc, and every PR can be self-reviewed against the same doc. That's the only thing that lets project 08 actually ship in 6 weeks.
