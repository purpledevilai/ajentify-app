import React, { useEffect } from "react";
import { agentBuilderStore } from "@/store/AgentBuilderStore";
import { Heading, Text, Flex, Spinner } from "@chakra-ui/react";
import { toolsStore } from "@/store/ToolsStore";
import { observer } from "mobx-react-lite";
import { Tool } from "@/types/tools";

export const CustomAgentTools = observer(() => {

    useEffect(() => {
        toolsStore.loadTools();
    }, []);

    const addOrRemoveTool = (tool: Tool) => {
        if (agentBuilderStore.currentAgent?.tools?.includes(tool.tool_id)) {
            agentBuilderStore.removeTool(tool);
        } else {
            agentBuilderStore.addTool(tool);
        }
    }

    return (
        <Flex direction="column" gap={4} pb={4}>
            <Flex direction="row" justify="space-between" align="center">
                <Heading size="md">Custom Code Tools</Heading>
            </Flex>

            {/** Tools list */}
            {toolsStore.toolsLoading ? (
                <Flex justify="center">
                    <Spinner />
                </Flex>
            ) : (
                toolsStore.tools && <Flex direction="column" gap={2}>
                    {toolsStore.tools.map((tool, index) => (
                        <Flex
                            key={index} 
                            direction="column" 
                            gap={2} p={2} 
                            borderWidth="1px" 
                            borderRadius="md"
                            border={agentBuilderStore.currentAgent?.tools?.includes(tool.tool_id) ? "2px solid" : ""}
                            onClick={() => addOrRemoveTool(tool)}
                            cursor="pointer"
                        >
                            <Heading size="sm">{tool.name}</Heading>
                            <Text>{tool.description}</Text>
                            {/* <CodeSnippet code={tool.code} /> */}
                        </Flex>
                    ))}
                </Flex>
            )}

        </Flex>
    )
});