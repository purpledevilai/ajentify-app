---
date: 2026-05-11
topic: "Deliverable H: Builder Stores Singleton → Per-Page — current state audit"
repos_touched: [ajentify-app]
tags: [research, mobx, builder-stores, singleton, per-page, agent-builder, tool-builder]
status: complete
last_updated: 2026-05-11
---

# Deliverable H: Builder Stores — Singleton → Per-Page Instance
## Current State Audit (2026-05-11)

---

## 1. AgentBuilderStore

**File**: `src/store/AgentBuilderStore.ts`  
**Total lines**: 495

### Singleton export

```
src/store/AgentBuilderStore.ts:494
export const agentBuilderStore = new AgentBuilderStore();
```

### Constructor signature

```typescript
constructor() {
    makeAutoObservable(this, {
        promptArgs: computed,
    });
}
```

No arguments. Defined at line 115–119.

### Cross-store dependencies

| Imported symbol | Source file | Usage site |
|---|---|---|
| `agentsStore` | `./AgentsStore` | `setCurrentAgentWithId()` — calls `agentsStore.loadAgents()` then looks up the agent by ID (lines 205–222) |

`getTools` is imported from `@/api/tool/getTools` (a direct API call, not a store reference). No `toolsStore` or `modelsStore` dependency inside the store file itself; those are only used by the page component.

### Field classifications

**Form / entity state**
- `currentAgent: Agent` — the full agent object being edited (line 62–75)
- `hasUpdates: boolean` — dirty flag (line 76)

**Loading / action flags**
- `agentLoading: boolean` (line 77)
- `agentDeleteLoading: boolean` (line 78)
- `promptEngineerContextLoading: boolean` (line 82)
- `agentContextLoading: boolean` (line 85)

**UI state**
- `isNewAgent: boolean` (line 61)
- `showDeleteButton: boolean` (line 86)
- `showAgentId: boolean` (line 87)
- `agentTools: string[]` — static list of tool-category names for the sidebar nav (lines 89–99)
- `presentedAgentTool: string` — currently selected sidebar tab (line 100)
- `showPromptArgsInput: boolean` (line 102)
- `promptArgsInput: Record<string, string>` (line 103)

**Locally-fetched list cache**
- `tools: Tool[]` — custom tools attached to the current agent, fetched via `getTools()` directly (line 105)
- `isLoadingTools: boolean` (line 106)

**Transient context objects** (not persisted, deleted on leave)
- `promptEngineerContext: Context | undefined` (line 80)
- `agentContext: Context | undefined` (line 83)

### `showAlert` / `setShowAlert`

- Line 59: `showAlert: (params: ShowAlertParams) => void | undefined = () => undefined;`
- Line 153–155: `setShowAlert = (showAlert) => { this.showAlert = showAlert; }` — injected by the page component from `useAlert()` hook

`showAlert` is called in 8 places throughout the store (error paths in `createAgent`, `updateAgent`, `deleteAgent`, context creation/deletion, `setCurrentAgentWithId`, `loadAgentTools`).

### `reset()` method

Lines 121–151. Resets all fields to their initial values:
- `isNewAgent = false`
- `currentAgent` reset to blank agent object
- `hasUpdates = false`, `agentLoading = false`
- `promptEngineerContext = undefined`, `promptEngineerContextLoading = false`
- `agentContext = undefined`, `agentContextLoading = false`
- `showDeleteButton = false`, `agentDeleteLoading = false`, `showAgentId = false`
- `presentedAgentTool = 'memory'`
- `showPromptArgsInput = false`, `promptArgsInput = {}`
- `tools = []`, `isLoadingTools = false`

Note: `showAlert` is **not** reset — the injected function remains after cleanup.

---

## 2. ToolBuilderStore

**File**: `src/store/ToolBuilderStore.ts`  
**Total lines**: 570 (class ends line 568; singleton at line 570)

### Singleton export

