---
date: 2026-05-11
topic: "Deliverable G: exhaustive-deps sweep — current state audit"
repos_touched: [ajentify-app]
tags: [research, eslint, react-hooks, exhaustive-deps, useEffect]
status: complete
last_updated: 2026-05-11
---

# Deliverable G: exhaustive-deps sweep — current state audit

## 1. ESLint Configuration

**File:** `.eslintrc.json`

```json
{
  "extends": ["next/core-web-vitals", "next/typescript"]
}
```

- Preset extended: `next/core-web-vitals` (plus `next/typescript`)
- `react-hooks/exhaustive-deps` is **not** explicitly configured in the project file; it inherits the default from `eslint-config-next` which sets the rule to **`warn`**.
- No other `react-hooks/*` rules are overridden.
- No `.eslintignore` file exists.
- No `eslint.config.mjs` or `.eslintrc.js` exists; `.eslintrc.json` is the only ESLint config.

**Existing suppression comments (in source):**

| File | Line | Comment |
|------|------|---------|
| `src/app/(authenticated)/stages/components/StageAssignmentField.tsx` | 105 | `// eslint-disable-next-line react-hooks/exhaustive-deps` |

That is the only inline suppression in the entire `src/app/` tree.

---

## 2. Current Lint Output

Running `eslint src/app --ext .ts,.tsx` produces **15 warnings, 0 errors**. Every warning is `react-hooks/exhaustive-deps`.

```
src/app/(authenticated)/agent-builder/[[...agent_id]]/components/GmailTools.tsx
  45:8  warning  React Hook useEffect has a missing dependency: 'loadIntegrations'

src/app/(authenticated)/agent-builder/[[...agent_id]]/components/GoogleCalendarTools.tsx
  35:8  warning  React Hook useEffect has a missing dependency: 'loadIntegrations'

src/app/(authenticated)/agent-builder/[[...agent_id]]/components/MemoryTools.tsx
  31:8  warning  React Hook useEffect has a missing dependency: 'loadDocuments'

src/app/(authenticated)/agent-builder/[[...agent_id]]/components/OutlookTools.tsx
  45:8  warning  React Hook useEffect has a missing dependency: 'loadIntegrations'

src/app/(authenticated)/agent-builder/[[...agent_id]]/page.tsx
  66:8  warning  React Hook useEffect has missing dependencies: 'loadAgentId' and 'setShowAlertOnStore'

src/app/(authenticated)/contexts/page.tsx
  126:8  warning  React Hook useMemo has an unnecessary dependency: 'agentsStore.agents'
                  (outer-scope MobX observable; mutating it doesn't re-render the component)

src/app/(authenticated)/documents/page.tsx
  278:6  warning  React Hook useEffect has missing dependencies: 'router' and 'showAlert'

src/app/(authenticated)/gmail/authcode/page.tsx
  48:6  warning  React Hook useEffect has a missing dependency: 'exchangeCode'

src/app/(authenticated)/google-calendar/authcode/page.tsx
  48:6  warning  React Hook useEffect has a missing dependency: 'exchangeCode'

src/app/(authenticated)/json-document-builder/[[...document_id]]/page.tsx
  41:8  warning  React Hook useEffect has missing dependencies: 'loadDocumentId' and 'showAlert'

src/app/(authenticated)/outlook/callback/page.tsx
  48:6  warning  React Hook useEffect has a missing dependency: 'exchangeCode'

src/app/(authenticated)/sre-builder/[[...sre_id]]/page.tsx
  43:6  warning  React Hook useEffect has missing dependencies: 'loadSREId' and 'setShowAlertOnStore'

src/app/(authenticated)/tool-builder/[[...tool_id]]/page.tsx
  41:8  warning  React Hook useEffect has missing dependencies: 'loadToolId' and 'setShowAlertOnStore'

src/app/(authenticated)/tools/page.tsx
  295:6  warning  React Hook useEffect has missing dependencies: 'router' and 'showAlert'

src/app/components/chatbox/ChatBox.tsx
  141:8  warning  React Hook useEffect has missing dependencies: 'context.context_id', 'for_display',
                  'onEvents', and 'showAlert'
```

