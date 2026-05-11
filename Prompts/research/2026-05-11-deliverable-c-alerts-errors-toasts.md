---
date: 2026-05-11
topic: "Deliverable C: Alerts → Errors/Toasts — current state audit"
repos_touched: [ajentify-app]
tags: [research, alerts, error-handling, toasts, stores, showAlert]
status: complete
last_updated: 2026-05-11
---

# Deliverable C – Current State Audit: Alerts, Errors, and Toasts

## 1. AlertProvider and Alert Components

### `src/app/components/AlertProvider.tsx`

**Exported types / interface**

```
ShowAlertParams {
    title:    string
    message:  string
    actions?: AlertAction[]     // default: [{ label: 'Ok', onClick: undefined }]
    onClose?: () => void        // called before the alert unmounts
}

AlertContextType {
    showAlert: (params: ShowAlertParams) => void
}
```

**How it works (lines 17–50)**

- `AlertProvider` wraps children in `<AlertContext.Provider>`.
- Internal state is a single `alert | null` held in React `useState`.
- `showAlert` (line 26) sets that state; it **always supplies a default `actions` array** if none is passed.
- `handleClose` (line 30) fires the optional `onClose` callback, then clears state.
- When `alert !== null` the custom `<Alert>` component is rendered **above** `{children}` (fixed overlay).

**`useAlert` hook (lines 52–58)**

Exported from `AlertProvider.tsx`. Returns `{ showAlert }` from context.  
Throws if called outside the provider:  
`'useAlert must be used within an AlertProvider'`

---

### `src/app/components/Alert.tsx`

**Props**

```
AlertAction {
    label:    string
    onClick?: () => void
}

AlertProps {
    title:    string
    message:  string
    actions?: AlertAction[]     // default: [{ label: 'Ok', onClick: undefined }]
    onClose:  () => void
}
```

**Render (lines 58–102)**

- Full-screen fixed overlay `Flex` (`zIndex: 10000`). Dark semi-transparent backdrop.
- Centered white/dark `Box` (max-width 400 px, borderRadius md).
- `VStack`: `Heading` (title) → `Text` (message) → `Flex` with action `Button`s.
- Dismisses on **Escape key** (useEffect, line 31) or **background click** (`data-overlay` attribute check, line 43).
- Each action button: calls `action.onClick()` if provided, then always calls `onClose()` (line 51).

---

## 2. `setShowAlert` / `showAlert` in MobX Stores

All stores import `ShowAlertParams` from `@/app/components/AlertProvider`.  
The common pattern:

```
showAlert: (params: ShowAlertParams) => void | undefined = () => undefined;
setShowAlert = (showAlert: ...) => { this.showAlert = showAlert; }
```

Pages inject the live `showAlert` function from `useAlert()` into each store via `setShowAlert`.

### 2.1 `ContextsStore` — `src/store/ContextsStore.ts`

| Line | Field / Method |
|------|---------------|
| 63 | `showAlert: (params: ShowAlertParams) => void = () => undefined` |
| 69–71 | `setShowAlert` setter |
| 118–121 | `loadContexts` catch → `title: 'Failed to load contexts'`, `message: error.message \|\| 'Unknown error'` |
| 142–145 | `loadMore` catch → `title: 'Failed to load more contexts'`, `message: error.message \|\| 'Unknown error'` |

---

### 2.2 `CreateTeamStore` — `src/store/CreateTeamStore.ts`

| Line | Field / Method |
|------|---------------|
| 53 | `showAlert: (params: ShowAlertParams) => void \| undefined = () => undefined` |
| 74–76 | `setShowAlert` setter |
| 135–138 | `getLinkData` catch → `title: 'Error Getting Link Data'`, `message: 'An error occurred while getting link data...'` |
| 160–163 | `submitCreateTeam` catch → `title: 'Error Creating Team'`, `message: 'An error occurred while creating the team...'` |
| 178–189 | `pollJobStatus` job.status==='error' → `title: 'Error Creating Team'`, `message: job.message`, custom actions array (Go back and try again → `this.stepBack()`) |
| 198–201 | `pollJobStatus` catch → `title: 'Error Polling Job Status'`, `message: 'An error occurred...'` |

---

### 2.3 `StructuredResponseEndpointsStore` — `src/store/StructuredResponseEndpointStore.ts`

