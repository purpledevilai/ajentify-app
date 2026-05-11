---
date: 2026-05-11
topic: "Deliverable D: API Client Chokepoint — current state audit"
repos_touched: [ajentify-app]
tags: [research, api-client, fetch, auth, chokepoint, interceptor]
status: complete
last_updated: 2026-05-11
---

# Deliverable D: API Client Chokepoint — Current State Audit

## 1. `checkResponseAndParseJson` Helper

**File:** `src/utils/api/checkResponseAndParseJson.ts`

```typescript
export const checkResponseAndGetJson = async (res: Response): Promise<Record<string, unknown>> => {
    if (!res.ok) {
        let resJson;
        try {
            resJson = await res.json()
        } catch (error) {
            console.error('Error parsing response JSON:', error);
            throw Error(`Request failed with status: ${res.status}`)
        }
        if ('error' in resJson) {
            throw Error(resJson.error);
        }
    }
    return await res.json();
}
```

**What it does:**
- Accepts a raw `Response` object (from `fetch`).
- On a non-`ok` status (4xx/5xx): attempts to parse the body as JSON; if parsing fails, throws `"Request failed with status: {N}"`; if parsing succeeds and the body has an `"error"` key, throws `Error(resJson.error)`.
- On a success status: calls `res.json()` a second time (no early-return path) and returns the parsed object typed as `Record<string, unknown>`.

**Edge cases / implementation details:**
- **Double `res.json()` call on the success path.** `res.json()` consumes the body stream. On the success path, `res.json()` is never called during the error-check block (the `if (!res.ok)` block), so the success path correctly calls it once. On a non-ok path, `res.json()` is called in the error block _and_ then falls through to the `return await res.json()` at the bottom — but at that point an exception has already been thrown, so the second call is dead code. Not a runtime bug, but the logic is slightly confusing.
- **Non-ok responses without an `"error"` key.** If the body parses but has no `"error"` field, no exception is thrown from the `if ('error' in resJson)` check, and then `return await res.json()` executes — but the stream has already been consumed, so this second `res.json()` call would throw `"body already used"` or similar. In practice this is caught by callers' try/catch blocks.
- **Return type is `Record<string, unknown>`.** Callers cast to the correct type via `as unknown as T`.
- **Function is exported as `checkResponseAndGetJson`** (note: the filename says `checkResponseAndParseJson` but the exported function name is `checkResponseAndGetJson`).

---

## 2. API Files Inventory

**Total file count: 72 files across 21 subdirectories.**

| Subdirectory | Count | Files |
|---|---|---|
| `agent/` | 4 | `createAgent.ts`, `deleteAgent.ts`, `getAgents.ts`, `updateAgent.ts` |
| `apikey/` | 3 | `generateAPIKey.ts`, `getAPIKeys.ts`, `revokeAPIKey.ts` |
| `auth/` | 6 | `confirmSignUp.ts`, `forgotPassword.ts`, `resetPassword.ts`, `signIn.ts`, `signOut.ts`, `signUp.ts` |
| `chat/` | 1 | `chat.ts` |
| `chatpage/` | 5 | `createChatPage.ts`, `deleteChatPage.ts`, `getChatPage.ts`, `getChatPages.ts`, `updateChatPage.ts` |
| `context/` | 5 | `createContext.ts`, `deleteContext.ts`, `getContext.ts`, `getContextHistory.ts`, `getOrgContexts.ts` |
| `createteam/` | 1 | `createTeam.ts` |
| `deploy/` | 2 | `deployManifest.ts`, `planManifest.ts` |
| `integration/` | 8 | `deleteIntegration.ts`, `exchangeGmailCode.ts`, `exchangeGoogleCalendarCode.ts`, `exchangeOutlookCode.ts`, `getGmailAuthUrl.ts`, `getGoogleCalendarAuthUrl.ts`, `getIntegrations.ts`, `getOutlookAuthUrl.ts` |
| `job/` | 1 | `getJob.ts` |
| `jsondocument/` | 4 | `createJsonDocument.ts`, `deleteJsonDocument.ts`, `getJsonDocuments.ts`, `updateJsonDocument.ts` |
| `model/` | 1 | `getModels.ts` |
| `organization/` | 1 | `createOrganization.ts` |
| `parameterdefinition/` | 5 | `createParameterDefinition.ts`, `deleteParameterDefinition.ts`, `getParameterDefinition.ts`, `getParameterDefinitions.ts`, `updateParameterDefinition.ts` |
| `scrapepage/` | 1 | `scrapePage.ts` |
| `stage/` | 6 | `createStage.ts`, `deleteStage.ts`, `getStage.ts`, `getStageManifest.ts`, `getStages.ts`, `updateStage.ts` |
| `structuredresponseendpoint/` | 6 | `createSRE.ts`, `deleteSRE.ts`, `getSRE.ts`, `getSREs.ts`, `runSRE.ts`, `updateSRE.ts` |
| `tokenstreamingservice/` | 1 | `TokenStreamingService.ts` |
| `tool/` | 6 | `createTool.ts`, `deleteTool.ts`, `getTool.ts`, `getTools.ts`, `testTool.ts`, `updateTool.ts` |
| `usage/` | 1 | `getUsage.ts` |
| `user/` | 4 | `createUser.ts`, `deleteUser.ts`, `getUser.ts`, `updateUser.ts` |

