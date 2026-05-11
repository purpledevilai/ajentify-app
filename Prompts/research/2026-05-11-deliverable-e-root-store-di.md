---
date: 2026-05-11
topic: "Deliverable E: Root Store + Per-Store DI — current state audit"
repos_touched: [ajentify-app]
tags: [research, mobx, root-store, dependency-injection, singletons, stores]
status: complete
last_updated: 2026-05-11
---

# Deliverable E: Root Store + Per-Store DI — Current State Audit

## Overview

This document audits every file in `/workspace/src/store/` as of 2026-05-11 to establish the exact baseline before any refactoring work for Deliverable E (Root Store + Per-Store Dependency Injection). All descriptions are factual observations of what currently exists.

---

## 1. Store Inventory

There are **19 files** in `/workspace/src/store/`:

| File | Singleton export name | Has `reset()`? |
|---|---|---|
| `AgentBuilderStore.ts` | `agentBuilderStore` | Yes |
| `AgentsStore.ts` | `agentsStore` | Yes |
| `AuthStore.ts` | `authStore` | Yes |
| `ChatPageBuilderStore.ts` | `chatPageBuilderStore` | Yes |
| `ChatPagesStore.ts` | `chatPagesStore` | Yes |
| `ChatPageStore.ts` | `chatPageStore` | Yes |
| `ContextsStore.ts` | `contextsStore` | Yes |
| `CreateTeamStore.ts` | `createTeamStore` | Yes |
| `IntegrationsStore.ts` | `integrationsStore` | Yes |
| `JsonDocumentBuilderStore.ts` | `jsonDocumentBuilderStore` | Yes |
| `JsonDocumentsStore.ts` | `jsonDocumentsStore` | Yes |
| `ModelsStore.ts` | `modelsStore` | No |
| `refreshDashboardCaches.ts` | *(utility function, no class)* | N/A |
| `SignUpStore.ts` | `signUpStore` | Yes |
| `StagesStore.ts` | `stagesStore` | Yes |
| `StructuredResponseEndpointBuilderStore.ts` | `sreBuilderStore` | Yes |
| `StructuredResponseEndpointStore.ts` | `structuredResponseEndpointsStore` | Yes |
| `ToolBuilderStore.ts` | `toolBuilderStore` | Yes |
| `ToolsStore.ts` | `toolsStore` | Yes |

**Missing files (do not exist):**
- `RootStore.ts` — absent
- `StoreContext.tsx` — absent
- `AuthFlowStore.ts` — absent
- `AuthFlowStoreContext.tsx` — absent
- `ParameterDefinitionsStore.ts` — absent

---

## 2. Per-Store Detail

### 2.1 `AuthStore.ts`

**File:** `src/store/AuthStore.ts`  
**Singleton:** `export const authStore = new AuthStore();` (line 209)  
**Constructor:** No arguments — `constructor()` calls `makeAutoObservable(this)` (lines 44–46)

#### Observable fields (lines 28–36, 38–42)

| Field | Type | Initial value |
|---|---|---|
| `email` | `string` | `''` |
| `password` | `string` | `''` |
| `signInLoading` | `boolean` | `false` |
| `signInError` | `string` | `''` |
| `isDeterminingAuth` | `boolean` | `true` |
| `signedIn` | `boolean` | `false` |
| `user` | `User \| undefined` | `undefined` |
| `userLoading` | `boolean` | `false` |
| `forgotPasswordLoading` | `boolean` | `false` |
| `forgotPasswordStep` | `'email' \| 'code' \| 'completed'` | `'email'` |
| `forgotPasswordError` | `string` | `''` |
| `resetPasswordCode` | `string` | `''` |
| `newPassword` | `string` | `''` |

**No dedicated `error` field** — errors are stored in `signInError` (string) and `forgotPasswordError` (string). There is no `handleAuthFailure()` method and no `forceRefreshAccessToken()` method.

#### `checkAuth()` (lines 77–82)
Sets `isDeterminingAuth = true`, calls `this.getAccessToken()`, sets `signedIn = (token !== undefined)`, then sets `isDeterminingAuth = false`. Does not fetch user data.

#### `getAccessToken()` (lines 66–75)
Calls AWS Amplify `fetchAuthSession()`, returns `session.tokens?.accessToken.toString()`, returns `undefined` on error. Exists as an observable action.