Promoting `react-hooks/exhaustive-deps` from `warn` to `error` would cause `next build` (which runs lint) to fail on these 15 sites unless each is resolved or explicitly suppressed.

---

## 3. Complete useEffect Inventory

### 3a. Root pages

#### `src/app/layout.tsx`

| Line | Deps array | Purpose |
|------|-----------|---------|
| 23 | `[]` | Calls `authStore.checkAuth()` once on app mount |

#### `src/app/page.tsx`

| Line | Deps array | Purpose |
|------|-----------|---------|
| 21 | **(none)** | Sets up `reaction(authStore.signedIn, ...)` and immediately calls `routeBasedOnAuth(authStore.signedIn)` — auth-redirect pattern |

---

### 3b. Public pages

#### `src/app/(public)/signin/page.tsx`

| Line | Deps array | Purpose |
|------|-----------|---------|
| 21 | **(none)** | Sets up `reaction(authStore.signedIn, ...)` and calls `routeBasedOnAuth(authStore.signedIn)` — auth-redirect pattern |

#### `src/app/(public)/signup/page.tsx`

| Line | Deps array | Purpose |
|------|-----------|---------|
| 21 | `[]` | Cleanup only: `return () => { signUpStore.reset(); }` on unmount |

---

### 3c. Authenticated layout

#### `src/app/(authenticated)/layout.tsx`

| Line | Deps array | Purpose |
|------|-----------|---------|
| 27 | **(none)** | Sets up `reaction(authStore.signedIn, ...)` and calls `routeBasedOnAuth(authStore.signedIn)` — auth-redirect pattern |
| 44 | `[isWideScreen]` | Opens sidebar when viewport becomes wide (`setSidebarOpen(true)`) |

---

### 3d. Authenticated pages

#### `src/app/(authenticated)/usage/page.tsx`

| Line | Deps array | Purpose |
|------|-----------|---------|
| 71 | `[selectedYear, selectedMonth, fetchUsage]` | Calls `fetchUsage(selectedYear, selectedMonth)` when date selection changes |

#### `src/app/(authenticated)/chat/page.tsx`

| Line | Deps array | Purpose |
|------|-----------|---------|
| 40 | `[]` | Calls `chatPageStore.loadData()` once on mount |
| 45 | **(none)** | Calls `setAlertOnStore()` → `chatPageStore.setShowAlert(showAlert)` on every render |

#### `src/app/(authenticated)/tools/page.tsx`

| Line | Deps array | Purpose |
|------|-----------|---------|
| 283 | `[]` | Sets `toolsStore.setShowAlert(showAlert)`, `stagesStore.setShowAlert(showAlert)`, calls `toolsStore.loadTools()`, `stagesStore.loadStages()`, `getParameterDefinitions()`. **Lint warning:** missing deps `router`, `showAlert` |

#### `src/app/(authenticated)/stages/[stage_id]/page.tsx`

| Line | Deps array | Purpose |
|------|-----------|---------|
| 119 | `[stageId, showAlert]` | Sets `stagesStore.setShowAlert(showAlert)`, fetches `getStage(stageId)` with cancellation token |
| 138 | `[stage, resourcesReloadKey]` | Fetches all stage resources (`getAgents`, `getTools`, `getSREs`, `getJsonDocuments`) + unattached pool; sets local state |
| 688 | `[isOpen, stage]` | (EditStageModal) Seeds form fields `name`, `description` from `stage` when modal opens |
| 786 | `[isOpen]` | (CloneStageModal) Resets form fields and flags when modal opens |

#### `src/app/(authenticated)/stages/page.tsx`

| Line | Deps array | Purpose |
|------|-----------|---------|
| 156 | **(none)** | Calls `stagesStore.setShowAlert(showAlert)` and `stagesStore.loadStages()` on every render |

#### `src/app/(authenticated)/chat-page-builder/[[...chat_page_id]]/page.tsx`

| Line | Deps array | Purpose |
|------|-----------|---------|
| 49 | **(none)** | Calls `setAlertOnStore()` → `chatPageBuilderStore.setShowAlert(showAlert)` and `loadChatPageId()` on every render |