```
src/store/ToolBuilderStore.ts:570
export const toolBuilderStore = new ToolBuilderStore();
```

### Constructor signature

```typescript
constructor() {
    makeAutoObservable(this);
}
```

No arguments. Lines 126–128.

### Cross-store dependencies

| Imported symbol | Source file | Usage site |
|---|---|---|
| `authStore` | `./AuthStore` | `initiateNew()` — reads `authStore.user?.organizations[0].id` (line 148) |
| `toolsStore` | `./ToolsStore` | `setToolWithId()` — calls `toolsStore.loadTools()` then looks up a tool by ID (lines 163–181) |

### `loadParameterDefinition()` method

Lines 183–198.

```typescript
loadParameterDefinition = async (pdId: string) => {
    try {
        this.isLoadingParameterDefinition = true;
        const parameterDefinition = await getParameterDefinition(pdId);   // line 186
        this.parameters = jsonSchemaToUiTree(parameterDefinition.schema);
        this.updateCode();
        this.updateTestInputs();
    } catch (error) { ... }
    finally { this.isLoadingParameterDefinition = false; }
}
```

- Fetch call: `getParameterDefinition(pdId)` at **line 186** — direct API import from `@/api/parameterdefinition/getParameterDefinition`.
- Called from `setTool()` (line 160) when `tool.pd_id` is present.
- No caching — fetches on every `setTool` invocation.

### List-cache duplication

`ToolBuilderStore` does **not** maintain its own list of all tools or models. It holds only the single `tool: Tool` currently being edited. It delegates list loading to `toolsStore` (external singleton) inside `setToolWithId`.

### `showAlert` / `setShowAlert`

- Line 115: `showAlert: (params: ShowAlertParams) => void | undefined = () => undefined;`
- Line 141–143: `setShowAlert` setter — injected by page.

Called in: `setToolWithId` (tool not found), `loadParameterDefinition` (error), `executeTestInput` (client-side guard, pass_context guard, error), `saveTool` (error), `deleteTool` (error).

### `reset()` method

Lines 130–139. Resets:
- `tool = defaultTool`
- `isLoadingParameterDefinition = false`
- `parameters = []`
- `testInputs = []`
- `toolSaving = false`, `toolDeleting = false`
- `functionDeclaration = 'def custom_function():'`
- `toolExecuting = false`

`showAlert` is **not** reset.

---

## 3. StructuredResponseEndpointBuilderStore

**File**: `src/store/StructuredResponseEndpointBuilderStore.ts`  
**Total lines**: 522 (class ends line 519; singleton at line 521)

### Singleton export

```
src/store/StructuredResponseEndpointBuilderStore.ts:521
export const sreBuilderStore = new StructuredResponseEndpointBuilderStore();
```

### Constructor signature

```typescript
constructor() {
    makeAutoObservable(this, {
        templateArgs: computed,
        isLegacySRE: computed,
        showVariableNamesUI: computed,
    });
    this.syncTemplateArgsInput();
}
```

No arguments. Lines 84–91. Notably calls `this.syncTemplateArgsInput()` immediately after MobX initialization.

### Cross-store dependencies

| Imported symbol | Source file | Usage site |
|---|---|---|
| `authStore` | `./AuthStore` | `initiateNew()` — reads `authStore.user?.organizations[0].id` (line 136) |
| `structuredResponseEndpointsStore` | `./StructuredResponseEndpointStore` | `setSREWithId()` — calls `structuredResponseEndpointsStore.loadSREs()` then finds SRE by ID (lines 166–185) |

### `loadParameterDefinition()` method

Lines 187–200.

```typescript
loadParameterDefinition = async (pdId: string) => {
    try {
        this.isLoadingParameterDefinition = true;
        const parameterDefinition = await getParameterDefinition(pdId);   // line 190
        this.parameters = jsonSchemaToUiTree(parameterDefinition.schema);
    } catch (error) { ... }
    finally { this.isLoadingParameterDefinition = false; }
}
```