#### `submitSignIn()` (lines 84–97)
Sets `signedIn = false` at the top, calls the `signIn` API, then sets **`signedIn = true` directly** on success (line 91). Sets `signInError` on failure.

#### `signOut()` (lines 99–121)
Calls the `signOut` API, then **manually calls `.reset()` on 14 named store singletons** imported at the top of the file:
- `agentBuilderStore.reset()` (line 102)
- `agentsStore.reset()` (line 103)
- `chatPageBuilderStore.reset()` (line 104)
- `chatPagesStore.reset()` (line 105)
- `chatPageStore.reset()` (line 106)
- `structuredResponseEndpointsStore.reset()` (line 107)
- `sreBuilderStore.reset()` (line 108)
- `jsonDocumentsStore.reset()` (line 109)
- `jsonDocumentBuilderStore.reset()` (line 110)
- `integrationsStore.reset()` (line 111)
- `toolsStore.reset()` (line 112)
- `toolBuilderStore.reset()` (line 113)
- `stagesStore.reset()` (line 114)
- `contextsStore.reset()` (line 115)

Then calls `this.reset()` (line 116) and sets `this.signedIn = false` (line 117).

**Notable omissions from `signOut()` reset list:** `createTeamStore`, `signUpStore`, `chatPageStore` (wait — `chatPageStore` IS included at line 106), `modelsStore` (has no `reset()`).

#### `reset()` (lines 48–60)
Clears form fields and user state. Does **not** reset `isDeterminingAuth` or `signedIn` — those are managed separately.

#### Inter-store imports at module level (lines 11–24)
`AuthStore.ts` imports 13 singleton instances from peer store files:
```
agentsStore           from './AgentsStore'
agentBuilderStore     from './AgentBuilderStore'
chatPageBuilderStore  from './ChatPageBuilderStore'
chatPagesStore        from './ChatPagesStore'
chatPageStore         from './ChatPageStore'
structuredResponseEndpointsStore from './StructuredResponseEndpointStore'
sreBuilderStore       from './StructuredResponseEndpointBuilderStore'
jsonDocumentsStore    from './JsonDocumentsStore'
jsonDocumentBuilderStore from './JsonDocumentBuilderStore'
integrationsStore     from './IntegrationsStore'
toolsStore            from './ToolsStore'
toolBuilderStore      from './ToolBuilderStore'
stagesStore           from './StagesStore'
contextsStore         from './ContextsStore'
```

---

### 2.2 `AgentsStore.ts`

**File:** `src/store/AgentsStore.ts`  
**Singleton:** `export const agentsStore = new AgentsStore();` (line 42)  
**Constructor:** No arguments, `makeAutoObservable(this)` (lines 11–13)

**Observable fields:**

| Field | Type | Initial value |
|---|---|---|
| `showAlert` | function | `() => undefined` |
| `agents` | `Agent[] \| undefined` | `undefined` |
| `agentsLoading` | `boolean` | `true` |

**No error field** — errors are surfaced via `showAlert` callback.

**`reset()`** (lines 37–39): Sets `agents = undefined`.

**Inter-store imports:** None.

---

### 2.3 `AgentBuilderStore.ts`

**File:** `src/store/AgentBuilderStore.ts`  
**Singleton:** `export const agentBuilderStore = new AgentBuilderStore();` (line 494)  
**Constructor:** No arguments. Uses `makeAutoObservable(this, { promptArgs: computed })` (lines 115–119).

**Observable fields (selected):**

| Field | Type | Initial value |
|---|---|---|
| `showAlert` | function | `() => undefined` |
| `isNewAgent` | `boolean` | `false` |
| `currentAgent` | `Agent` | default empty Agent object |
| `hasUpdates` | `boolean` | `false` |
| `agentLoading` | `boolean` | `false` |
| `agentDeleteLoading` | `boolean` | `false` |
| `promptEngineerContext` | `Context \| undefined` | `undefined` |
| `promptEngineerContextLoading` | `boolean` | `false` |
| `agentContext` | `Context \| undefined` | `undefined` |
| `agentContextLoading` | `boolean` | `false` |
| `showDeleteButton` | `boolean` | `false` |
| `showAgentId` | `boolean` | `false` |
| `agentTools` | `string[]` | static list |
| `presentedAgentTool` | `string` | `'memory'` |
| `showPromptArgsInput` | `boolean` | `false` |
| `promptArgsInput` | `Record<string, string>` | `{}` |
| `tools` | `Tool[]` | `[]` |
| `isLoadingTools` | `boolean` | `false` |