#### `src/app/(authenticated)/chat-pages/page.tsx`

| Line | Deps array | Purpose |
|------|-----------|---------|
| 26 | **(none)** | Calls `setAlertOnStore()` → `chatPagesStore.setShowAlert(showAlert)` and `chatPagesStore.loadChatPages()` on every render |

#### `src/app/(authenticated)/json-document-builder/[[...document_id]]/page.tsx`

| Line | Deps array | Purpose |
|------|-----------|---------|
| 35 | `[]` | Calls `jsonDocumentBuilderStore.setShowAlert(showAlert)` and `loadDocumentId()`; cleanup resets store. **Lint warning:** missing deps `loadDocumentId`, `showAlert` |

#### `src/app/(authenticated)/agents/page.tsx`

| Line | Deps array | Purpose |
|------|-----------|---------|
| 335 | **(none)** | Sets alert on `agentsStore` and `stagesStore`; calls `agentsStore.loadAgents()`, `toolsStore.loadTools()`, `modelsStore.loadModels()`, `stagesStore.loadStages()` on every render |

#### `src/app/(authenticated)/tool-builder/[[...tool_id]]/page.tsx`

| Line | Deps array | Purpose |
|------|-----------|---------|
| 34 | `[]` | Calls `setShowAlertOnStore()` → `toolBuilderStore.setShowAlert(showAlert)` and `loadToolId()`; cleanup resets store. **Lint warning:** missing deps `loadToolId`, `setShowAlertOnStore` |

#### `src/app/(authenticated)/api-keys/page.tsx`

| Line | Deps array | Purpose |
|------|-----------|---------|
| 68 | `[fetchKeys]` | Calls `fetchKeys()` (stable `useCallback`); triggers on mount and when `fetchKeys` identity changes |

#### `src/app/(authenticated)/sres/page.tsx`

| Line | Deps array | Purpose |
|------|-----------|---------|
| 345 | **(none)** | Sets alert on `structuredResponseEndpointsStore` and `stagesStore`; calls `loadSREs()`, `modelsStore.loadModels()`, `stagesStore.loadStages()` on every render |

#### `src/app/(authenticated)/sre-builder/[[...sre_id]]/page.tsx`

| Line | Deps array | Purpose |
|------|-----------|---------|
| 36 | `[]` | Calls `setShowAlertOnStore()` → `sreBuilderStore.setShowAlert(showAlert)` and `loadSREId()`; cleanup resets store. **Lint warning:** missing deps `loadSREId`, `setShowAlertOnStore` |
| 46 | `[navGuard, showAlert]` | Navigation-guard effect: shows unsaved-changes alert via `showAlert()` when `navGuard.active` is truthy |

#### `src/app/(authenticated)/create-team/page.tsx`

| Line | Deps array | Purpose |
|------|-----------|---------|
| 19 | `[]` | Cleanup only: `return () => { createTeamStore.reset(); }` on unmount |
| 25 | **(none)** | Sets up `reaction(createTeamStore.step, ...)` to drive horizontal scroll animation |

#### `src/app/(authenticated)/contexts/page.tsx`

| Line | Deps array | Purpose |
|------|-----------|---------|
| 65 | `[showAlert]` | Keeps `showAlertRef.current` in sync with the latest `showAlert` value |
| 73 | `[router]` | Calls `agentsStore.setShowAlert`, `contextsStore.setShowAlert`, `agentsStore.loadAgents()`, `contextsStore.loadContexts()`, `router.prefetch('/contexts')` |

#### `src/app/(authenticated)/contexts/[context_id]/page.tsx`

| Line | Deps array | Purpose |
|------|-----------|---------|
| 216 | `[contextId]` | Fetches a single `Context` via `getContext({ context_id: contextId, with_tool_calls: true })` with cancellation token |

#### `src/app/(authenticated)/integrations/page.tsx`

| Line | Deps array | Purpose |
|------|-----------|---------|
| 73 | **(none)** | Calls `setShowAlertOnStore()` → `integrationsStore.setShowAlert(showAlert)` and `integrationsStore.loadIntegrations()` on every render |

#### `src/app/(authenticated)/documents/page.tsx`