| Line | Field / Method |
|------|---------------|
| 7 | `showAlert: ... = () => undefined` |
| 15–17 | `setShowAlert` setter |
| 28–31 | `loadSREs` catch → `title: 'Whoops'`, `message: error.message` |

---

### 2.4 `ToolBuilderStore` — `src/store/ToolBuilderStore.ts`

| Line | Field / Method |
|------|---------------|
| 115 | `showAlert: ... = () => undefined` |
| 141–143 | `setShowAlert` setter |
| 166–169 | `setToolWithId` – tools not loaded → `title: 'Whoops'`, `message: 'There was a problem loading the tools'` |
| 174–177 | `setToolWithId` – tool not found → `title: 'Whoops'`, `message: 'Could not find chat page'` _(note: copy-paste label mismatch)_ |
| 191–194 | `loadParameterDefinition` catch → `title: 'Whoops'`, `message: error.message` |
| 383–386 | `executeTestInput` – client-side tool → `title: 'Whoops'`, `message: 'Testing is not available for client-side tools.'` |
| 390–393 | `executeTestInput` – pass_context enabled → `title: 'Whoops'`, `message: 'Testing is disabled when pass context is enabled.'` |
| 411–414 | `executeTestInput` success → `title: 'Test Results'`, `message: result` (actual tool output) |
| 416–419 | `executeTestInput` catch → `title: 'Whoops'`, `message: error.message` |
| 542–545 | `saveTool` catch → `title: 'Whoops'`, `message: error.message` |
| 558–561 | `deleteTool` catch → `title: 'Whoops'`, `message: error.message` |

---

### 2.5 `ChatPagesStore` — `src/store/ChatPagesStore.ts`

| Line | Field / Method |
|------|---------------|
| 10 | `showAlert: ... = () => undefined` |
| 20–22 | `setShowAlert` setter |
| 34–37 | `loadChatPages` catch → `title: 'Failed to Load Chat Pages'`, `message: error.message \|\| 'An unknown error occurred...'` |

Also calls `console.error('Failed to load chat pages', error)` (line 33) before the `showAlert`.

---

### 2.6 `StructuredResponseEndpointBuilderStore` — `src/store/StructuredResponseEndpointBuilderStore.ts`

| Line | Field / Method |
|------|---------------|
| 44 | `showAlert: ... = () => undefined` |
| 128–130 | `setShowAlert` setter |
| 170–173 | `setSREWithId` – SREs not loaded → `title: 'Whoops'`, `message: 'There was a problem loading the SREs'` |
| 178–181 | `setSREWithId` – SRE not found → `title: 'Whoops'`, `message: 'Could not find sre'` |
| 193–196 | `loadParameterDefinition` catch → `title: 'Whoops'`, `message: error.message` |
| 458–461 | `saveSRE` catch → `title: 'Whoops'`, `message: error.message` |
| 480–483 | `deleteSRE` catch → `title: 'Whoops'`, `message: error.message` |
| 507–510 | `runSRE` catch → `title: 'Whoops'`, `message: error.message` |

---

### 2.7 `IntegrationsStore` — `src/store/IntegrationsStore.ts`

| Line | Field / Method |
|------|---------------|
| 8 | `showAlert: ... = () => undefined` |
| 17–19 | `setShowAlert` setter |
| 30–33 | `loadIntegrations` catch → `title: 'Whoops'`, `message: error.message` |
| 45–48 | `deleteIntegration` catch → `title: 'Whoops'`, `message: error.message` |

---

### 2.8 `AgentsStore` — `src/store/AgentsStore.ts`

| Line | Field / Method |
|------|---------------|
| 7 | `showAlert: ... = () => undefined` |
| 15–17 | `setShowAlert` setter |
| 28–31 | `loadAgents` catch → `title: 'Whoops'`, `message: error.message` |

---

### 2.9 `ChatPageBuilderStore` — `src/store/ChatPageBuilderStore.ts`

| Line | Field / Method |
|------|---------------|
| 34 | `showAlert: ... = () => undefined` |
| 57–59 | `setShowAlert` setter |
| 76–79 | `setChatPageWithId` – chat pages not loaded → `title: 'Whoops'`, `message: 'There was a problem loading the chat pages'` |
| 84–87 | `setChatPageWithId` – page not found → `title: 'Whoops'`, `message: 'Could not find chat page'` |
| 134–137 | `saveChatPage` catch → `title: 'Whoops'`, `message: error.message` |
| 150–153 | `deleteChatPage` catch → `title: 'Whoops'`, `message: error.message` |