**No dedicated error field** — errors go through `showAlert` callback.

**`reset()`** (lines 121–151): Resets all fields to initial values.

**Inter-store imports:** Imports `agentsStore` from `'./AgentsStore'` (line 11). Used in `setCurrentAgentWithId()` (line 205) to call `agentsStore.loadAgents()` and read `agentsStore.agents`.

---

### 2.4 `ChatPageBuilderStore.ts`

**File:** `src/store/ChatPageBuilderStore.ts`  
**Singleton:** `export const chatPageBuilderStore = new ChatPageBuilderStore();` (line 162)  
**Constructor:** No arguments. Sets `this.chatPage = defaultChatPage` first, then calls `makeAutoObservable(this)` (lines 48–51).

**Observable fields:**

| Field | Type | Initial value |
|---|---|---|
| `showAlert` | function | `() => undefined` |
| `chatPage` | `ChatPageData` | `defaultChatPage` |
| `chatPageSaving` | `boolean` | `false` |
| `chatPageDeleting` | `boolean` | `false` |
| `chatBoxMode` | `'light' \| 'dark'` | `'light'` |
| `dummyContext` | `Context` | static dummy object |

**`reset()`** (lines 53–55): Sets `chatPage = defaultChatPage`.

**Inter-store imports:** Imports 3 singletons at module level:
- `authStore` from `'./AuthStore'` (line 4) — used in `initiateNew()` to read `authStore.user?.organizations[0].id`
- `agentsStore` from `'./AgentsStore'` (line 5) — used in `initiateNew()` to read `agentsStore.agents`
- `chatPagesStore` from `'./ChatPagesStore'` (line 6) — used in `setChatPageWithId()` to call `chatPagesStore.loadChatPages()`

---

### 2.5 `ChatPagesStore.ts`

**File:** `src/store/ChatPagesStore.ts`  
**Singleton:** `export const chatPagesStore = new ChatPagesStore();` (line 44)  
**Constructor:** No arguments, `makeAutoObservable(this)` (lines 12–14).

**Observable fields:**

| Field | Type | Initial value |
|---|---|---|
| `chatPages` | `ChatPageData[] \| undefined` | `undefined` |
| `chatPagesLoading` | `boolean` | `true` |
| `showAlert` | function | `() => undefined` |

**`reset()`** (lines 16–18): Sets `chatPages = undefined`.

**Inter-store imports:** None.

---

### 2.6 `ChatPageStore.ts`

**File:** `src/store/ChatPageStore.ts`  
**Singleton:** `export const chatPageStore = new ChatPageStore();` (line 158)  
**Constructor:** No arguments, `makeAutoObservable(this)` (lines 24–26).

**Observable fields:**

| Field | Type | Initial value |
|---|---|---|
| `hasInitiatedLoad` | `boolean` | `false` |
| `agents` | `Agent[] \| undefined` | `undefined` |
| `agentsLoading` | `boolean` | `true` |
| `currentContext` | `Context \| undefined` | `undefined` |
| `currentAgentName` | `string \| undefined` | `undefined` |
| `currentContextLoading` | `boolean` | `false` |
| `contextHistory` | `ContextHistory[] \| undefined` | `undefined` |
| `contextHistoryLoading` | `boolean` | `false` |
| `showAlert` | function | `() => undefined` |

**`reset()`** (lines 28–37): Resets all fields to initial values.

**Inter-store imports:** None. (Note: fetches agents directly via `getAgents()` API call — does not use `AgentsStore`.)

---

### 2.7 `ContextsStore.ts`

**File:** `src/store/ContextsStore.ts`  
**Singleton:** `export const contextsStore = new ContextsStore();` (line 163)  
**Constructor:** No arguments, `makeAutoObservable(this)` (lines 65–67).

**Observable fields:**

| Field | Type | Initial value |
|---|---|---|
| `contexts` | `OrgContextSummary[]` | `[]` |
| `nextCursor` | `string \| null` | `null` |
| `loading` | `boolean` | `false` |
| `loadingMore` | `boolean` | `false` |
| `loaded` | `boolean` | `false` |
| `appliedAgentId` | `string` | `''` |
| `appliedClientId` | `string` | `''` |
| `appliedContextId` | `string` | `''` |
| `showAlert` | function | `() => undefined` |

**`reset()`** (lines 151–160): Clears all fields and filter state.

