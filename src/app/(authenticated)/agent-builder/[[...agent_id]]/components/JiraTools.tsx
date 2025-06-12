import React, { useEffect } from "react";
import { observer } from "mobx-react-lite";
import { Flex, Heading, Text } from "@chakra-ui/react";
import { agentBuilderStore } from "@/store/AgentBuilderStore";
import { integrationsStore } from "@/store/IntegrationsStore";
import { Tool } from "@/types/tools";

const jiraTools: Tool[] = [
    {
        tool_id: 'jira_create_issue',
        org_id: 'jira',
        name: 'Create Issue',
        description: 'Create a new Jira issue.'
    },
    {
        tool_id: 'jira_search_issues',
        org_id: 'jira',
        name: 'Search Issues',
        description: 'Search Jira issues in a project.'
    },
    {
        tool_id: 'jira_transition_issue',
        org_id: 'jira',
        name: 'Transition Issue',
        description: 'Move an issue to a new state.'
    },
    {
        tool_id: 'jira_assign_issue',
        org_id: 'jira',
        name: 'Assign Issue',
        description: 'Assign a Jira issue to a user.'
    },
    {
        tool_id: 'jira_manage_sprints',
        org_id: 'jira',
        name: 'Manage Sprints',
        description: 'Create and manage Jira sprints.'
    }
];

export const JiraTools = observer(() => {
    useEffect(() => {
        integrationsStore.loadIntegrations();
    }, []);

    const hasJiraIntegration = integrationsStore.integrations?.some(
        (integration) => integration.type === 'jira'
    );

    const addOrRemoveTool = (tool: Tool) => {
        if (agentBuilderStore.currentAgent?.tools?.includes(tool.tool_id)) {
            agentBuilderStore.removeTool(tool);
        } else {
            agentBuilderStore.addTool(tool);
        }
    };

    if (!hasJiraIntegration) {
        return (
            <Flex direction="column" gap={4} pb={4}>
                <Heading size="md">Jira Tools</Heading>
                <Text>Connect a Jira integration to use these tools.</Text>
            </Flex>
        );
    }

    return (
        <Flex direction="column" gap={4} pb={4}>
            <Flex direction="row" justify="space-between" align="center">
                <Heading size="md">Jira Tools</Heading>
            </Flex>
            <Flex direction="column" gap={2}>
                {jiraTools.map((tool, index) => (
                    <Flex
                        key={index}
                        direction="column"
                        gap={2}
                        p={2}
                        borderWidth="1px"
                        borderRadius="md"
                        border={agentBuilderStore.currentAgent?.tools?.includes(tool.tool_id) ? '2px solid' : ''}
                        onClick={() => addOrRemoveTool(tool)}
                        cursor="pointer"
                    >
                        <Heading size="sm">{tool.name}</Heading>
                        <Text>{tool.description}</Text>
                    </Flex>
                ))}
            </Flex>
        </Flex>
    );
});
