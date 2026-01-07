# Adding Default Tools to Ajentify

This guide explains how to add new default (built-in) tools to the Ajentify platform. Default tools are pre-built tools that the backend recognizes by their IDs, as opposed to custom code tools which are stored in the database.

## Overview

Default tools differ from custom tools in several ways:

| Aspect | Default Tools | Custom Code Tools |
|--------|---------------|-------------------|
| Storage | Not stored in tools DB, recognized by ID | Stored in tools database |
| Implementation | Backend has built-in handlers | User-defined code executed by backend |
| Examples | Gmail, Memory, Web Search, Pass Event | User-created tools via Tool Builder |

## Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│  Frontend (Agent Builder)                                       │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │ Tool Picker Modal                                         │  │
│  │ [memory] [web_search] [gmail] [custom_code] [pass_event] │  │
│  │                         ↓                                 │  │
│  │ Tool Component (e.g., GmailTools.tsx)                    │  │
│  │ - Defines tool IDs                                        │  │
│  │ - Adds/removes tools via agentBuilderStore               │  │
│  └──────────────────────────────────────────────────────────┘  │
│                         ↓                                       │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │ AgentBuilderStore                                         │  │
│  │ - currentAgent.tools[] = string IDs sent to backend      │  │
│  │ - tools[] = Tool objects for UI display                  │  │
│  │ - DEFAULT_AJENTIFY_TOOLS = list of recognized tool IDs   │  │
│  └──────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────┘
                         ↓
┌─────────────────────────────────────────────────────────────────┐
│  Backend                                                        │
│  - Recognizes tool IDs when agent calls them                   │
│  - Executes built-in tool logic                                │
└─────────────────────────────────────────────────────────────────┘
```

## Step-by-Step Guide

### Step 1: Register Tool IDs in AgentBuilderStore

Add your new tool IDs to the `DEFAULT_AJENTIFY_TOOLS` constant in `src/store/AgentBuilderStore.ts`:

```typescript
const DEFAULT_AJENTIFY_TOOLS: string[] = [
    // Gmail tools
    "list_emails", "get_email", "list_labels", ...
    
    // Memory tools
    "read_memory", "view_memory_shape", ...
    
    // Web search tools
    "web_search", "view_url",
    
    // Pass event tool
    "pass_event",
    
    // YOUR NEW TOOLS - Add here
    "your_new_tool_1", "your_new_tool_2",
];
```

This ensures that when an agent is loaded, these tool IDs are recognized and displayed in the UI.

### Step 2: Add Tool Category to Agent Builder

If your tools belong to a new category, add it to the `agentTools` array in `AgentBuilderStore.ts`:

```typescript
agentTools: string[] = [
    'memory',
    'web_search',
    'gmail',
    'custom_code',
    'pass_event',
    'your_new_category',  // Add your category
]
```

### Step 3: Create the Tool Component

Create a new component in `src/app/(authenticated)/agent-builder/[[...agent_id]]/components/`:

```typescript
// YourNewTools.tsx
import React from "react";
import { agentBuilderStore } from "@/store/AgentBuilderStore";
import { Heading, Text, Button, Flex } from "@chakra-ui/react";
import { observer } from "mobx-react-lite";