**Inter-store imports:** None.

---

### 2.8 `CreateTeamStore.ts`

**File:** `src/store/CreateTeamStore.ts`  
**Singleton:** `export const createTeamStore = new CreateTeamStore();` (line 209)  
**Constructor:** No arguments, `makeAutoObservable(this)` (lines 55–57).

**Observable fields (selected):**

| Field | Type | Initial value |
|---|---|---|
| `businessName` | `string` | `authStore.user?.organizations[0].name \|\| ''` |
| `businessDescription` | `string` | `''` |
| `linkData` | array | 3 default link entries |
| `selectedMembers` | `string[]` | `[]` |
| `step` | union string | `'business-information'` |
| `createingTeamLoading` | `boolean` | `false` |
| `gettingLinkData` | `boolean` | `false` |
| `jobId` | `string` | `''` |
| `pollingTime` | `number` | `2000` |
| `showAlert` | function | `() => undefined` |

**`reset()`** (lines 59–72): Resets to initial values. Note: `businessName` reset also reads `authStore.user?.organizations[0].name || ''` (line 60).

**Inter-store imports:**
- `agentsStore` from `'./AgentsStore'` (line 6) — used in `pollJobStatus()` (line 175) to call `agentsStore.loadAgents(true)`
- `authStore` from `'./AuthStore'` (line 7) — used at field initializer (line 32) and in `reset()` (line 60)

**Important:** `CreateTeamStore` reads `authStore.user` at **class field initialization time** (line 32, before the constructor body runs). This means `authStore` must already be instantiated when `CreateTeamStore` is instantiated.

---

### 2.9 `IntegrationsStore.ts`

**File:** `src/store/IntegrationsStore.ts`  
**Singleton:** `export const integrationsStore = new IntegrationsStore();` (line 71)  
**Constructor:** No arguments, `makeAutoObservable(this)` (lines 13–15).

**Observable fields:**

| Field | Type | Initial value |
|---|---|---|
| `showAlert` | function | `() => undefined` |
| `integrations` | `Integration[] \| undefined` | `undefined` |
| `integrationsLoading` | `boolean` | `true` |
| `deleteLoading` | `boolean` | `false` |

**`reset()`** (lines 66–68): Sets `integrations = undefined`.

**Inter-store imports:** None.

---

### 2.10 `JsonDocumentBuilderStore.ts`

**File:** `src/store/JsonDocumentBuilderStore.ts`  
**Singleton:** `export const jsonDocumentBuilderStore = new JsonDocumentBuilderStore();` (line 134)  
**Constructor:** No arguments, `makeAutoObservable(this)` (lines 23–25).

**Observable fields:**

| Field | Type | Initial value |
|---|---|---|
| `showAlert` | function | `() => undefined` |
| `document` | `JsonDocument` | `{ ...defaultDocument }` |
| `dataString` | `string` | `'{}'` |
| `dataError` | `string \| null` | `null` |
| `isNewDocument` | `boolean` | `false` |
| `saving` | `boolean` | `false` |
| `deleting` | `boolean` | `false` |

**`reset()`** (lines 27–34): Resets all fields.

**Inter-store imports:** None.

---

### 2.11 `JsonDocumentsStore.ts`

**File:** `src/store/JsonDocumentsStore.ts`  
**Singleton:** `export const jsonDocumentsStore = new JsonDocumentsStore();` (line 42)  
**Constructor:** No arguments, `makeAutoObservable(this)` (lines 12–14).

**Observable fields:**

| Field | Type | Initial value |
|---|---|---|
| `showAlert` | function | `() => undefined` |
| `documents` | `JsonDocument[] \| undefined` | `undefined` |
| `documentsLoading` | `boolean` | `true` |

**`reset()`** (lines 37–39): Sets `documents = undefined`.

**Inter-store imports:** None.

---

### 2.12 `ModelsStore.ts`

**File:** `src/store/ModelsStore.ts`  
**Singleton:** `export const modelsStore = new ModelsStore();` (line 38)  
**Constructor:** No arguments, `makeAutoObservable(this)` (lines 11–13).

**Observable fields:**

| Field | Type | Initial value |
|---|---|---|
| `models` | `Model[]` | `[]` |
| `isLoading` | `boolean` | `false` |
| `hasLoaded` | `boolean` | `false` |

**No `reset()` method** — the only store in the codebase without one.  
**No error field** — errors are `console.error`'d and swallowed.