---

### 2.10 `StagesStore` — `src/store/StagesStore.ts`

| Line | Field / Method |
|------|---------------|
| 10 | `showAlert: ... = () => undefined` |
| 18–20 | `setShowAlert` setter |
| 39–42 | `loadStages` catch → `title: 'Whoops'`, `message: error.message` |
| 54–57 | `createStage` catch → `title: 'Whoops'`, `message: error.message` |
| 70–73 | `updateStage` catch → `title: 'Whoops'`, `message: error.message` |
| 86–89 | `deleteStage` catch → `title: 'Whoops'`, `message: error.message` |

---

### 2.11 `JsonDocumentsStore` — `src/store/JsonDocumentsStore.ts`

| Line | Field / Method |
|------|---------------|
| 7 | `showAlert: ... = () => undefined` |
| 15–17 | `setShowAlert` setter |
| 28–31 | `loadDocuments` catch → `title: 'Whoops'`, `message: error.message` |

---

### 2.12 `AgentBuilderStore` — `src/store/AgentBuilderStore.ts`

| Line | Field / Method |
|------|---------------|
| 59 | `showAlert: ... = () => undefined` |
| 153–155 | `setShowAlert` setter |
| 183–186 | `loadAgentTools` catch → `title: 'Error'`, `message: error.message` |
| 207–210 | `setCurrentAgentWithId` – agents not loaded → `title: 'Whoops'`, `message: 'There was a problem loading the agents'` |
| 215–218 | `setCurrentAgentWithId` – agent not found → `title: 'Whoops'`, `message: 'Could not find agent'` |
| 277–280 | `createAgent` – agent_id already set → `title: 'Error'`, `message: 'Agent already exists...'` |
| 301–304 | `createAgent` catch → `title: 'Error'`, `message: error.message` |
| 312–315 | `updateAgent` – no agent_id → `title: 'Error'`, `message: 'Agent does not exist...'` |
| 339–342 | `updateAgent` catch → `title: 'Error'`, `message: error.message` |
| 350–353 | `deleteAgent` – no agent_id → `title: 'Error'`, `message: 'Agent does not exist...'` |
| 360–363 | `deleteAgent` catch → `title: 'Error'`, `message: error.message` |
| 375–378 | `deletePromptEngineerContext` catch → `title: 'Error'`, `message: error.message` |
| 389–392 | `deleteAgentContext` catch → `title: 'Error'`, `message: error.message` |
| 453–456 | `createPromptEngineerContext` catch → `title: 'Error'`, `message: error.message` |
| 471–474 | `createAgentContext` catch → `title: 'Error'`, `message: error.message` |

---

### 2.13 `ChatPageStore` — `src/store/ChatPageStore.ts`

| Line | Field / Method |
|------|---------------|
| 22 | `showAlert: ... = () => undefined` |
| 39–41 | `setShowAlert` setter (non-arrow method syntax) |
| 43–47 | Helper `showAlertMessage(title, message)` → calls `this.showAlert({ title, message })` |
| 74 | `loadAgents` catch → via `showAlertMessage('Failed to load agents', error.message)` |
| 99 | `loadContextHistory` outer catch → via `showAlertMessage('Failed to load context history', error.message)` |
| 110 | `loadAndSetCurrentContext` catch → via `showAlertMessage('Failed to load context', error.message)` |
| 129 | `startNewConversation` catch → via `showAlertMessage('Failed to start new conversation', error.message)` |
| 151 | `deleteContext` catch → via `showAlertMessage('Failed to delete conversation', error.message)` |

Note: `loadContextHistory` has an **inner** try/catch (lines 86–92) for `getContextHistory()` that silently swallows the error (`console.log`) and sets `this.contextHistory = []` — it does **not** call `showAlert` for that inner failure.

---

### 2.14 `JsonDocumentBuilderStore` — `src/store/JsonDocumentBuilderStore.ts`

| Line | Field / Method |
|------|---------------|
| 15 | `showAlert: ... = () => undefined` |
| 36–38 | `setShowAlert` setter |
| 80–83 | `createDocument` catch → `title: 'Error'`, `message: error.message` |
| 101–104 | `updateDocument` catch → `title: 'Error'`, `message: error.message` |
| 115–118 | `deleteDocument` catch → `title: 'Error'`, `message: error.message` |