| Line | Deps array | Purpose |
|------|-----------|---------|
| 271 | `[]` | Calls `jsonDocumentsStore.setShowAlert(showAlert)`, `stagesStore.setShowAlert(showAlert)`, `jsonDocumentsStore.loadDocuments()`, `stagesStore.loadStages()`, `router.prefetch('/json-document-builder')`. **Lint warning:** missing deps `router`, `showAlert` |

#### `src/app/(authenticated)/gmail/authcode/page.tsx`

| Line | Deps array | Purpose |
|------|-----------|---------|
| 24 | `[searchParams]` | OAuth callback: reads `code`/`state` from search params and exchanges via `exchangeGmailCode()`. Guards against double execution with `hasExchanged` ref. **Lint warning:** missing dep `exchangeCode` |

#### `src/app/(authenticated)/google-calendar/authcode/page.tsx`

| Line | Deps array | Purpose |
|------|-----------|---------|
| 24 | `[searchParams]` | OAuth callback: reads `code`/`state` from search params and exchanges via `exchangeGoogleCalendarCode()`. Guards against double execution with `hasExchanged` ref. **Lint warning:** missing dep `exchangeCode` |

#### `src/app/(authenticated)/outlook/callback/page.tsx`

| Line | Deps array | Purpose |
|------|-----------|---------|
| 24 | `[searchParams]` | OAuth callback: reads `code`/`state` from search params and exchanges via `exchangeOutlookCode()`. Guards against double execution with `hasExchanged` ref. **Lint warning:** missing dep `exchangeCode` |

#### `src/app/(authenticated)/agent-builder/[[...agent_id]]/page.tsx`

| Line | Deps array | Purpose |
|------|-----------|---------|
| 58 | `[]` | Calls `setShowAlertOnStore()` → `agentBuilderStore.setShowAlert(showAlert)`, `loadAgentId()`, `toolsStore.loadTools()`; cleanup resets store. **Lint warning:** missing deps `loadAgentId`, `setShowAlertOnStore` |
| 83 | `[navGuard, showAlert]` | Navigation-guard effect: shows unsaved-changes alert via `showAlert()` when `navGuard.active` is truthy; cleans up agent/context if new and unsaved |

---

### 3e. Authenticated stage components

#### `src/app/(authenticated)/stages/components/StageAssignmentField.tsx`

| Line | Deps array | Purpose |
|------|-----------|---------|
| 94 | `[]` | Lazily loads stage cache via `stagesStore.loadStages()` |
| 99 | `[lockedStageId]` | Pushes `lockedStageId` into form value when lock changes. Has intentional `// eslint-disable-next-line react-hooks/exhaustive-deps` to suppress warning about omitted `value`/`onChange` deps |

#### `src/app/(authenticated)/stages/components/AssignToStageModal.tsx`

| Line | Deps array | Purpose |
|------|-----------|---------|
| 65 | `[isOpen, initialValue]` | Resets modal form state (`value`, `error`, `saving`) when modal opens or `initialValue` changes |

#### `src/app/(authenticated)/stages/components/DeployFromJSONModal.tsx`

| Line | Deps array | Purpose |
|------|-----------|---------|
| 146 | `[isOpen, startingValue, defaultStageName]` | Resets all modal state when modal opens |
| 162 | `[copied]` | Starts a 1 500 ms timer to reset `copied → false` after a successful clipboard copy |

#### `src/app/(authenticated)/stages/components/AddExistingResourceModal.tsx`

| Line | Deps array | Purpose |
|------|-----------|---------|
| 96 | `[isOpen]` | Resets search, picked item, logical name, error, and saving state when modal opens |

#### `src/app/(authenticated)/stages/components/DeleteStageDialog.tsx`

| Line | Deps array | Purpose |
|------|-----------|---------|
| 54 | `[stage]` | Resets deletion mode to `'detach'` (safer default) whenever the dialog opens with a new stage |

---

### 3f. Other authenticated components

#### `src/app/(authenticated)/components/StageBindingActionCell.tsx`

| Line | Deps array | Purpose |
|------|-----------|---------|
| 57 | `[]` | Sets `browserMounted = true` after first render to gate portal rendering |

---