**Inter-store imports:** None.

---

### 2.13 `SignUpStore.ts`

**File:** `src/store/SignUpStore.ts`  
**Singleton:** `export const signUpStore = new SignUpStore();` (line 146)  
**Constructor:** No arguments, `makeAutoObservable(this)` (lines 40–42).

**Observable fields:**

| Field | Type | Initial value |
|---|---|---|
| `firstName` | `string` | `''` |
| `lastName` | `string` | `''` |
| `email` | `string` | `''` |
| `password` | `string` | `''` |
| `confirmCode` | `string` | `''` |
| `confirmPassword` | `string` | `''` |
| `organizationName` | `string` | `''` |
| `step` | union string | `'userDetails'` |
| `signUpLoading` | `boolean` | `false` |
| `confirmSignInLoading` | `boolean` | `false` |
| `createOrgLoading` | `boolean` | `false` |
| `showAlertFlag` | `boolean` | `false` |
| `alertTitle` | `string` | `''` |
| `alertMessage` | `string` | `''` |
| `alertActions` | array | `[]` |

**`reset()`** (lines 44–60): Resets all fields.

**Inter-store imports:** None. (Uses inline `showAlert` state pattern — does not use the `showAlert` callback pattern.)

---

### 2.14 `StagesStore.ts`

**File:** `src/store/StagesStore.ts`  
**Singleton:** `export const stagesStore = new StagesStore();` (line 99)  
**Constructor:** No arguments, `makeAutoObservable(this)` (lines 11–13).

**Observable fields:**

| Field | Type | Initial value |
|---|---|---|
| `showAlert` | function | `() => undefined` |
| `stages` | `Stage[] \| undefined` | `undefined` |
| `stagesLoading` | `boolean` | `true` |

**Computed:** `get hasAnyStage(): boolean` (lines 26–28).

**`reset()`** (lines 94–96): Sets `stages = undefined`.

**Inter-store imports:** None.

---

### 2.15 `StructuredResponseEndpointBuilderStore.ts`

**File:** `src/store/StructuredResponseEndpointBuilderStore.ts`  
**Singleton:** `export const sreBuilderStore = new StructuredResponseEndpointBuilderStore();` (line 521)  
**Constructor:** No arguments. Uses `makeAutoObservable(this, { templateArgs: computed, isLegacySRE: computed, showVariableNamesUI: computed })` (lines 84–90), then calls `this.syncTemplateArgsInput()`.

**Observable fields (selected):**

| Field | Type | Initial value |
|---|---|---|
| `showAlert` | function | `() => undefined` |
| `isNewSme` | `boolean` | `false` |
| `useClickedSave` | `boolean` | `false` |
| `sre` | `StructuredResponseEndpoint` | `defaultSRE` |
| `parameters` | `UIParameterNode[]` | `[]` |
| `isLoadingParameterDefinition` | `boolean` | `false` |
| `isLoadingSRE` | `boolean` | `false` |
| `sreSaving` | `boolean` | `false` |
| `sreDeleting` | `boolean` | `false` |
| `isRunningSRE` | `boolean` | `false` |
| `runResult` | `AnyType \| undefined` | `undefined` |
| `hasUpdatedSRE` | `boolean` | `false` |
| `hasUpdatedParameterDefinition` | `boolean` | `false` |
| `useVariableNames` | `boolean` | `false` |
| `variableNamesInput` | `Record<string, string>` | `{}` |
| `templateArgsInput` | `Record<string, string>` | `{}` |

**`reset()`** (lines 109–126): Resets all fields, calls `syncTemplateArgsInput()`.

**Inter-store imports:**
- `authStore` from `'./AuthStore'` (line 3) — used in `initiateNew()` (line 136) to read `authStore.user?.organizations[0].id`
- `structuredResponseEndpointsStore` from `'./StructuredResponseEndpointStore'` (line 13) — used in `setSREWithId()` (lines 166–185) to call `structuredResponseEndpointsStore.loadSREs()` and read `structuredResponseEndpointsStore.sres`

---

### 2.16 `StructuredResponseEndpointStore.ts`

**File:** `src/store/StructuredResponseEndpointStore.ts`  
**Singleton:** `export const structuredResponseEndpointsStore = new StructuredResponseEndpointsStore();` (line 42)  
**Constructor:** No arguments, `makeAutoObservable(this)` (lines 11–13).

