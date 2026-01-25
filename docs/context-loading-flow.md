# Context Loading Flow - Viewing Previous Conversations

This document explains how the chat system loads and displays previously created contexts (conversations) with their existing messages.

## Overview

When a user opens the chat page or selects a previous conversation, the system retrieves the full context (including all messages) from the backend and initializes the `ChatBox` component with those messages already populated.

## Key Components

### 1. Data Types

**Context** (`src/types/context.ts`)
```typescript
interface Context {
    context_id: string;
    agent_id: string;
    messages: Message[];  // Array of all messages in the conversation
}

type Message =
  | { sender: "ai" | "human"; message: string; }
  | { type: "tool_call"; tool_call_id: string; tool_name: string; tool_input: Record<string, any>; }
  | { type: "tool_response"; tool_call_id: string; tool_output: string; };
```

**ContextHistory** (`src/types/contexthistory.ts`)
```typescript
interface ContextHistory {
    context_id: string;
    user_id: string;
    last_message: string;      // Preview of the last message (for sidebar display)
    created_at: number;
    updated_at: number;
    agent: ContextHistoryAgent;
}
```

### 2. API Endpoints

- **`getContextHistory()`** - Fetches a list of all the user's previous conversations (lightweight, just metadata + last message preview)
- **`getContext({ context_id })`** - Fetches a single context with ALL its messages

## The Flow

### Step 1: Page Load - Load Context History

When the chat page mounts, it calls `chatPageStore.loadData()`:

```typescript
// ChatPage (src/app/(authenticated)/chat/page.tsx)
useEffect(() => {
    chatPageStore.loadData();
}, [])
```

This triggers loading of both agents and context history:

```typescript
// ChatPageStore.ts
async loadData(force = false) {
    this.loadAgents(force);
    this.loadContextHistory(force);
}
```

### Step 2: Auto-Select Most Recent Context

After loading the context history, if there's no current context selected, the store automatically loads the most recent conversation:

```typescript
// ChatPageStore.ts
async loadContextHistory(force: boolean = false) {
    this.contextHistory = await getContextHistory();
    
    // Auto-load the most recent context on first load
    if (this.contextHistory.length > 0 && this.currentContext === undefined) {
        const lastContext = this.contextHistory[0];
        this.loadAndSetCurrentContext(lastContext.context_id);
        this.currentAgentName = lastContext.agent.agent_name;
    }
}
```

### Step 3: Fetch Full Context with Messages

The `loadAndSetCurrentContext` method fetches the complete context including all messages:

```typescript
// ChatPageStore.ts
async loadAndSetCurrentContext(context_id: string) {
    this.currentContextLoading = true;
    this.currentContext = await getContext({ context_id });
    this.currentContextLoading = false;
}
```

The `getContext` API returns the full `Context` object with the `messages` array populated.

### Step 4: User Clicks a Previous Conversation

When a user clicks on a conversation in the sidebar, it triggers `selectContext`:

```typescript
// ConversationRow.tsx
onClick={() => chatPageStore.selectContext(contextHistory.context_id, contextHistory.agent.agent_name)}
```

Which loads that context:

```typescript
// ChatPageStore.ts
async selectContext(context_id: string, agent_name: string) {
    this.currentAgentName = agent_name;
    this.loadAndSetCurrentContext(context_id);
}
```

### Step 5: ChatBox Receives Context with Messages

The `ChatBox` component receives the loaded context as a prop:

```typescript
// ChatPage
{chatPageStore.currentContext && (
    <ChatBox context={chatPageStore.currentContext} style={chatBoxStyle} />
)}
```

### Step 6: ChatBox Initializes Messages State

Inside `ChatBox`, the messages are initialized directly from the context:

```typescript
// ChatBox.tsx
export const ChatBox = ({ context, onEvents, style, for_display }: ChatBoxProps) => {
    // Initialize messages state with the context's existing messages
    const [messages, setMessages] = useState<Message[]>(context.messages);
    
    // ... rest of component
}
```

**This is the key line**: `useState<Message[]>(context.messages)` - The messages state is initialized with whatever messages already exist in the context. If this is a new conversation, `context.messages` will be empty. If it's an existing conversation, it will contain all previous messages.

### Step 7: MessagesArea Renders All Messages

The `MessagesArea` component renders all messages from the state:

```typescript
// MessagesArea.tsx
{messages.map((message, idx) => (
    <div key={idx}>
        <MessageView message={message} style={style} />
    </div>
))}
```

## Visual Flow Diagram

```
┌─────────────────────────────────────────────────────────────────────┐
│                         Chat Page Load                               │
└─────────────────────────────────────────────────────────────────────┘
                                   │
                                   ▼
                    ┌──────────────────────────┐
                    │ chatPageStore.loadData() │
                    └──────────────────────────┘
                                   │
                    ┌──────────────┴──────────────┐
                    ▼                              ▼
        ┌────────────────────┐        ┌────────────────────────┐
        │    loadAgents()    │        │  loadContextHistory()  │
        └────────────────────┘        └────────────────────────┘
                                                  │
                                                  ▼
                                    ┌──────────────────────────────┐
                                    │  API: getContextHistory()    │
                                    │  Returns: ContextHistory[]   │
                                    │  (list with last_message     │
                                    │   previews, no full messages)│
                                    └──────────────────────────────┘
                                                  │
                                                  ▼
                              ┌─────────────────────────────────────────┐
                              │  If first load & history exists:        │
                              │  loadAndSetCurrentContext(context_id)   │
                              └─────────────────────────────────────────┘
                                                  │
                                                  ▼
                                    ┌──────────────────────────────┐
                                    │     API: getContext()        │
                                    │     Returns: Context         │
                                    │     (includes ALL messages)  │
                                    └──────────────────────────────┘
                                                  │
                                                  ▼
                           ┌─────────────────────────────────────────────┐
                           │  currentContext = { context_id, messages }  │
                           └─────────────────────────────────────────────┘
                                                  │
                                                  ▼
                              ┌────────────────────────────────────────┐
                              │  <ChatBox context={currentContext} />  │
                              └────────────────────────────────────────┘
                                                  │
                                                  ▼
                          ┌──────────────────────────────────────────────┐
                          │  useState<Message[]>(context.messages)       │
                          │  ↑ Messages state initialized with existing  │
                          │    messages from the context                 │
                          └──────────────────────────────────────────────┘
                                                  │
                                                  ▼
                              ┌────────────────────────────────────┐
                              │  MessagesArea renders all messages │
                              │  from the messages state array     │
                              └────────────────────────────────────┘
```

## Important Notes

1. **Two-Level Fetching**: The system uses two API calls:
   - `getContextHistory()` for the sidebar list (lightweight, just previews)
   - `getContext()` when actually viewing a conversation (full messages)

2. **State Initialization**: The key to displaying existing messages is that `ChatBox` initializes its `messages` state with `context.messages`, so all prior messages are immediately available.

3. **WebSocket for New Messages**: After initialization, the `ChatBox` connects to a WebSocket (`TokenStreamingService`) for real-time message streaming. New messages are appended to the state as they arrive.

4. **Context Key**: When switching between contexts, React re-renders the `ChatBox` with the new context, which re-initializes the messages state with the new context's messages.