### 3g. Shared components (within `src/app/components/`)

#### `src/app/components/chatbox/ChatBox.tsx`

| Line | Deps array | Purpose |
|------|-----------|---------|
| 74 | `[]` | Initialises `TokenStreamingService`, wires event handlers (`onToken`, `onToolCall`, `onError`, `onClose`), connects to the live-agent WebSocket; cleanup calls `service.close()`. **Lint warning:** missing deps `context.context_id`, `for_display`, `onEvents`, `showAlert` |

---

### 3h. Agent-builder sub-components

#### `src/app/(authenticated)/agent-builder/[[...agent_id]]/components/MemoryTools.tsx`

| Line | Deps array | Purpose |
|------|-----------|---------|
| 29 | `[]` | Calls `loadDocuments()` (local async function) to fetch JSON documents. **Lint warning:** missing dep `loadDocuments` |

#### `src/app/(authenticated)/agent-builder/[[...agent_id]]/components/GmailTools.tsx`

| Line | Deps array | Purpose |
|------|-----------|---------|
| 43 | `[]` | Calls `loadIntegrations()` to fetch Gmail integrations via `integrationsStore`. **Lint warning:** missing dep `loadIntegrations` |

#### `src/app/(authenticated)/agent-builder/[[...agent_id]]/components/OutlookTools.tsx`

| Line | Deps array | Purpose |
|------|-----------|---------|
| 43 | `[]` | Calls `loadIntegrations()` to fetch Outlook integrations via `integrationsStore`. **Lint warning:** missing dep `loadIntegrations` |

#### `src/app/(authenticated)/agent-builder/[[...agent_id]]/components/GoogleCalendarTools.tsx`

| Line | Deps array | Purpose |
|------|-----------|---------|
| 33 | `[]` | Calls `loadIntegrations()` to fetch Google Calendar integrations via `integrationsStore`. **Lint warning:** missing dep `loadIntegrations` |

#### `src/app/(authenticated)/agent-builder/[[...agent_id]]/components/CustomAgentTools.tsx`

| Line | Deps array | Purpose |
|------|-----------|---------|
| 10 | `[]` | Calls `toolsStore.loadTools()` once on mount |

---

## 4. setShowAlert Effects

Effects that call `setShowAlert` directly or via an in-component helper (`setAlertOnStore` / `setShowAlertOnStore`). These are the effects targeted by Deliverable C.

| File | Line | Deps | How setShowAlert is called |
|------|------|------|---------------------------|
| `(authenticated)/chat/page.tsx` | 45 | **(none)** | `setAlertOnStore()` → `chatPageStore.setShowAlert(showAlert)` |
| `(authenticated)/stages/[stage_id]/page.tsx` | 119 | `[stageId, showAlert]` | `stagesStore.setShowAlert(showAlert)` directly |
| `(authenticated)/stages/page.tsx` | 156 | **(none)** | `stagesStore.setShowAlert(showAlert)` directly |
| `(authenticated)/chat-page-builder/[[...chat_page_id]]/page.tsx` | 49 | **(none)** | `setAlertOnStore()` → `chatPageBuilderStore.setShowAlert(showAlert)` |
| `(authenticated)/chat-pages/page.tsx` | 26 | **(none)** | `setAlertOnStore()` → `chatPagesStore.setShowAlert(showAlert)` |
| `(authenticated)/json-document-builder/[[...document_id]]/page.tsx` | 35 | `[]` | `jsonDocumentBuilderStore.setShowAlert(showAlert)` directly |
| `(authenticated)/agents/page.tsx` | 335 | **(none)** | `agentsStore.setShowAlert(showAlert)` directly |
| `(authenticated)/agent-builder/[[...agent_id]]/page.tsx` | 58 | `[]` | `setShowAlertOnStore()` → `agentBuilderStore.setShowAlert(showAlert)` |
| `(authenticated)/tool-builder/[[...tool_id]]/page.tsx` | 34 | `[]` | `setShowAlertOnStore()` → `toolBuilderStore.setShowAlert(showAlert)` |
| `(authenticated)/sres/page.tsx` | 345 | **(none)** | `structuredResponseEndpointsStore.setShowAlert(showAlert)` directly |
| `(authenticated)/sre-builder/[[...sre_id]]/page.tsx` | 36 | `[]` | `setShowAlertOnStore()` → `sreBuilderStore.setShowAlert(showAlert)` |
| `(authenticated)/integrations/page.tsx` | 73 | **(none)** | `setShowAlertOnStore()` → `integrationsStore.setShowAlert(showAlert)` |
| `(authenticated)/contexts/page.tsx` | 73 | `[router]` | `agentsStore.setShowAlert(showAlertRef.current)` and `contextsStore.setShowAlert(showAlertRef.current)` via ref |
| `(authenticated)/documents/page.tsx` | 271 | `[]` | `jsonDocumentsStore.setShowAlert(showAlert)` and `stagesStore.setShowAlert(showAlert)` directly |
| `(authenticated)/tools/page.tsx` | 283 | `[]` | `toolsStore.setShowAlert(showAlert)` and `stagesStore.setShowAlert(showAlert)` directly |