**Observable fields:**

| Field | Type | Initial value |
|---|---|---|
| `showAlert` | function | `() => undefined` |
| `sres` | `StructuredResponseEndpoint[] \| undefined` | `undefined` |
| `sresLoading` | `boolean` | `false` |

**`reset()`** (lines 37–39): Sets `sres = undefined`.

**Inter-store imports:** None.

---

### 2.17 `ToolBuilderStore.ts`

**File:** `src/store/ToolBuilderStore.ts`  
**Singleton:** `export const toolBuilderStore = new ToolBuilderStore();` (line 570)  
**Constructor:** No arguments, `makeAutoObservable(this)` (lines 126–128).

**Observable fields:**

| Field | Type | Initial value |
|---|---|---|
| `showAlert` | function | `() => undefined` |
| `tool` | `Tool` | `defaultTool` |
| `isLoadingParameterDefinition` | `boolean` | `false` |
| `parameters` | `UIParameterNode[]` | `[]` |
| `testInputs` | `TestInput[]` | `[]` |
| `toolSaving` | `boolean` | `false` |
| `toolDeleting` | `boolean` | `false` |
| `functionDeclaration` | `string` | `'def custom_function():'` |
| `toolExecuting` | `boolean` | `false` |

**`reset()`** (lines 130–139): Resets all fields to initial values.

**Inter-store imports:**
- `authStore` from `'./AuthStore'` (line 3) — used in `initiateNew()` (line 148) to read `authStore.user?.organizations[0].id`
- `toolsStore` from `'./ToolsStore'` (line 15) — used in `setToolWithId()` (lines 163–181) to call `toolsStore.loadTools()` and read `toolsStore.tools`

---

### 2.18 `ToolsStore.ts`

**File:** `src/store/ToolsStore.ts`  
**Singleton:** `export const toolsStore = new ToolsStore();` (line 42)  
**Constructor:** No arguments, `makeAutoObservable(this)` (lines 11–13).

**Observable fields:**

| Field | Type | Initial value |
|---|---|---|
| `showAlert` | function | `() => undefined` |
| `tools` | `Tool[] \| undefined` | `undefined` |
| `toolsLoading` | `boolean` | `false` |

**`reset()`** (lines 37–39): Sets `tools = undefined`.

**Inter-store imports:** None.

---

### 2.19 `refreshDashboardCaches.ts`

**File:** `src/store/refreshDashboardCaches.ts`  
**Not a store class** — exports a single plain function `refreshDashboardCaches(): void`.

**What it does:** Force-reloads the list caches for five stores after a stage-level write operation (deploy, destroy, detach, clone, attach). Called from the stages list page and the stage detail page.

**Stores it calls (all with `force=true`):**
- `agentsStore.loadAgents(true)` (line 22)
- `toolsStore.loadTools(true)` (line 23)
- `structuredResponseEndpointsStore.loadSREs(true)` (line 24)
- `jsonDocumentsStore.loadDocuments(true)` (line 25)
- `stagesStore.loadStages(true)` (line 26)

Errors are individually caught and swallowed per store (`.catch(() => undefined)`).

---

## 3. Cross-Store Dependency Graph

### Imports between store files

```
AuthStore.ts
  └── imports singletons from: AgentsStore, AgentBuilderStore,
      ChatPageBuilderStore, ChatPagesStore, ChatPageStore,
      StructuredResponseEndpointStore, StructuredResponseEndpointBuilderStore,
      JsonDocumentsStore, JsonDocumentBuilderStore, IntegrationsStore,
      ToolsStore, ToolBuilderStore, StagesStore, ContextsStore

AgentBuilderStore.ts
  └── imports singleton from: AgentsStore

ChatPageBuilderStore.ts
  └── imports singletons from: AuthStore, AgentsStore, ChatPagesStore

CreateTeamStore.ts
  └── imports singletons from: AgentsStore, AuthStore

StructuredResponseEndpointBuilderStore.ts
  └── imports singletons from: AuthStore, StructuredResponseEndpointStore

ToolBuilderStore.ts
  └── imports singletons from: AuthStore, ToolsStore

refreshDashboardCaches.ts
  └── imports singletons from: AgentsStore, ToolsStore,
      StructuredResponseEndpointStore, JsonDocumentsStore, StagesStore

AgentsStore.ts                   → no inter-store imports
ChatPagesStore.ts                → no inter-store imports
ChatPageStore.ts                 → no inter-store imports
ContextsStore.ts                 → no inter-store imports
IntegrationsStore.ts             → no inter-store imports
JsonDocumentBuilderStore.ts      → no inter-store imports
JsonDocumentsStore.ts            → no inter-store imports
ModelsStore.ts                   → no inter-store imports
SignUpStore.ts                   → no inter-store imports
StagesStore.ts                   → no inter-store imports
StructuredResponseEndpointStore.ts → no inter-store imports
ToolsStore.ts                    → no inter-store imports
```

