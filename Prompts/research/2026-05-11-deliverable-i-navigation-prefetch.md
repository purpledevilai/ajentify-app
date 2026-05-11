---
date: 2026-05-11
topic: "Deliverable I: Navigation, Prefetch, Segment Files — current state audit"
repos_touched: [ajentify-app]
tags: [research, navigation, link, prefetch, loading, error, segment-files]
status: complete
last_updated: 2026-05-11
---

# Deliverable I: Navigation, Prefetch, and Segment Files — Current State Audit

## 1. `router.push` Usage in Authenticated Pages

All authenticated pages use `useRouter` from `'next/navigation'`. No programmatic navigation uses Next.js `<Link>`. Below is every occurrence, with context on whether it sits inside an event handler or a `useEffect`.

### `src/app/(authenticated)/layout.tsx`
| Line | Target | Context |
|------|--------|---------|
| 19 | `/signin` | Inside `routeBasedOnAuth()`, which is called both directly inside a `useEffect` (no dep array — runs every render) and inside a MobX `reaction` callback also registered in that same effect. This is the auth-guard redirect. |

### `src/app/(authenticated)/components/Header.tsx`
| Line | Target | Context |
|------|--------|---------|
| 50 | `/chat` | `onClick` handler on a Chakra `<Button>`. |

### `src/app/(authenticated)/components/Sidebar.tsx`
| Line | Target | Context |
|------|--------|---------|
| 114 | `tab.route` (dynamic — one of `/agents`, `/tools`, `/contexts`, `/sres`, `/documents`, `/stages`, `/integrations`) | `onClick` handler on a Chakra `<Link>` element. |
| 173 | `/profile` | `onClick` on Chakra `<MenuItem>`. |
| 174 | `/usage` | `onClick` on Chakra `<MenuItem>`. |
| 175 | `/api-keys` | `onClick` on Chakra `<MenuItem>`. |

### `src/app/(authenticated)/agents/page.tsx`
| Line | Target | Context |
|------|--------|---------|
| 359 | `/agent-builder` | `handleAddAgentClick` event handler function. |
| 364 | `/agent-builder/${agent.agent_id}` | `handleEditAgentClick` event handler function. |

### `src/app/(authenticated)/tools/page.tsx`
| Line | Target | Context |
|------|--------|---------|
| 309 | `/tool-builder` | `handleAddToolClick` event handler function. |
| 314 | `/tool-builder/${tool.tool_id}` | `handleEditToolClick` event handler function. |

### `src/app/(authenticated)/sres/page.tsx`
| Line | Target | Context |
|------|--------|---------|
| 368 | `/sre-builder` | `handleAddSREClick` event handler function. |
| 373 | `/sre-builder/${sre.sre_id}` | `handleEditSREClick` event handler function. |

### `src/app/(authenticated)/documents/page.tsx`
| Line | Target | Context |
|------|--------|---------|
| 294 | `/json-document-builder` | `handleAddDocumentClick` event handler function. |
| 299 | `/json-document-builder/${doc.document_id}` | `handleEditDocumentClick` event handler function. |

### `src/app/(authenticated)/contexts/page.tsx`
| Line | Target | Context |
|------|--------|---------|
| 113 | `/contexts/${context_id}` | Row click handler (event handler). |

### `src/app/(authenticated)/contexts/[context_id]/page.tsx`
| Line | Target | Context |
|------|--------|---------|
| 242 | `/contexts` | `onClick` on a back-navigation `<Button>`. |
| 284 | `/agent-builder/${context.agent_id}` | `onClick` on a `<Button>` in the detail view. |

### `src/app/(authenticated)/stages/page.tsx`
| Line | Target | Context |
|------|--------|---------|
| 167 | `/stages/${stage.stage_id}` | Row click event handler. |
| 275 | `/stages/${stage.stage_id}` | Inline arrow function passed as `onCreated` prop to a modal component. |

### `src/app/(authenticated)/stages/[stage_id]/page.tsx`
| Line | Target | Context |
|------|--------|---------|
| 300 | `/stages` | Inside async delete/destroy handler, after the operation completes. |
| 307 | `/stages` | `onClick` on an `<ArrowBackIcon>` back `<Button>` in the error state render. |
| 325 | `/stages` | `onClick` on another back `<Button>` (early-return render path). |
| 420 | `/agent-builder/${a.agent_id}` | Table row action `onClick` callback. |
| 439 | `/tool-builder/${t.tool_id}` | Table row action `onClick` callback. |
| 458 | `/sre-builder/${s.sre_id}` | Table row action `onClick` callback. |
| 477 | `/json-document-builder/${d.document_id}` | Table row action `onClick` callback. |
| 544 | `/stages/${newStageId}` | Inside async create-stage handler, after receiving the new stage ID. |

### `src/app/(authenticated)/chat-pages/page.tsx`
| Line | Target | Context |
|------|--------|---------|
| 38 | `/chat-page-builder` | Event handler function. |
| 43 | `/chat-page-builder/${chatPage.chat_page_id}` | Event handler function. |