---

## 5. reaction() Effects

Effects that wrap a MobX `reaction()` call. These are the auth-redirect / reactive-scroll patterns targeted by Deliverable F.

| File | Line | Deps | What reaction() observes | Purpose |
|------|------|------|--------------------------|---------|
| `src/app/page.tsx` | 21 | **(none)** | `authStore.signedIn` | Redirects to `/agents` or `/landing` based on auth state |
| `src/app/(public)/signin/page.tsx` | 21 | **(none)** | `authStore.signedIn` | Redirects to `/agents` when user signs in |
| `src/app/(authenticated)/layout.tsx` | 27 | **(none)** | `authStore.signedIn` | Redirects to `/signin` when signed out; loads user when signed in |
| `src/app/(authenticated)/create-team/page.tsx` | 25 | **(none)** | `createTeamStore.step` | Triggers horizontal scroll animation to the active step |

---

## 6. Empty-Deps `[]` Effects

Effects with `[]` as their deps array (run once on mount only).

| File | Line | Purpose |
|------|------|---------|
| `src/app/layout.tsx` | 23 | `authStore.checkAuth()` |
| `src/app/(public)/signup/page.tsx` | 21 | Cleanup: `signUpStore.reset()` on unmount |
| `src/app/(authenticated)/chat/page.tsx` | 40 | `chatPageStore.loadData()` |
| `src/app/(authenticated)/tools/page.tsx` | 283 | Load tools/stages, set alert refs |
| `src/app/(authenticated)/stages/components/StageAssignmentField.tsx` | 94 | `stagesStore.loadStages()` |
| `src/app/(authenticated)/json-document-builder/[[...document_id]]/page.tsx` | 35 | Set alert, load document id, cleanup reset |
| `src/app/(authenticated)/agent-builder/[[...agent_id]]/page.tsx` | 58 | Set alert, load agent id, load tools, cleanup reset |
| `src/app/(authenticated)/agent-builder/[[...agent_id]]/components/MemoryTools.tsx` | 29 | `loadDocuments()` |
| `src/app/(authenticated)/agent-builder/[[...agent_id]]/components/GmailTools.tsx` | 43 | `loadIntegrations()` |
| `src/app/(authenticated)/agent-builder/[[...agent_id]]/components/OutlookTools.tsx` | 43 | `loadIntegrations()` |
| `src/app/(authenticated)/agent-builder/[[...agent_id]]/components/GoogleCalendarTools.tsx` | 33 | `loadIntegrations()` |
| `src/app/(authenticated)/agent-builder/[[...agent_id]]/components/CustomAgentTools.tsx` | 10 | `toolsStore.loadTools()` |
| `src/app/(authenticated)/tool-builder/[[...tool_id]]/page.tsx` | 34 | Set alert, load tool id, cleanup reset |
| `src/app/(authenticated)/sre-builder/[[...sre_id]]/page.tsx` | 36 | Set alert, load SRE id, cleanup reset |
| `src/app/(authenticated)/create-team/page.tsx` | 19 | Cleanup: `createTeamStore.reset()` on unmount |
| `src/app/(authenticated)/components/StageBindingActionCell.tsx` | 57 | `setBrowserMounted(true)` |
| `src/app/(authenticated)/documents/page.tsx` | 271 | Load documents/stages, set alert refs |
| `src/app/components/chatbox/ChatBox.tsx` | 74 | Initialise `TokenStreamingService`, connect WebSocket |