Also has `dataError: string | null = null` (line 18) – a **local parse error field** for JSON validation, rendered in-UI (not via showAlert).

---

### 2.15 `ToolsStore` — `src/store/ToolsStore.ts`

| Line | Field / Method |
|------|---------------|
| 7 | `showAlert: ... = () => undefined` |
| 15–17 | `setShowAlert` setter |
| 28–31 | `loadTools` catch → `title: 'Whoops'`, `message: error.message` |

---

### 2.16 `SignUpStore` — `src/store/SignUpStore.ts`

SignUpStore does **not** use the `AlertProvider` / `ShowAlertParams` pattern. It has its own **internal alert state**:

| Line | Field |
|------|-------|
| 35 | `showAlertFlag = false` (observable boolean) |
| 36 | `alertTitle = ''` |
| 37 | `alertMessage = ''` |
| 38 | `alertActions: { label: string; handler?: () => void }[] = []` |

| Line | Method |
|------|--------|
| 66–71 | `showAlert(title, message, actions)` — sets the four fields, sets `showAlertFlag = true` |
| 73–78 | `clearAlert()` — resets all four fields and sets `showAlertFlag = false` |
| 82 | `submitSignUp` validation → `showAlert('Passwords Do Not Match', 'Please ensure the passwords match', [{label:'Ok'}])` |
| 96 | `submitSignUp` catch → `showAlert('Sign Up Failed', error.message, [{label:'Ok'}])` |
| 124 | `confirmSignInCode` catch → `showAlert('Verification Failed', error.message, [{label:'Ok'}])` |
| 139 | `createOrganization` catch → `showAlert('Organization Creation Failed', error.message, [{label:'Ok'}])` |

The sign-up page reads these observables directly and renders its own alert UI (separate from `AlertProvider`).

---

### 2.17 `AuthStore` — `src/store/AuthStore.ts`

AuthStore uses **inline error string observables** (no `showAlert` at all):

| Line | Field |
|------|-------|
| 31 | `signInError = ''` |
| 40 | `forgotPasswordError = ''` |

| Line | Action | Error handling |
|------|--------|---------------|
| 84–97 | `submitSignIn` | Sets `this.signInError = error.message \|\| 'Failed to sign in...'` on catch |
| 135–147 | `submitForgotPassword` | Sets `this.forgotPasswordError = error.message \|\| 'Failed to send reset code.'` on catch |
| 149–165 | `submitResetPassword` | Sets `this.forgotPasswordError = error.message \|\| 'Failed to reset password.'` on catch |
| 99–121 | `signOut` | `console.error` on catch only |
| 123–133 | `loadUser` | `console.error` on catch only |
| 174–192 | `updateUserDetails` | `console.error` + `throw error` (caller handles) |
| 194–206 | `deleteAccount` | `console.error` + `throw error` (caller handles) |

---

### 2.18 `ModelsStore` — `src/store/ModelsStore.ts`

ModelsStore has **no `showAlert` field and no `setShowAlert` method**.

| Line | Method | Error handling |
|------|--------|---------------|
| 14–25 | `loadModels` | `console.error('Failed to load models:', error)` only — no observable error field, no alert |

Fields: `models: Model[] = []`, `isLoading = false`, `hasLoaded = false`. No error field.

---

## 3. Page-Level `setShowAlert` Call Sites

### Pattern Summary

Most pages call `setShowAlert` inside a `useEffect` to inject the React-world `showAlert` function into the singleton MobX store. Several patterns exist:

- **No dependency array** (`useEffect(() => {...})`) — runs on every render.
- **Empty dependency array** (`useEffect(() => {...}, [])`) — runs once on mount.
- **With deps** (`useEffect(() => {...}, [router])`) — runs when dep changes.
- **Called directly in render body** (outside useEffect) — runs on every render.

---