- Fetch call: `getParameterDefinition(pdId)` at **line 190** — same API import as `ToolBuilderStore`.
- Called from `setSRE()` (line 161) whenever an SRE is loaded.
- No caching — fetches every time `setSRE` is called.
- Unlike `ToolBuilderStore`, does **not** call `updateCode()` or `updateTestInputs()` afterward (SREs have no code editor).

### List-cache duplication

No own list caches. Delegates to `structuredResponseEndpointsStore` in `setSREWithId`.

### `showAlert` / `setShowAlert`

- Line 44: `showAlert` field initialized to no-op.
- Line 128–130: `setShowAlert` setter.

Called in: `setSREWithId` (load failure, not found), `loadParameterDefinition` (error), `saveSRE` (error), `deleteSRE` (error), `runSRE` (error).

### `reset()` method

Lines 109–126. Resets:
- `isNewSme = false`, `useClickedSave = false`
- `sre = defaultSRE`, `parameters = []`
- All loading/saving/deleting flags to `false`
- `runResult = undefined`
- `hasUpdatedSRE = false`, `hasUpdatedParameterDefinition = false`
- `useVariableNames = false`
- `variableNamesInput = {}`, `templateArgsInput = {}`
- Calls `this.syncTemplateArgsInput()` at the end

`showAlert` is **not** reset.

---

## 4. JsonDocumentBuilderStore

**File**: `src/store/JsonDocumentBuilderStore.ts`  
**Total lines**: 135 (class ends line 132; singleton at line 134)

### Singleton export

```
src/store/JsonDocumentBuilderStore.ts:134
export const jsonDocumentBuilderStore = new JsonDocumentBuilderStore();
```

### Constructor signature

```typescript
constructor() {
    makeAutoObservable(this);
}
```

No arguments. Lines 23–25.

### Cross-store dependencies

None. `JsonDocumentBuilderStore` imports only API functions (`createJsonDocument`, `updateJsonDocument`, `deleteJsonDocument`). It does not reference any other store.

The page file (`json-document-builder/page.tsx`) imports `jsonDocumentsStore` separately and calls `jsonDocumentsStore.loadDocuments()` directly — this lookup logic lives in the page, not the store.

### Field classifications

**Form / entity state**
- `document: JsonDocument` — the document being edited (line 16)
- `dataString: string` — JSON editor text (line 17)
- `dataError: string | null` — JSON parse error (line 18)
- `isNewDocument: boolean` (line 19)

**Loading / action flags**
- `saving: boolean` (line 20)
- `deleting: boolean` (line 21)

### `showAlert` / `setShowAlert`

- Line 15: `showAlert` field initialized to no-op.
- Line 36–38: `setShowAlert` setter.

Called in: `createDocument` (error), `updateDocument` (error), `deleteDocument` (error).

### `reset()` method

Lines 27–34. Resets:
- `document = { ...defaultDocument }`
- `dataString = '{}'`
- `dataError = null`
- `isNewDocument = false`
- `saving = false`, `deleting = false`

`showAlert` is **not** reset.

---

## 5. ChatPageBuilderStore (deprecated)

**File**: `src/store/ChatPageBuilderStore.ts`  
**Total lines**: 162

### Singleton export

```
src/store/ChatPageBuilderStore.ts:162
export const chatPageBuilderStore = new ChatPageBuilderStore();
```

### Deprecated status

There is **no `@deprecated` JSDoc annotation** or any comment marking this file as deprecated in the store source itself. However, the Chat Page Builder feature is considered legacy based on the product direction (Chat Pages are an older feature). The builder still functions and the page at `chat-page-builder/[[...chat_page_id]]/page.tsx` is fully active.

### Cross-store dependencies

| Imported symbol | Source file |
|---|---|
| `authStore` | `./AuthStore` |
| `agentsStore` | `./AgentsStore` |
| `chatPagesStore` | `./ChatPagesStore` |

### Constructor