### Circular dependency note

`AuthStore` → `ChatPageBuilderStore` → `AuthStore` is a **circular import chain** at the module level:
- `AuthStore.ts` (line 13): imports `chatPageBuilderStore` from `./ChatPageBuilderStore`
- `ChatPageBuilderStore.ts` (line 4): imports `authStore` from `./AuthStore`

Similarly, `AuthStore` → `StructuredResponseEndpointBuilderStore` → `AuthStore` and `AuthStore` → `ToolBuilderStore` → `AuthStore` are also circular at the module level. These currently work because JavaScript/Node.js handles circular ESM imports by providing the partially-initialized module, and the singleton instances are only used at call time (not at import parse time).

---

## 4. MobX Setup Patterns

All stores use `makeAutoObservable` (imported from `mobx`). Two variants exist:

**Plain `makeAutoObservable(this)` (most stores):**
- `AgentsStore`, `AuthStore`, `ChatPagesStore`, `ChatPageStore`, `ContextsStore`, `CreateTeamStore`, `IntegrationsStore`, `JsonDocumentBuilderStore`, `JsonDocumentsStore`, `SignUpStore`, `StagesStore`, `StructuredResponseEndpointStore`, `ToolBuilderStore`, `ToolsStore`, `ModelsStore`

**`makeAutoObservable(this, { ... })` with explicit computed overrides:**
- `AgentBuilderStore`: `{ promptArgs: computed }` — line 116
- `StructuredResponseEndpointBuilderStore`: `{ templateArgs: computed, isLegacySRE: computed, showVariableNamesUI: computed }` — line 85

**`ChatPageBuilderStore`** calls `makeAutoObservable(this)` _after_ manually setting `this.chatPage = defaultChatPage` in the constructor body (line 49 before line 50).

---

## 5. Singleton Export Pattern

Every store class is instantiated exactly once in its own file and exported as a module-level `const`. The pattern is uniform across all 18 store files:

```typescript
export const xxxStore = new XxxStore();
```

None of the constructors accept arguments. All stores are self-contained singletons. There is no factory, provider, or injection mechanism — every consumer imports the singleton directly by name.

---

## 6. `showAlert` Injection Pattern

Most stores (all except `SignUpStore`) expose a `showAlert` callback field:

```typescript
showAlert: (params: ShowAlertParams) => void | undefined = () => undefined;
setShowAlert = (showAlert: (params: ShowAlertParams) => void) => {
    this.showAlert = showAlert;
}
```

This field is set externally by page or layout components after mount. `SignUpStore` instead holds alert state (`showAlertFlag`, `alertTitle`, etc.) directly as observable fields and manages it internally.

---

## 7. Singleton Usage in Pages (`/src/app/`)

The table below maps each page/component file to the store singletons it imports directly.

