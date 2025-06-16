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
        description: 'Create a new Jira issue with specified details. Use this tool when you need to create a task, bug, story or other issue type in a Jira project.'
    },
    {
        tool_id: 'jira_search_issues',
        org_id: 'jira',
        name: 'Search Issues',
        description: 'Search for Jira issues using JQL (Jira Query Language). Use this tool to find existing issues matching specific criteria.'
    },
    {
        tool_id: 'jira_update_issue',
        org_id: 'jira',
        name: 'Update Issue',
        description: 'Update an existing Jira issue\'s summary and/or description. Use this tool to modify the details of an issue that already exists.'
    },
    {
        tool_id: 'jira_transition_issue',
        org_id: 'jira',
        name: 'Transition Issue',
        description: 'Change the status of a Jira issue by applying a workflow transition. Use this tool to move issues between statuses.'
    },
    {
        tool_id: 'jira_assign_issue',
        org_id: 'jira',
        name: 'Assign Issue',
        description: 'Assign a Jira issue to a specific user. Use this tool when you need to allocate an issue to someone based on their account ID.'
    },
    {
        tool_id: 'jira_unassign_issue',
        org_id: 'jira',
        name: 'Unassign Issue',
        description: 'Remove the current assignee from a Jira issue. Use this tool to clear the assignee field, making the issue unassigned.'
    },
    {
        tool_id: 'jira_get_sprints',
        org_id: 'jira',
        name: 'Get Sprints',
        description: 'Retrieve all sprints from a specified Jira board. Use this tool to get information about current, future, and past sprints in an Agile board.'
    },
    {
        tool_id: 'jira_get_sprint_issues',
        org_id: 'jira',
        name: 'Get Sprint Issues',
        description: 'Retrieve all issues currently assigned to a specific sprint. Use this tool to see what work is planned for or in progress in a particular sprint.'
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