export const YourNewTools = observer(() => {
    // Define your tool IDs
    const yourToolIds = ["your_new_tool_1", "your_new_tool_2"];

    // Check if tools are enabled
    const hasTools = yourToolIds.some(tool =>
        agentBuilderStore.currentAgent.tools?.some(agentTool => agentTool === tool)
    );

    // Toggle function
    const toggleTools = () => {
        if (hasTools) {
            yourToolIds.forEach(tool => {
                agentBuilderStore.removeTool({ 
                    tool_id: tool, 
                    org_id: "default", 
                    name: tool 
                });
            });
        } else {
            yourToolIds.forEach(tool => {
                agentBuilderStore.addTool({ 
                    tool_id: tool, 
                    org_id: "default", 
                    name: tool 
                });
            });
        }
    };

    return (
        <Flex direction="column" gap={4} pb={4}>
            <Flex direction="row" justify="space-between" align="center">
                <Heading size="md">Your New Tools</Heading>
                <Button 
                    onClick={toggleTools}
                    colorScheme={hasTools ? "purple" : "gray"}
                    variant={hasTools ? "solid" : "outline"}
                    size="sm"
                >
                    {hasTools ? "Remove" : "Add"} Tools
                </Button>
            </Flex>
            
            <Text fontWeight="bold">Description</Text>
            <Text>
                Describe what your tools do here.
            </Text>
            
            {hasTools && (
                <>
                    <Text fontWeight="bold">Available Tools</Text>
                    <Text>your_new_tool_1, your_new_tool_2</Text>
                </>
            )}
        </Flex>
    );
});
```

### Step 4: Register Component in Agent Builder Page

Update `src/app/(authenticated)/agent-builder/[[...agent_id]]/page.tsx`:

1. Import your component:
```typescript
import { YourNewTools } from "./components/YourNewTools";
```

2. Add to the `getViewForTool` function:
```typescript
const getViewForTool = (toolName: string) => {
    switch (toolName) {
        case 'pass_event':
            return <PassEventTool />;
        case 'custom_code':
            return <CustomAgentTools />;
        case 'memory':
            return <MemoryTools />;
        case 'web_search':
            return <WebSearchTools />;
        case 'gmail':
            return <GmailTools />;
        case 'your_new_category':           // Add this
            return <YourNewTools />;
        default:
            return <Text>Tool not implemented yet</Text>;
    }
}
```

### Step 5: Backend Implementation

Ensure the backend recognizes and handles your new tool IDs. The backend needs to:

1. Accept the tool IDs when creating/updating agents
2. Provide tool definitions to the LLM when the agent is invoked
3. Execute the tool logic when the LLM calls the tool

*(Backend implementation details depend on your backend architecture)*

## Key Files Reference

| File | Purpose |
|------|---------|
| `src/store/AgentBuilderStore.ts` | Register tool IDs in `DEFAULT_AJENTIFY_TOOLS`, add category to `agentTools` |
| `src/app/(authenticated)/agent-builder/[[...agent_id]]/page.tsx` | Register component in `getViewForTool()` |
| `src/app/(authenticated)/agent-builder/[[...agent_id]]/components/*.tsx` | Tool UI components |

## Example: Gmail Tools Structure

The Gmail tools implementation demonstrates a more complex setup with multiple tool groups:

```typescript
// Tool groups (can be toggled independently)
const readOnlyTools = ["list_emails", "get_email", "list_labels"];
const basicManageTools = ["set_email_read_status", "archive_email", "modify_email_labels"];
const sendTools = ["send_email"];
const draftTools = ["create_draft", "list_drafts", "get_draft", "update_draft", "send_draft", "delete_draft"];
const fullManageTools = ["trash_email", "untrash_email", "delete_email"];
```

Each group has its own toggle button, allowing users to add capabilities incrementally.

## Tips

1. **Use `org_id: "default"`** when adding/removing default tools - this distinguishes them from custom tools
2. **Tool names should match IDs** for default tools - `name: tool_id` is the convention
3. **Group related tools** - Users prefer adding capabilities in logical groups rather than individual tools
4. **Add warnings for destructive tools** - Use alerts to warn users about tools that can delete data
5. **Provide example prompts** - Help users understand how to instruct the agent to use the tools

## Checklist

- [ ] Add tool IDs to `DEFAULT_AJENTIFY_TOOLS` in AgentBuilderStore
- [ ] Add category to `agentTools` array (if new category)
- [ ] Create tool component in `components/` directory
- [ ] Import and register component in `page.tsx`
- [ ] Implement backend tool handlers
- [ ] Test adding/removing tools
- [ ] Test loading agent with tools attached
- [ ] Write documentation for the tools (see `docs/gmail-integration.md` as example)