```typescript
constructor() {
    this.chatPage = defaultChatPage;
    makeAutoObservable(this);
}
```

No arguments. Lines 48–51. Note: `chatPage` is assigned before `makeAutoObservable`, which differs from the other builders where fields are declared as class properties.

### `reset()` method

Lines 53–55 — minimal reset, only resets `chatPage`:
```typescript
reset = () => {
    this.chatPage = defaultChatPage;
}
```

Does not reset `chatPageSaving`, `chatPageDeleting`, `chatBoxMode`, or `showAlert`.

---

## 6. Builder Page Usage

### Pattern common to all builder pages

Every builder page:
1. Imports the singleton directly: `import { xyzBuilderStore } from "@/store/XyzBuilderStore"`.
2. In `useEffect([], [])`, calls `store.setShowAlert(showAlert)` then a `loadXxxId()` function.
3. In the `useEffect` cleanup (`return () =>`), calls `store.reset()`.
4. Uses the singleton as a module-level reference throughout the JSX — no React context, no hook.

### agent-builder page

**File**: `src/app/(authenticated)/agent-builder/[[...agent_id]]/page.tsx`  
**Lines**: 672

- Import: `import { agentBuilderStore } from "@/store/AgentBuilderStore";` (line 15)
- `reset()` called at line 64 inside `useEffect` cleanup.
- `setShowAlert` called at line 69.
- Also imports `toolsStore` (for init tool dropdown) and `modelsStore` (for Anthropic guard) but these are separate singletons used inline in JSX.
- Uses `useNavigationGuard` to intercept nav events; on leave, conditionally calls `agentBuilderStore.deleteAgent()` and/or context deletion methods.

### tool-builder page

**File**: `src/app/(authenticated)/tool-builder/[[...tool_id]]/page.tsx`  
**Lines**: 331

- Import: `import { toolBuilderStore } from "@/store/ToolBuilderStore";` (line 13)
- `reset()` called at line 39 inside `useEffect` cleanup.
- `setShowAlert` called at line 44.
- No navigation guard.

### sre-builder page

**File**: `src/app/(authenticated)/sre-builder/[[...sre_id]]/page.tsx`  
**Lines**: 407