| Page file | Line(s) | Store(s) | useEffect? | Deps |
|-----------|---------|---------|-----------|------|
| `(authenticated)/chat/page.tsx` | 50 | `chatPageStore` | Yes (inside `setAlertOnStore` called from effect at line 45–47) | none (no dep array — runs every render) |
| `(authenticated)/tools/page.tsx` | 286–287 | `toolsStore`, `stagesStore` | Yes | `[]` (mount only) |
| `(authenticated)/stages/[stage_id]/page.tsx` | 121 | `stagesStore` | Yes | `[]` (mount only; effect also has `authStore.signedIn` guard) |
| `(authenticated)/stages/page.tsx` | 158 | `stagesStore` | Yes | none (no dep array — runs every render) |
| `(authenticated)/chat-page-builder/[[...chat_page_id]]/page.tsx` | 55 | `chatPageBuilderStore` | Yes (inside `setAlertOnStore` called from effect at lines 49–52) | none (no dep array — runs every render) |
| `(authenticated)/chat-pages/page.tsx` | 33 | `chatPagesStore` | Yes (inside `setAlertOnStore` called from effect at lines 26–30) | none (no dep array — runs every render) |
| `(authenticated)/json-document-builder/[[...document_id]]/page.tsx` | 36 | `jsonDocumentBuilderStore` | Yes | `[]` (mount only) |
| `(authenticated)/agents/page.tsx` | 338–339 | `agentsStore`, `stagesStore` | Yes | none (no dep array — runs every render) |
| `(authenticated)/tool-builder/[[...tool_id]]/page.tsx` | 44 | `toolBuilderStore` | Yes (inside `setShowAlertOnStore` called from effect at lines 34–41) | `[]` (mount only) |
| `(authenticated)/agent-builder/[[...agent_id]]/page.tsx` | 69 | `agentBuilderStore` | Yes (inside `setShowAlertOnStore` called from effect at lines 58–66) | `[]` (mount only) |
| `(authenticated)/sres/page.tsx` | 348–349 | `structuredResponseEndpointsStore`, `stagesStore` | Yes | none (no dep array — runs every render) |
| `(authenticated)/sre-builder/[[...sre_id]]/page.tsx` | 80 | `sreBuilderStore` | Yes (inside `setShowAlertOnStore` called from effect at lines 36–43) | `[]` (mount only) |
| `(authenticated)/create-team/page.tsx` | 16 | `createTeamStore` | **No — called directly in render body** (line 16) | N/A |
| `(authenticated)/contexts/page.tsx` | 75, 77 | `agentsStore`, `contextsStore` | Yes | `[router]` — also uses `showAlertRef` pattern to avoid stale closure |
| `(authenticated)/integrations/page.tsx` | 80 | `integrationsStore` | Yes (inside `setShowAlertOnStore` called from effect at lines 73–77) | none (no dep array — runs every render) |
| `(authenticated)/documents/page.tsx` | 274–275 | `jsonDocumentsStore`, `stagesStore` | Yes | `[]` (mount only) |

**Note on `sre-builder`:** This page also calls `showAlert` directly (not via a store) at line 65–72, inside a second `useEffect` with deps `[navGuard, showAlert]`. This is the "unsaved changes" navigation guard that pops the custom alert dialog when the user tries to leave with pending edits.

---

## 4. `useAlert` Hook — Definition and Import Map

**Defined at:** `src/app/components/AlertProvider.tsx` lines 52–58.

**All files that import `useAlert`:**

| File | Import line | Usage line(s) |
|------|------------|--------------|
| `src/app/(authenticated)/chat/page.tsx` | 6 | 37 |
| `src/app/(authenticated)/tools/page.tsx` | 45 | 278 |
| `src/app/components/chatbox/ChatBox.tsx` | 10 | 65 |
| `src/app/(authenticated)/stages/[stage_id]/page.tsx` | 46 | 98, 780 |
| `src/app/(authenticated)/stages/page.tsx` | 41 | 72, 146 |
| `src/app/(authenticated)/chat-page-builder/[[...chat_page_id]]/page.tsx` | 33 | 46 |
| `src/app/(authenticated)/chat-pages/page.tsx` | 19 | 24 |
| `src/app/(authenticated)/json-document-builder/[[...document_id]]/page.tsx` | 22 | 33 |
| `src/app/(authenticated)/agents/page.tsx` | 50 | 144, 330 |
| `src/app/(authenticated)/profile/page.tsx` | 22 | 28 |
| `src/app/(authenticated)/tool-builder/[[...tool_id]]/page.tsx` | 11 | 31 |
| `src/app/(authenticated)/sre-builder/[[...sre_id]]/page.tsx` | 12 | 33 |
| `src/app/(authenticated)/agent-builder/[[...agent_id]]/page.tsx` | 18 | 54 |
| `src/app/(authenticated)/api-keys/page.tsx` | 39 | 50 |
| `src/app/(authenticated)/sres/page.tsx` | 47 | 149, 340 |
| `src/app/(authenticated)/create-team/components/SelectMembersStep.tsx` | 6 | 12 |
| `src/app/(authenticated)/create-team/components/BusinessInformationStep.tsx` | 6 | 10 |
| `src/app/(authenticated)/create-team/page.tsx` | 7 | 15 |
| `src/app/(authenticated)/contexts/page.tsx` | 32 | 51 |
| `src/app/(authenticated)/documents/page.tsx` | 44 | 139, 266 |
| `src/app/(authenticated)/integrations/page.tsx` | 37 | 65 |