---

## 3. Current Fetch Pattern — Sample Files

All files using the standard pattern share identical structural boilerplate. Five representative samples:

### `src/api/agent/getAgents.ts` (lines 11–28)
- **URL construction:** Template literal with conditional query string: `` `${process.env.NEXT_PUBLIC_API_BASE_URL}/agents${qs ? `?${qs}` : ''}` ``; query string built via `new URLSearchParams()`.
- **Auth header:** `'Authorization': await authStore.getAccessToken() || ''`
- **Additional headers:** `'Content-Type': 'application/json'`
- **Response parsing:** `checkResponseAndGetJson(response)` → extracts `agentsObj["agents"]`

### `src/api/tool/getTools.ts` (lines 11–29)
- **URL construction:** Template literal with conditional query string: `` `${process.env.NEXT_PUBLIC_API_BASE_URL}/tools${qs ? `?${qs}` : ''}` ``; query string built via `new URLSearchParams()`.
- **Auth header:** `'Authorization': await authStore.getAccessToken() || ''`
- **Response parsing:** `checkResponseAndGetJson(response)` → extracts `toolObj["tools"]`

### `src/api/structuredresponseendpoint/getSREs.ts` (lines 10–28)
- **URL construction:** Template literal with conditional query string: `` `${process.env.NEXT_PUBLIC_API_BASE_URL}/sres${qs ? `?${qs}` : ''}` ``; query string built via `new URLSearchParams()`.
- **Auth header:** `'Authorization': await authStore.getAccessToken() || ''`
- **Response parsing:** `checkResponseAndGetJson(response)` → extracts `sreObj["sres"]`

### `src/api/context/getOrgContexts.ts` (lines 13–37)
- **URL construction:** Template literal with conditional query string: `` `${process.env.NEXT_PUBLIC_API_BASE_URL}/org-contexts${qs ? `?${qs}` : ''}` ``; query string built via `new URLSearchParams()`.
- **Auth header:** `'Authorization': await authStore.getAccessToken() || ''`
- **Method:** explicit `'GET'`
- **Response parsing:** `checkResponseAndGetJson(response)` cast to `GetOrgContextsResponse`

### `src/api/stage/getStages.ts` (lines 6–19)
- **URL construction:** Inline template literal, no query string: `` `${process.env.NEXT_PUBLIC_API_BASE_URL}/stages` ``
- **Auth header:** `'Authorization': await authStore.getAccessToken() || ''`
- **Response parsing:** `checkResponseAndGetJson(response)` → extracts `body["stages"]`