- Import: `import { sreBuilderStore } from "@/store/StructuredResponseEndpointBuilderStore";` (line 14)
- `reset()` called at line 41 inside `useEffect` cleanup.
- `setShowAlert` called at line 80.
- Uses `useNavigationGuard`; checks `hasUpdatedParameterDefinition || hasUpdatedSRE` and `isNewSme && !useClickedSave` for unsaved-changes guard.
- One quirk: `sreBuilderStore.useClickedSave = true` is assigned directly at line 97 (outside the store's own setter).

### json-document-builder page

**File**: `src/app/(authenticated)/json-document-builder/[[...document_id]]/page.tsx`  
**Lines**: 180

- Import: `import { jsonDocumentBuilderStore } from "@/store/JsonDocumentBuilderStore";` (line 6)
- `reset()` called at line 39 inside `useEffect` cleanup.
- `setShowAlert` called at line 36.
- Document lookup lives in the page: `jsonDocumentsStore.loadDocuments()` then `find()` by ID (lines 50–60), then `jsonDocumentBuilderStore.setDocument(doc)`.
- No navigation guard.

### chat-page-builder page

**File**: `src/app/(authenticated)/chat-page-builder/[[...chat_page_id]]/page.tsx`  
**Lines**: 282

- Import: `import { chatPageBuilderStore } from "@/store/ChatPageBuilderStore";` (line 29)
- **No `reset()` call anywhere** — neither in a cleanup nor at mount.
- `useEffect` has **no dependency array** (line 52: `useEffect(() => { ... })`), meaning `setAlertOnStore` and `loadChatPageId` re-run on every render.
- No navigation guard.

---

## 7. `useXxxBuilder` Hooks

No hook files exist in `/workspace/src/store/` matching `use*Builder*`. The full list of `.ts` files in that directory:

```
AgentBuilderStore.ts
ToolBuilderStore.ts
StructuredResponseEndpointBuilderStore.ts
JsonDocumentBuilderStore.ts
ChatPageBuilderStore.ts
AgentsStore.ts
ToolsStore.ts
StructuredResponseEndpointStore.ts
JsonDocumentsStore.ts
ChatPagesStore.ts
ChatPageStore.ts
ModelsStore.ts
IntegrationsStore.ts
StagesStore.ts
AuthStore.ts
ContextsStore.ts
CreateTeamStore.ts
SignUpStore.ts
refreshDashboardCaches.ts
```

No `useAgentBuilder`, `useToolBuilder`, `useSREBuilder`, or `useJsonDocumentBuilder` hooks exist anywhere in the store directory.

---

## 8. `useState(() => new …)` Per-Page Instance Pattern

A search for `useState\(\s*\(\)\s*=>\s*new` across all `.tsx` files under `src/app/(authenticated)/` found **zero matches**. No builder page uses the per-page instance pattern. Every builder page consumes the module-level singleton directly.

---

## 9. Parameter Definition Fetch — Exact Call Sites

| Store | Method | File:Line | API function |
|---|---|---|---|
| `ToolBuilderStore` | `loadParameterDefinition` | `src/store/ToolBuilderStore.ts:186` | `getParameterDefinition(pdId)` |
| `StructuredResponseEndpointBuilderStore` | `loadParameterDefinition` | `src/store/StructuredResponseEndpointBuilderStore.ts:190` | `getParameterDefinition(pdId)` |

Both stores import from the same module: `@/api/parameterdefinition/getParameterDefinition`.

Both call the method from their `setTool` / `setSRE` entry points:
- `ToolBuilderStore.setTool()` line 160: `this.loadParameterDefinition(tool.pd_id)`
- `StructuredResponseEndpointBuilderStore.setSRE()` line 161: `this.loadParameterDefinition(sre.pd_id)`

---

## 10. Summary Table

| Store | Lines | Singleton var | Cross-store deps | Has `reset()` | `showAlert` injected | Per-page hook |
|---|---|---|---|---|---|---|
| `AgentBuilderStore` | 495 | `agentBuilderStore` (line 494) | `agentsStore` | Yes (line 121) | Yes (line 153) | No |
| `ToolBuilderStore` | 570 | `toolBuilderStore` (line 570) | `authStore`, `toolsStore` | Yes (line 130) | Yes (line 141) | No |
| `StructuredResponseEndpointBuilderStore` | 522 | `sreBuilderStore` (line 521) | `authStore`, `structuredResponseEndpointsStore` | Yes (line 109) | Yes (line 128) | No |
| `JsonDocumentBuilderStore` | 135 | `jsonDocumentBuilderStore` (line 134) | None | Yes (line 27) | Yes (line 36) | No |
| `ChatPageBuilderStore` | 162 | `chatPageBuilderStore` (line 162) | `authStore`, `agentsStore`, `chatPagesStore` | Yes, partial (line 53) | Yes (line 57) | No |

### Notable anomalies vs. a clean per-page design

1. **`ChatPageBuilderStore.reset()`** is never called by its page; the `useEffect` has no dependency array, causing repeated re-runs.
2. **`agentBuilderStore`** caches `tools: Tool[]` locally (fetched via direct API call, not via `toolsStore`) — this list is per-agent-context, not a global cache, but it lives on the singleton.
3. **`showAlert` is never reset** in any store's `reset()` — the injected function reference persists across mounts if the component ever re-mounts without a new injection.
4. **`sreBuilderStore.useClickedSave`** is mutated directly by the page at `sre-builder/page.tsx:97` rather than going through the `setUserClickedSave` setter.
5. **No `useXxxBuilder` hook exists** anywhere — the React binding between page and store is done entirely with module imports and `useEffect`.