---

## 7. No-Deps Effects (No Array At All)

Effects with no deps argument — run after **every** render.

| File | Line | Purpose | Contains setShowAlert? | Contains reaction()? |
|------|------|---------|----------------------|---------------------|
| `src/app/page.tsx` | 21 | Auth-redirect via `reaction(authStore.signedIn, ...)` | No | Yes |
| `src/app/(public)/signin/page.tsx` | 21 | Auth-redirect via `reaction(authStore.signedIn, ...)` | No | Yes |
| `src/app/(authenticated)/layout.tsx` | 27 | Auth-redirect via `reaction(authStore.signedIn, ...)` | No | Yes |
| `src/app/(authenticated)/chat/page.tsx` | 45 | `chatPageStore.setShowAlert(showAlert)` | Yes | No |
| `src/app/(authenticated)/stages/page.tsx` | 156 | `stagesStore.setShowAlert(showAlert)` + `stagesStore.loadStages()` | Yes | No |
| `src/app/(authenticated)/chat-page-builder/[[...chat_page_id]]/page.tsx` | 49 | `chatPageBuilderStore.setShowAlert(showAlert)` + `loadChatPageId()` | Yes | No |
| `src/app/(authenticated)/chat-pages/page.tsx` | 26 | `chatPagesStore.setShowAlert(showAlert)` + `chatPagesStore.loadChatPages()` | Yes | No |
| `src/app/(authenticated)/agents/page.tsx` | 335 | Alert + load agents/tools/models/stages | Yes | No |
| `src/app/(authenticated)/sres/page.tsx` | 345 | Alert + load SREs/models/stages | Yes | No |
| `src/app/(authenticated)/integrations/page.tsx` | 73 | Alert + `integrationsStore.loadIntegrations()` | Yes | No |
| `src/app/(authenticated)/create-team/page.tsx` | 25 | Scroll animation via `reaction(createTeamStore.step, ...)` | No | Yes |

---

## 8. Summary Counts

| Category | Count |
|----------|-------|
| Total `useEffect` call sites in `src/app/` | 47 |
| Currently producing lint warnings (`react-hooks/exhaustive-deps`) | 15 |
| Currently at error level | 0 |
| No-deps array (runs every render) | 11 |
| Empty-deps `[]` (mount-once) | 18 |
| Specific deps (non-empty array) | 18 |
| setShowAlert-containing effects | 15 |
| `reaction()` inside `useEffect` | 4 |
| Existing `eslint-disable` suppressions for `exhaustive-deps` | 1 (`StageAssignmentField.tsx:105`) |
| `.eslintignore` file | None |

> **Note:** The 1 existing `eslint-disable-next-line react-hooks/exhaustive-deps` in `StageAssignmentField.tsx:105` is intentional — the comment explains that `value` and `onChange` are deliberately omitted to avoid reacting to every value change.

---

## 9. Files NOT flagged by current linter but with [] deps that close over non-stable values

These are `[]`-deps effects that capture non-stable references but currently pass lint because the captured values are MobX store singletons (module-level imports, not component props or state):

- `tools/page.tsx:283` — captures `showAlert` (component-local) and `router` (hook) → **lint warns**
- `documents/page.tsx:271` — captures `showAlert` and `router` → **lint warns**
- `json-document-builder/.../page.tsx:35` — captures `showAlert` (via `jsonDocumentBuilderStore.setShowAlert(showAlert)`) → **lint warns**
- `agent-builder/.../page.tsx:58` — captures `showAlert` (via `setShowAlertOnStore`) → **lint warns**
- `tool-builder/.../page.tsx:34` — captures `showAlert` (via `setShowAlertOnStore`) → **lint warns**
- `sre-builder/.../page.tsx:36` — captures `showAlert` (via `setShowAlertOnStore`) → **lint warns**

The remaining `[]` effects capture only stable store singletons or produce no closure over component-local values, so they pass lint silently.