### `src/app/(authenticated)/json-document-builder/[[...document_id]]/page.tsx`
| Line | Target | Context |
|------|--------|---------|
| 59 | `/documents` | Inside async handler (likely cancel/discard), called after store cleanup. |

### `src/app/(authenticated)/components/StageCells.tsx`
| Line | Target | Context |
|------|--------|---------|
| 52 | `/stages/${stageId}` | Click handler on a table cell component. |

### `src/app/(authenticated)/outlook/callback/page.tsx`
| Line | Target | Context |
|------|--------|---------|
| 57 | `/integrations` | Inside `setTimeout` callback (2 000 ms delay) within `exchangeCode` async function, which is called from a `useEffect`. |
| 66 | `/integrations` | `handleGoBack` event handler. |

### `src/app/(authenticated)/gmail/authcode/page.tsx`
| Line | Target | Context |
|------|--------|---------|
| 57 | `/integrations` | Inside `setTimeout` callback within async OAuth exchange function called from `useEffect`. |
| 66 | `/integrations` | `handleGoBack` event handler. |

### `src/app/(authenticated)/google-calendar/authcode/page.tsx`
| Line | Target | Context |
|------|--------|---------|
| 57 | `/integrations` | Inside `setTimeout` callback within async OAuth exchange function called from `useEffect`. |
| 66 | `/integrations` | `handleGoBack` event handler. |

---

## 2. Next.js `<Link>` Component Usage

**Files that import `Link` from `'next/link'`:**

| File | Route Group |
|------|-------------|
| `src/app/(public)/landing/components/Header.tsx` | `(public)` |
| `src/app/(public)/landing/components/Footer.tsx` | `(public)` |
| `src/app/(public)/landing/components/HeroSection.tsx` | `(public)` |

**None are in `(authenticated)/`.**

The `<Link` search across `src/app/` also matched:
- `src/app/(authenticated)/components/Sidebar.tsx:111` — this is Chakra UI's `<Link>` (imported from `@chakra-ui/react` at line 8), **not** Next.js `<Link>`. It wraps tab items and fires `router.push` in its `onClick`.
- `src/app/(authenticated)/components/StageBindingActionCell.tsx:78` — this is `<LinkIcon>` from `@chakra-ui/icons` (an icon component), not a navigation `<Link>` at all.

**Summary:** Next.js `<Link>` is used exclusively in the public landing section. The authenticated section has zero Next.js `<Link>` usage.

---

## 3. `router.prefetch` Calls

Five occurrences exist, all inside `useEffect` hooks:

| File | Line | Prefetched Path | `useEffect` dependency array |
|------|------|-----------------|------------------------------|
| `src/app/(authenticated)/agents/page.tsx` | 337 | `/agent-builder` | **none** (runs on every render) |
| `src/app/(authenticated)/tools/page.tsx` | 285 | `/tool-builder` | `[]` (mount-only) |
| `src/app/(authenticated)/sres/page.tsx` | 347 | `/sre-builder` | **none** (runs on every render) |
| `src/app/(authenticated)/documents/page.tsx` | 273 | `/json-document-builder` | `[]` (mount-only) |
| `src/app/(authenticated)/contexts/page.tsx` | 82 | `/contexts` | `[router]` (prefetching the current page) |

All five prefetch calls co-exist with store-loading calls in the same effect. There is no separate, dedicated prefetch-only effect.

---

## 4. Sidebar Navigation (`Sidebar.tsx`)

**Full path:** `src/app/(authenticated)/components/Sidebar.tsx`

**Navigation rendering:**

- **Main tab list (lines 110–132):** Seven tabs — Agents, Agent Tools, Contexts, Structured Responses, Documents, Stages, Integrations — are each rendered as a **Chakra UI `<Link>`** element (from `@chakra-ui/react`). There is no `href` prop; navigation happens via `onClick={() => { router.push(tab.route); if (onClose) onClose(); }}`.
- **User menu (lines 172–175):** Profile, Usage, and API Keys are rendered as Chakra `<MenuItem>` elements, each with `onClick={() => router.push('/<route>')}`.
- **Logout (line 177):** Chakra `<MenuItem>` calling `authStore.signOut()` — no router call.
- **No native `<a>` tags.** No Next.js `<Link>` components. All navigation is imperative `router.push`.

The active tab is determined by comparing `pathname === tab.route` (via `usePathname`), toggling background color accordingly.

---

## 5. Header Navigation (`Header.tsx`)

**Full path:** `src/app/(authenticated)/components/Header.tsx`

**Navigation rendering:**

- **Chat button (line 48–57):** Chakra `<Button>` with `onClick={() => router.push('/chat')}`. Active state (`variant="solid"`) when `pathname === '/chat'`.
- **Docs link (lines 59–69):** `<Button as="a" href="https://api.ajentify.com/docs" target="_blank" rel="noopener noreferrer">` — rendered as a native `<a>` element pointing to an external URL. This is the only `<a>` tag in the authenticated navigation layer.
- **Hamburger icon (lines 30–39):** `<IconButton onClick={onMenuClick}>` — toggles sidebar, no navigation.
- **Color mode toggle (lines 72–78):** `<IconButton onClick={toggleColorMode}>` — no navigation.
- **No Next.js `<Link>` components.**

