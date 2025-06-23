import React from "react";
import { agentBuilderStore } from "@/store/AgentBuilderStore";
import { Heading, Text, Button, Flex } from "@chakra-ui/react";
import { CodeSnippet } from "@/app/components/CodeSnippet";
import { observer } from "mobx-react-lite";

export const WebSearchTools = observer(() => {
    const webSearchTools = ["web_search", "view_url"];

    const hasWebSearchTools = webSearchTools.some(tool =>
        agentBuilderStore.currentAgent.tools?.some(agentTool => agentTool === tool)
    );

    const toggleWebSearchTools = () => {
        if (hasWebSearchTools) {
            webSearchTools.forEach(tool => {
                agentBuilderStore.removeTool({ tool_id: tool, org_id: "default", name: tool });
            });
        } else {
            webSearchTools.forEach(tool => {
                agentBuilderStore.addTool({ tool_id: tool, org_id: "default", name: tool });
            });
        }
    };

    const getExamplePrompt = () => {
        return `You have access to web search capabilities. You can search the internet for information and view webpage contents to provide comprehensive answers.

Use web_search to find relevant URLs based on search queries, then use view_url to read the content of specific pages for detailed information.`;
    };

    return (
        <Flex direction="column" gap={4} pb={4}>
            <Flex direction="row" justify="space-between" align="center">
                <Heading size="md">Web Search Tools</Heading>
                <Button
                    onClick={toggleWebSearchTools}
                    colorScheme={hasWebSearchTools ? "purple" : "gray"}
                    variant={hasWebSearchTools ? "solid" : "outline"}
                    size="sm"
                >
                    {hasWebSearchTools ? "Remove" : "Add"} Web Search Tools
                </Button>
            </Flex>

            <Text fontWeight="bold">Description</Text>
            <Text>
                Web Search Tools allow your agent to search the internet and retrieve webpage content. 
                These tools enable your agent to find current information, research topics, and provide 
                up-to-date answers by accessing web resources in real-time.
            </Text>

            <Text fontWeight="bold">Available Tools</Text>
            <Text>
                <strong>web_search:</strong> Performs a Google-like search and returns a list of relevant URLs 
                based on your search query. Perfect for finding sources and discovering relevant web pages.
            </Text>
            <Text>
                <strong>view_url:</strong> Retrieves and adds the content of a specific webpage to the agent&apos;s 
                context. Use this after web_search to read the actual content of interesting pages.
            </Text>

            {hasWebSearchTools && (
                <>
                    <Text fontWeight="bold">Example Prompt Addition</Text>
                    <Text fontSize="sm">
                        Add this to your agent prompt to explain web search capabilities:
                    </Text>
                    <CodeSnippet language="text" code={getExamplePrompt()} />
                </>
            )}
        </Flex>
    );
});