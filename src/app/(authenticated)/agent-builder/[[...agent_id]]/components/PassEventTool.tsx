import React from "react";
import { agentBuilderStore } from "@/store/AgentBuilderStore";
import { Heading, Text, Button, Flex } from "@chakra-ui/react";
import { CodeSnippet } from "@/app/components/CodeSnippet";

export const PassEventTool = () => {
    const hasTool = agentBuilderStore.currentAgent.tools?.some(tool => tool.name === "pass_event");

    const addOrRemoveTool = () => {
        if (hasTool) {
            agentBuilderStore.removeTool({ name: "pass_event" });
        } else {
            agentBuilderStore.addTool({ name: "pass_event" });
        }
    }
    return (
        <Flex direction="column" gap={4} pb={4}>
            <Flex direction="row" justify="space-between" align="center">
                <Heading size="md">Pass Event Tool</Heading>
                <Button onClick={addOrRemoveTool}>{hasTool ? "Remove Tool" : "Add Tool"}</Button>
            </Flex>
            <Text fontWeight="bold">
                Description
            </Text>
            <Text>
                Use this tool if you want your agent to pass unspoken events to your frontend. Handy for allowing agents to trigger UI changes, like auto populating fields or presenting buttons. Events will be returned along side the response message.
            </Text>
            <Text fontWeight="bold">
                Example chat response with event
            </Text>
            <CodeSnippet language="javascript" code={`{
    "response": "Great! I've updated the form with your name.",
    "events": [
        {
            "type": "set_name_field",
            "data": "Keanu"
        }
    ]
}`} />
            <Text fontWeight="bold">
                Parameters
            </Text>
            <CodeSnippet language="javascript" code={`pass_event(type: string, data?: any)`} />
            <Text fontWeight="bold">
                Example Prompting
            </Text>
            <Text>
                You are an agent guiding a user through filling out a form. Ask for their name and and once they give it to you call the pass_event tool with the type set to &quot;set_name_field&quot; and data set to their name.
            </Text>
        </Flex>
    )
}