---

## 6. `loading.tsx` Files in `(authenticated)/`

**None found.** Zero `loading.tsx` files exist anywhere under `src/app/(authenticated)/`.

---

## 7. `error.tsx` Files in `(authenticated)/`

**None found.** Zero `error.tsx` files exist anywhere under `src/app/(authenticated)/`.

---

## 8. `not-found.tsx` Files in `src/app/`

**None found.** Zero `not-found.tsx` files exist anywhere under `src/app/`.

---

## 9. `sitemap.ts` and `robots.ts`

Neither file exists:
- `/workspace/src/app/sitemap.ts` — **does not exist**
- `/workspace/src/app/robots.ts` — **does not exist**

---

## 10. `DASHBOARD_ROUTES` Constant

**Does not exist.** A search across all of `src/` returns no matches for `DASHBOARD_ROUTES`. There is no centralized route constant file for the authenticated dashboard routes.

---

## 11. Manual Prefetch Effects — Detailed Breakdown

### `src/app/(authenticated)/agents/page.tsx` — lines 335–344

```
useEffect(() => {
    if (!authStore.signedIn) return;
    router.prefetch('/agent-builder');
    agentsStore.setShowAlert(showAlert);
    stagesStore.setShowAlert(showAlert);
    agentsStore.loadAgents();
    toolsStore.loadTools();
    modelsStore.loadModels();
    stagesStore.loadStages();
});
```

- **Dependency array:** absent — fires on **every render**.
- `router.prefetch('/agent-builder')` is the first substantive call after the auth guard.
- Mixed with five store-loading side effects in the same effect body.

### `src/app/(authenticated)/tools/page.tsx` — lines 283–295

```
useEffect(() => {
    if (!authStore.signedIn) return;
    router.prefetch('/tool-builder');
    toolsStore.setShowAlert(showAlert);
    stagesStore.setShowAlert(showAlert);
    toolsStore.loadTools();
    stagesStore.loadStages();
    getParameterDefinitions().then(...).catch(() => {});
}, []);
```

- **Dependency array:** `[]` — fires **once on mount**.
- `router.prefetch('/tool-builder')` precedes store-loading calls.

### `src/app/(authenticated)/sres/page.tsx` — lines 345–353

```
useEffect(() => {
    if (!authStore.signedIn) return;
    router.prefetch('/sre-builder');
    structuredResponseEndpointsStore.setShowAlert(showAlert);
    stagesStore.setShowAlert(showAlert);
    structuredResponseEndpointsStore.loadSREs();
    modelsStore.loadModels();
    stagesStore.loadStages();
});
```

- **Dependency array:** absent — fires on **every render**.
- Pattern identical to `agents/page.tsx`.

### `src/app/(authenticated)/documents/page.tsx` — lines 271–278

```
useEffect(() => {
    if (!authStore.signedIn) return;
    router.prefetch('/json-document-builder');
    jsonDocumentsStore.setShowAlert(showAlert);
    stagesStore.setShowAlert(showAlert);
    jsonDocumentsStore.loadDocuments();
    stagesStore.loadStages();
}, []);
```

- **Dependency array:** `[]` — fires **once on mount**.
- Pattern identical to `tools/page.tsx`.

### `src/app/(authenticated)/contexts/page.tsx` — lines ~75–83

```
useEffect(() => {
    agentsStore.setShowAlert(showAlertRef.current);
    agentsStore.loadAgents();
    contextsStore.setShowAlert(showAlertRef.current);
    contextsStore.loadContexts();
    router.prefetch('/contexts');
}, [router]);
```

- **Dependency array:** `[router]` — fires when the `router` object changes (effectively once, since the router instance is stable).
- Prefetches `/contexts`, which is the **current page** — unusual compared to the other four pages which prefetch their respective builder routes.
- No auth guard (`if (!authStore.signedIn) return`) in this effect.

---

## 12. `router.push` in Public Pages Navigating to Authenticated Routes

| File | Line | Target | Context |
|------|------|--------|---------|
| `src/app/(public)/signin/page.tsx` | 17 | `/agents` | Inside `routeBasedOnAuth(signedIn)`, called both from a MobX `reaction` callback and directly inside a `useEffect` (no dep array). Navigates to the authenticated `/agents` route on successful sign-in. |
| `src/app/(public)/signin/page.tsx` | 100 | `/signup` | `onClick` on a "Sign Up" `<Button>` — navigates to another public route, not authenticated. |
| `src/app/(public)/signup/components/SuccessStep.tsx` | 13 | `/` | Inside `handleGoToHome` async function, called from a `<Button>` `onClick`. Navigates to `/` (root), which redirects to the authenticated layout if signed in. |

Only `signin/page.tsx:17` explicitly names an authenticated route (`/agents`) as the post-login redirect destination.