| File | Singletons imported |
|---|---|
| `app/layout.tsx` | `authStore` |
| `app/page.tsx` | `authStore` |
| `app/(authenticated)/layout.tsx` | `authStore` |
| `app/(authenticated)/agents/page.tsx` | `agentsStore`, `agentBuilderStore`, `toolsStore`, `modelsStore`, `stagesStore`, `authStore` |
| `app/(authenticated)/api-keys/page.tsx` | `authStore` |
| `app/(authenticated)/chat-page-builder/[[...chat_page_id]]/page.tsx` | `agentsStore`, `chatPageBuilderStore`, `chatPagesStore` |
| `app/(authenticated)/chat-pages/page.tsx` | `chatPagesStore`, `chatPageBuilderStore`, `authStore` |
| `app/(authenticated)/chat/page.tsx` | `chatPageStore` |
| `app/(authenticated)/components/Sidebar.tsx` | `authStore` |
| `app/(authenticated)/components/StageCells.tsx` | `stagesStore` |
| `app/(authenticated)/contexts/[context_id]/page.tsx` | `authStore` |
| `app/(authenticated)/contexts/page.tsx` | `agentsStore`, `authStore`, `contextsStore` |
| `app/(authenticated)/create-team/components/BusinessInformationStep.tsx` | `createTeamStore` |
| `app/(authenticated)/create-team/components/SelectMembersStep.tsx` | `createTeamStore` |
| `app/(authenticated)/create-team/page.tsx` | `createTeamStore` |
| `app/(authenticated)/documents/page.tsx` | `jsonDocumentsStore`, `jsonDocumentBuilderStore`, `stagesStore`, `authStore` |
| `app/(authenticated)/integrations/page.tsx` | `integrationsStore`, `authStore` |
| `app/(authenticated)/json-document-builder/[[...document_id]]/page.tsx` | `jsonDocumentBuilderStore`, `jsonDocumentsStore` |
| `app/(authenticated)/profile/page.tsx` | `authStore` |
| `app/(authenticated)/sres/page.tsx` | `structuredResponseEndpointsStore`, `sreBuilderStore`, `modelsStore`, `stagesStore`, `authStore` |
| `app/(authenticated)/stages/components/StageAssignmentField.tsx` | `stagesStore` |
| `app/(authenticated)/stages/page.tsx` | `stagesStore`, `authStore`, `refreshDashboardCaches` |
| `app/(authenticated)/stages/[stage_id]/page.tsx` | `stagesStore`, `authStore`, `refreshDashboardCaches` |
| `app/(authenticated)/tools/page.tsx` | `toolsStore`, `toolBuilderStore`, `stagesStore`, `authStore` |
| `app/(authenticated)/usage/page.tsx` | `authStore` |
| `app/(public)/signin/components/ForgotPasswordModal.tsx` | `authStore` |
| `app/(public)/signin/page.tsx` | `authStore` |
| `app/(public)/signup/components/CreateOrganizationStep.tsx` | `signUpStore` |
| `app/(public)/signup/components/SuccessStep.tsx` | `authStore` |
| `app/(public)/signup/components/UserDetailsStep.tsx` | `signUpStore` |
| `app/(public)/signup/components/VerificationStep.tsx` | `signUpStore` |
| `app/(public)/signup/page.tsx` | `signUpStore` |

**`authStore`** is the most widely imported singleton: 16 unique page/component files.  
**`stagesStore`** appears in 7 files.  
**`agentsStore`** appears in 4 files.

---

## 8. Absent Infrastructure

The following infrastructure expected by Deliverable E **does not exist** today:

| Item | Status |
|---|---|
| `src/store/RootStore.ts` | Does not exist |
| `src/store/StoreContext.tsx` | Does not exist |
| `src/store/AuthFlowStore.ts` | Does not exist |
| `src/store/AuthFlowStoreContext.tsx` | Does not exist |
| `src/store/ParameterDefinitionsStore.ts` | Does not exist |
| Constructor dependency injection (any store) | Does not exist |
| React context for store access | Does not exist |
| `useStore()` hook | Does not exist |

---

## 9. Key Observations

1. **All 18 store classes are no-argument constructors.** No store accepts its dependencies via constructor parameters.

2. **Inter-store wiring is done entirely via module-level singleton imports.** The dependency graph is hard-coded into the import statements at the top of each file.

3. **`AuthStore.signOut()` is the global reset coordinator.** It manually enumerates and resets 14 stores by importing and calling their singleton `.reset()` methods directly. `createTeamStore`, `signUpStore`, and `modelsStore` are not reset on sign-out.

4. **`CreateTeamStore` reads `authStore.user` at field initialization time** (before `makeAutoObservable` is called), meaning instantiation order matters: `authStore` must be a fully initialized module before `CreateTeamStore`'s module is evaluated.

5. **Circular module-level imports exist** between `AuthStore` ↔ `ChatPageBuilderStore`, `AuthStore` ↔ `StructuredResponseEndpointBuilderStore`, and `AuthStore` ↔ `ToolBuilderStore`. These are tolerated by the JS module system because the singleton values are only read at call time, not at module parse time.

6. **`ModelsStore` has no `reset()` method** and is not included in the `AuthStore.signOut()` reset sequence.

7. **No React context or hooks** are used for store access anywhere in the codebase. All access is via direct named singleton imports.

8. **The `showAlert` callback pattern** is used by 17 of 18 stores (all except `SignUpStore`) as a post-instantiation injection point for the alert system.