Total: **21 files** import `useAlert` (including `AlertProvider.tsx` itself where it is defined).

`ChatBox.tsx` (`src/app/components/chatbox/ChatBox.tsx`) is the only **non-page** component (other than the provider itself) that imports `useAlert`.

---

## 5. `useToast` Usage

Chakra's `useToast` is used in **exactly 2 files**:

### `src/app/(authenticated)/agent-builder/[[...agent_id]]/components/MemoryTools.tsx`

| Line | Content |
|------|---------|
| 3 | `import { ..., useToast } from "@chakra-ui/react"` |
| 16 | `const toast = useToast()` |
| 43–49 | `toast({ title:'Error', description:'Failed to load memory documents', status:'error', duration:3000, isClosable:true })` in `loadDocuments` catch |
| 57–63 | `toast({ title:'Error', description:'Please enter a document name', status:'error', duration:3000, isClosable:true })` in validation guard |
| 76–82 | `toast({ title:'Success', description:'Memory document created successfully', status:'success', duration:3000, isClosable:true })` on successful create |
| 85–91 | `toast({ title:'Error', description:'Failed to create memory document', status:'error', duration:3000, isClosable:true })` in `createNewDocument` catch |

### `src/app/(authenticated)/agent-builder/[[...agent_id]]/page.tsx`

| Line | Content |
|------|---------|
| 10 | `import { ..., useToast }` |
| 55 | `const toast = useToast()` |
| 149–155 | `toast({ title:'Saved', status:'success', duration:3000, isClosable:true, position:'top' })` — fires after a successful `onSaveAgent` call |

**Summary:** `useToast` is only used in the agent-builder subtree. All other error feedback uses the custom `AlertProvider` / `useAlert` mechanism.

---

## 6. Chakra `AlertDialog` Usage

Six files in `(authenticated)/` already use Chakra's `AlertDialog` family of components (destructive-action confirmation dialogs):

| File | Lines (import) | Lines (render) | Purpose |
|------|---------------|----------------|---------|
| `(authenticated)/tools/page.tsx` | 37–42 | 504–536 | Confirm delete tool |
| `(authenticated)/stages/components/DeleteStageDialog.tsx` | 5–10 | 59–153 | Confirm delete stage (supports cascade/detach/abort modes) |
| `(authenticated)/agents/page.tsx` | 42–47 | 556–588 | Confirm delete agent |
| `(authenticated)/sres/page.tsx` | 39–44 | 584–616 | Confirm delete SRE |
| `(authenticated)/integrations/page.tsx` | 21–26 | 405–436 | Confirm delete integration |
| `(authenticated)/documents/page.tsx` | 36–41 | 485–517 | Confirm delete JSON document |

All six use the Chakra `AlertDialog` with `cancelRef` / `useDisclosure` / `useRef` pattern.  
None of the chat-page-builder, tool-builder, sre-builder, or agent-builder **builder** pages use `AlertDialog` for confirmations — they rely on the custom `Alert` overlay.

---

## 7. Existing `xxxError` Observable Fields in Stores

### Stores with dedicated error observable fields

| Store | Field | Type | How set |
|-------|-------|------|---------|
| `AuthStore` | `signInError` | `string` (line 31) | `submitSignIn` catch sets `this.signInError = error.message` |
| `AuthStore` | `forgotPasswordError` | `string` (line 40) | `submitForgotPassword` and `submitResetPassword` catch |
| `JsonDocumentBuilderStore` | `dataError` | `string \| null` (line 18) | Set inline in `setDataString` when `JSON.parse` throws — not an API error |

### Stores that rely entirely on `showAlert` (no error fields)

Every other store (ContextsStore, CreateTeamStore, StructuredResponseEndpointsStore, ToolBuilderStore, ChatPagesStore, StructuredResponseEndpointBuilderStore, IntegrationsStore, AgentsStore, ChatPageBuilderStore, StagesStore, JsonDocumentsStore, AgentBuilderStore, ChatPageStore, ToolsStore) handles errors solely by calling `this.showAlert(...)` — they have **no observable error string field** that the UI can bind to independently.