**Canonical pattern (pseudocode):**
```typescript
import { authStore } from "@/store/AuthStore";
import { checkResponseAndGetJson } from "@/utils/api/checkResponseAndParseJson";

export async function doSomething(...): Promise<T> {
  try {
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/endpoint`, {
      method: 'POST' | 'GET' | 'DELETE',   // GET often omitted (fetch default)
      headers: {
        'Authorization': await authStore.getAccessToken() || '',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),        // POST/DELETE only
    });
    return await checkResponseAndGetJson(response) as unknown as T;
  } catch (error) {
    const errorMessage = (error as Error).message || 'fallback message';
    throw Error(errorMessage);
  }
}
```

---

## 4. Auth Imports in API Files

**Grep target:** `authStore\.getAccessToken` in `src/api/`

**Total files: 61**

Complete list (grouped by subdirectory):

| Subdirectory | Files |
|---|---|
| `agent/` (4) | `createAgent.ts`, `deleteAgent.ts`, `getAgents.ts`, `updateAgent.ts` |
| `apikey/` (3) | `generateAPIKey.ts`, `getAPIKeys.ts`, `revokeAPIKey.ts` |
| `chat/` (1) | `chat.ts` |
| `chatpage/` (4) | `createChatPage.ts`, `deleteChatPage.ts`, `getChatPages.ts`, `updateChatPage.ts` |
| `context/` (5) | `createContext.ts`, `deleteContext.ts`, `getContext.ts`, `getContextHistory.ts`, `getOrgContexts.ts` |
| `createteam/` (1) | `createTeam.ts` |
| `deploy/` (2) | `deployManifest.ts`, `planManifest.ts` |
| `integration/` (8) | `deleteIntegration.ts`, `exchangeGmailCode.ts`, `exchangeGoogleCalendarCode.ts`, `exchangeOutlookCode.ts`, `getGmailAuthUrl.ts`, `getGoogleCalendarAuthUrl.ts`, `getIntegrations.ts`, `getOutlookAuthUrl.ts` |
| `job/` (1) | `getJob.ts` |
| `jsondocument/` (4) | `createJsonDocument.ts`, `deleteJsonDocument.ts`, `getJsonDocuments.ts`, `updateJsonDocument.ts` |
| `model/` (1) | `getModels.ts` |
| `organization/` (1) | `createOrganization.ts` |
| `parameterdefinition/` (5) | `createParameterDefinition.ts`, `deleteParameterDefinition.ts`, `getParameterDefinition.ts`, `getParameterDefinitions.ts`, `updateParameterDefinition.ts` |
| `scrapepage/` (1) | `scrapePage.ts` |
| `stage/` (6) | `createStage.ts`, `deleteStage.ts`, `getStage.ts`, `getStageManifest.ts`, `getStages.ts`, `updateStage.ts` |
| `structuredresponseendpoint/` (5) | `createSRE.ts`, `deleteSRE.ts`, `getSREs.ts`, `runSRE.ts`, `updateSRE.ts` |
| `tool/` (5) | `createTool.ts`, `deleteTool.ts`, `getTools.ts`, `testTool.ts`, `updateTool.ts` |
| `usage/` (1) | `getUsage.ts` |
| `user/` (3) | `createUser.ts`, `deleteUser.ts`, `getUser.ts` |

All 61 files import from `@/store/AuthStore` and call `await authStore.getAccessToken() || ''` as the `Authorization` header value. The `|| ''` fallback means unauthenticated requests emit an empty string header rather than omitting the header entirely.

---

## 5. API Files That Don't Use the Fetch+AuthStore Pattern

### 5a. Amplify-only auth files — `src/api/auth/` (6 files) + `src/api/user/updateUser.ts`

These files make no HTTP fetch calls to `NEXT_PUBLIC_API_BASE_URL`. They call AWS Amplify Auth SDK functions directly.

| File | Amplify function called |
|---|---|
| `src/api/auth/signIn.ts:10` | `signIn` from `aws-amplify/auth` |
| `src/api/auth/signOut.ts:5` | `signOut` from `aws-amplify/auth` |
| `src/api/auth/signUp.ts:12` | `signUp` from `aws-amplify/auth` |
| `src/api/auth/forgotPassword.ts:5` | `resetPassword` from `aws-amplify/auth` |
| `src/api/auth/resetPassword.ts:11` | `confirmResetPassword` from `aws-amplify/auth` |
| `src/api/auth/confirmSignUp.ts:11` | `confirmSignUp` from `aws-amplify/auth` |
| `src/api/user/updateUser.ts:10` | `updateUserAttributes` from `aws-amplify/auth` |

None of these import `authStore` or `checkResponseAndGetJson`.

### 5b. Public-access fetch files (no `Authorization` header) — 3 files

These files call `fetch` against `NEXT_PUBLIC_API_BASE_URL` but do **not** import `authStore` and do **not** send an `Authorization` header:

| File | Endpoint | Method |
|---|---|---|
| `src/api/chatpage/getChatPage.ts:6` | `/chat-page/{id}` | `GET` |
| `src/api/tool/getTool.ts:6` | `/tool/{id}` | `GET` |
| `src/api/structuredresponseendpoint/getSRE.ts:6` | `/sre/{id}` | `GET` |

All three still use `checkResponseAndGetJson` for response parsing. These appear to be intentionally public read endpoints.

### 5c. WebSocket file — 1 file

| File | Transport |
|---|---|
| `src/api/tokenstreamingservice/TokenStreamingService.ts` | WebSocket via `SimpleWebSocketClient` |

Does not use fetch. Auth is passed as a parameter in the first JSON-RPC message (`connect_to_context` call with `access_token` field), not as an HTTP header.

---

## 6. Chat Page API Files

**Directory:** `src/api/chatpage/` — 5 files

| File | Uses authStore? | Uses fetch? | Notes |
|---|---|---|---|
| `createChatPage.ts` | Yes | Yes | POST `/chat-page` |
| `deleteChatPage.ts` | Yes | Yes | DELETE `/chat-page/{id}` |
| `getChatPage.ts` | **No** | Yes | GET `/chat-page/{id}` — no auth header sent |
| `getChatPages.ts` | Yes | Yes | GET `/chat-pages` |
| `updateChatPage.ts` | Yes | Yes | POST `/chat-page/{id}` |

4 of 5 chatpage files follow the standard fetch+authStore pattern. `getChatPage.ts` is the public variant (no auth).

---

## 7. `NEXT_PUBLIC_API_BASE_URL` Usage

**Grep target:** `NEXT_PUBLIC_API_BASE_URL` in `src/api/`

**Total files: 64**

This is the union of the 61 authStore files plus the 3 public-access fetch files (`getChatPage.ts`, `getTool.ts`, `getSRE.ts`).

**URL construction patterns (all files use template literal string concatenation — zero files use `new URL()`):**

| Pattern | Example file | Snippet |
|---|---|---|
| Bare endpoint (no QS) | `getStages.ts:8` | `` `${process.env.NEXT_PUBLIC_API_BASE_URL}/stages` `` |
| Conditional QS via URLSearchParams | `getAgents.ts:16` | `` `${process.env.NEXT_PUBLIC_API_BASE_URL}/agents${qs ? `?${qs}` : ''}` `` |
| Always-appended QS via URLSearchParams | `getUsage.ts:36` | `` `${process.env.NEXT_PUBLIC_API_BASE_URL}/usage?${searchParams.toString()}` `` |
| Path parameter | `getJob.ts:7` | `` `${process.env.NEXT_PUBLIC_API_BASE_URL}/job/${jobId}` `` |
| Path parameter + conditional QS | `getStageManifest.ts:8` | `` `${process.env.NEXT_PUBLIC_API_BASE_URL}/stage/${encodeURIComponent(stageId)}/manifest` `` |
| Conditional ternary (no URLSearchParams) | `getAPIKeys.ts:21` | Ternary: appends `?${searchParams.toString()}` only if non-empty |
| Manual string concat (no URLSearchParams) | `getContext.ts:16` | `` `.../${context_id}${queryParams}` `` where `queryParams` is built with string ops |

Only `getStageManifest.ts` uses `encodeURIComponent` on a path segment. No file uses `new URL()` for construction.

---

## 8. Existing `client.ts`

`src/api/client.ts` **does not exist**. There is no shared API client or interceptor layer today.

---

## 9. WebSocket / Streaming Clients

### `src/lib/SimpleWebSocketClient.ts`

A thin wrapper around the browser `WebSocket` API. No auth handling whatsoever. Constructor accepts a URL string. `connect()` opens the socket. The caller is responsible for passing any auth data through the message protocol after connection.

### `src/lib/JSONRPCPeer.ts`

A JSON-RPC 2.0 message router. Accepts a generic `sender` callback (`(msg: string) => void`) in its constructor — completely transport-agnostic. Has no concept of auth; the auth token is injected by the caller at the application level.

### `src/api/tokenstreamingservice/TokenStreamingService.ts`

Composes `SimpleWebSocketClient` + `JSONRPCPeer`. Auth pattern:
- Constructor signature: `constructor(tokenStreamingUrl: string, contextId: string, accessToken: string)` — the `accessToken` is a constructor parameter, not fetched internally.
- At line 54–57, the `accessToken` is sent inside the first `connect_to_context` JSON-RPC call: `{ context_id: this.contextId, access_token: this.accessToken }`.
- No HTTP headers involved. Auth is application-layer (in the first WS message), not transport-layer.

---

## 10. Public Chat-Page RSC

**File:** `src/app/(public)/chat-page/[chat_page_id]/page.tsx`

This is a Next.js **React Server Component** (async function, no `"use client"` directive) in the `(public)` route group.

**Server-side API calls made:**

| Call | Function | Auth behavior |
|---|---|---|
| `getChatPage(chat_page_id)` | `src/api/chatpage/getChatPage.ts` | **No auth header** — explicitly a public endpoint |
| `getContext({ context_id })` | `src/api/context/getContext.ts` | Calls `authStore.getAccessToken()` server-side |
| `createContext({ agent_id })` | `src/api/context/createContext.ts` | Calls `authStore.getAccessToken()` server-side |

**Notable observation:** `getContext` and `createContext` both import `authStore` and call `await authStore.getAccessToken() || ''`. In an RSC running on the server, `authStore` is a module-level singleton. The `|| ''` fallback means that if Cognito returns no token (anonymous visitor), the `Authorization` header is sent as an empty string. The backend apparently accepts empty-string auth for context creation under a public chat page — or the behavior is not yet fully exercised.

---

## 11. Summary: Files In Scope for API Client Chokepoint Sweep

| Category | Count | Notes |
|---|---|---|
| fetch + authStore (standard pattern) | **61** | All need auth header centralized |
| fetch + no authStore (public endpoints) | **3** | `getChatPage.ts`, `getTool.ts`, `getSRE.ts` — intentionally unauthenticated |
| **Total fetch-based API files** | **64** | All could benefit from a shared `client.ts` |
| Amplify-only (no fetch) | 7 | `auth/*` (6) + `user/updateUser.ts` — out of scope |
| WebSocket (no fetch) | 1 | `tokenstreamingservice/TokenStreamingService.ts` — separate concern |
| **Grand total in `src/api/`** | **72** | — |

**Duplicate boilerplate present in all 64 fetch files:**
1. `import { authStore } from "@/store/AuthStore"` (61 files)
2. `import { checkResponseAndGetJson } from "@/utils/api/checkResponseAndParseJson"` (64 files)
3. `await authStore.getAccessToken() || ''` header construction (61 files)
4. `'Content-Type': 'application/json'` header (64 files)
5. `${process.env.NEXT_PUBLIC_API_BASE_URL}` string prefix (64 files)
6. Wrapping try/catch that re-throws with `(error as Error).message || 'fallback'` (64 files)