`ModelsStore` is the outlier: it calls `console.error` and does **neither** — no `showAlert`, no error field.

`SignUpStore` has its own bespoke error state (`showAlertFlag`, `alertTitle`, `alertMessage`, `alertActions`) that is not backed by `AlertProvider`.

---

## 8. `ModelsStore` Error Handling (Detail)

File: `src/store/ModelsStore.ts`

- **No `showAlert` field.** Not imported from `AlertProvider`.
- **No `setShowAlert` method.**
- **No error observable field.**
- `loadModels` (lines 14–25): sole error path is `console.error("Failed to load models:", error)`. The `models` array stays at its previous value (empty on first load), and `hasLoaded` is only set inside the try block so it remains `false` on failure — meaning a subsequent call without `force=true` would retry.
- `isLoading` is always reset to `false` in `finally`.

---

## 9. `SignUpStore` Internal Alert Mechanism (Detail)

File: `src/store/SignUpStore.ts`

**Observable fields (lines 35–38):**

```
showAlertFlag = false          // boolean — drives conditional render in page
alertTitle    = ''             // string
alertMessage  = ''             // string
alertActions: { label: string; handler?: () => void }[] = []
```

**Internal method (not part of AlertProvider):**

```typescript
// line 66–71
showAlert(title: string, message: string, actions: { label: string; handler?: () => void }[]) {
    this.alertTitle   = title;
    this.alertMessage = message;
    this.alertActions = actions;
    this.showAlertFlag = true;
}

// line 73–78
clearAlert() {
    this.showAlertFlag = false;
    this.alertTitle   = '';
    this.alertMessage = '';
    this.alertActions = [];
}
```

Note: `alertActions` uses `handler?: () => void` (not `onClick`), unlike `AlertAction` from `Alert.tsx` which uses `onClick?: () => void`. The sign-up page reads these observables directly and renders its own modal/alert UI.

**All `showAlert` calls in `SignUpStore`:**

| Line | Trigger | Title | Message |
|------|---------|-------|---------|
| 82 | Password mismatch validation | `'Passwords Do Not Match'` | `'Please ensure the passwords match'` |
| 96 | `submitSignUp` catch | `'Sign Up Failed'` | `error.message` |
| 124 | `confirmSignInCode` catch | `'Verification Failed'` | `error.message` |
| 139 | `createOrganization` catch | `'Organization Creation Failed'` | `error.message` |

---

## 10. `AuthStore` Error Handling (Detail)

File: `src/store/AuthStore.ts`

**Observable error fields (lines 31, 40):**

```
signInError        = ''   // string; cleared to '' at start of submitSignIn
forgotPasswordError = ''  // string; cleared to '' at start of each forgot/reset call
```

**Per-action error paths:**

| Action | Line | Error mechanism |
|--------|------|----------------|
| `submitSignIn` | 84–97 | `this.signInError = error.message \|\| 'Failed to sign in...'` |
| `submitForgotPassword` | 135–147 | `this.forgotPasswordError = error.message \|\| 'Failed to send reset code.'` |
| `submitResetPassword` | 149–165 | `this.forgotPasswordError = error.message \|\| 'Failed to reset password.'` |
| `signOut` | 99–121 | `console.error` only — no observable, no alert |
| `loadUser` | 123–133 | `console.error` only — sets `this.user = undefined` |
| `updateUserDetails` | 174–192 | `console.error` + `throw error` — caller must handle |
| `deleteAccount` | 194–206 | `console.error` + `throw error` — caller must handle |

AuthStore is one of only two stores (with `JsonDocumentBuilderStore.dataError`) that use observable error strings instead of `showAlert`.

---

## Summary: Alert/Error Mechanism by Store

| Store | Mechanism |
|-------|-----------|
| `AuthStore` | Observable `signInError`, `forgotPasswordError` — no `showAlert` |
| `SignUpStore` | Own internal `showAlertFlag`/`alertTitle`/`alertMessage`/`alertActions` observables |
| `ModelsStore` | `console.error` only — no alert, no error field |
| `JsonDocumentBuilderStore` | `showAlert` (API errors) + `dataError` field (JSON parse errors) |
| All other 14 stores | Injected `showAlert` function via `setShowAlert` |
