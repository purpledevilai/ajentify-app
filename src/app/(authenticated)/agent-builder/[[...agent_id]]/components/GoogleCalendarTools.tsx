import React, { useEffect, useState } from "react";
import { agentBuilderStore } from "@/store/AgentBuilderStore";
import { integrationsStore } from "@/store/IntegrationsStore";
import { Heading, Text, Button, Flex, Select, FormControl, FormLabel, Alert, AlertIcon, Box } from "@chakra-ui/react";
import { CodeSnippet } from "@/app/components/CodeSnippet";
import { observer } from "mobx-react-lite";
import { Integration } from "@/types/integration";

export const GoogleCalendarTools = observer(() => {
    const [selectedIntegrationId, setSelectedIntegrationId] = useState<string>("");
    const [isLoading, setIsLoading] = useState<boolean>(true);

    // Use-case based tool groupings
    const readOnlyTools = ["list_calendar_events", "get_calendar_event", "list_calendars"];
    const manageTools = ["create_calendar_event", "update_calendar_event"];
    const deleteTools = ["delete_calendar_event"];

    // Check if each tool group is enabled
    const hasReadOnly = readOnlyTools.some(tool =>
        agentBuilderStore.currentAgent.tools?.some(agentTool => agentTool === tool)
    );

    const hasManage = manageTools.some(tool =>
        agentBuilderStore.currentAgent.tools?.some(agentTool => agentTool === tool)
    );

    const hasDelete = deleteTools.some(tool =>
        agentBuilderStore.currentAgent.tools?.some(agentTool => agentTool === tool)
    );

    const hasAnyCalendarTools = hasReadOnly || hasManage || hasDelete;

    useEffect(() => {
        loadIntegrations();
    }, []);

    const loadIntegrations = async () => {
        try {
            setIsLoading(true);
            await integrationsStore.loadIntegrations();
            const calendarIntegrations = integrationsStore.getGoogleCalendarIntegrations();
            if (calendarIntegrations.length > 0 && !selectedIntegrationId) {
                setSelectedIntegrationId(calendarIntegrations[0].integration_id);
            }
        } finally {
            setIsLoading(false);
        }
    };

    const toggleToolGroup = (tools: string[], isEnabled: boolean) => {
        if (isEnabled) {
            tools.forEach(tool => {
                agentBuilderStore.removeTool({ tool_id: tool, org_id: "default", name: tool });
            });
        } else {
            tools.forEach(tool => {
                agentBuilderStore.addTool({ tool_id: tool, org_id: "default", name: tool });
            });
        }
    };

    const toggleReadOnly = () => toggleToolGroup(readOnlyTools, hasReadOnly);
    const toggleManage = () => toggleToolGroup(manageTools, hasManage);
    const toggleDelete = () => toggleToolGroup(deleteTools, hasDelete);

    const calendarIntegrations = integrationsStore.getGoogleCalendarIntegrations();
    const selectedIntegration = calendarIntegrations.find((i: Integration) => i.integration_id === selectedIntegrationId);

    const getExamplePrompt = () => {
        if (!selectedIntegration) return "";

        const capabilities: string[] = [];
        
        if (hasReadOnly) {
            capabilities.push("view calendar events and list calendars");
        }
        if (hasManage) {
            capabilities.push("create and update calendar events");
        }
        if (hasDelete) {
            capabilities.push("delete calendar events");
        }

        const capabilityText = capabilities.length > 0 
            ? `You can ${capabilities.join("; ")}.`
            : "";

        const warningText = hasDelete 
            ? "\n\nWARNING: You have access to delete calendar events. Use delete_calendar_event with caution as it permanently removes events and cannot be undone."
            : "";

        return `You have access to a Google Calendar account (${selectedIntegration.integration_config.email}). ${capabilityText}

When using Google Calendar tools, always use the integration_id: ${selectedIntegration.integration_id}${warningText}`;
    };

    return (
        <Flex direction="column" gap={4} pb={4}>
            <Flex direction="row" justify="space-between" align="center" flexWrap="wrap" gap={2}>
                <Heading size="md">Google Calendar Tools</Heading>
            </Flex>

            {/* Tool Toggle Buttons */}
            <Flex gap={2} flexWrap="wrap">
                <Button
                    onClick={toggleReadOnly}
                    colorScheme={hasReadOnly ? "purple" : "gray"}
                    variant={hasReadOnly ? "solid" : "outline"}
                    size="sm"
                >
                    {hasReadOnly ? "Remove" : "Add"} Read-only
                </Button>
                <Button
                    onClick={toggleManage}
                    colorScheme={hasManage ? "purple" : "gray"}
                    variant={hasManage ? "solid" : "outline"}
                    size="sm"
                >
                    {hasManage ? "Remove" : "Add"} Manage Events
                </Button>
                <Button
                    onClick={toggleDelete}
                    colorScheme={hasDelete ? "red" : "gray"}
                    variant={hasDelete ? "solid" : "outline"}
                    size="sm"
                >
                    {hasDelete ? "Remove" : "Add"} Delete
                </Button>
            </Flex>

            <Text fontWeight="bold">Description</Text>
            <Text>
                Google Calendar Tools allow your agent to interact with a connected Google Calendar account.
                Enable tool groups based on your use case - each level adds more capabilities.
            </Text>

            {/* Warning about integration requirement */}
            <Alert status="info" borderRadius="md">
                <AlertIcon />
                <Box>
                    <Text fontWeight="bold">Integration Required</Text>
                    <Text fontSize="sm">
                        Google Calendar tools require a connected Google Calendar account. Use <code>{'{google_calendar_integration_id}'}</code> in 
                        your prompt and pass the actual integration ID via <code>prompt_args</code> when creating a context.
                    </Text>
                </Box>
            </Alert>

            {/* Warning for Delete tools */}
            {hasDelete && (
                <Alert status="warning" borderRadius="md">
                    <AlertIcon />
                    <Box>
                        <Text fontWeight="bold">Destructive Operations Enabled</Text>
                        <Text fontSize="sm">
                            Delete includes <code>delete_calendar_event</code> which <strong>permanently deletes events</strong> and cannot be undone.
                        </Text>
                    </Box>
                </Alert>
            )}

            {/* Integration Selection */}
            {!isLoading && calendarIntegrations.length > 0 && (
                <FormControl>
                    <FormLabel>Select Google Calendar Integration</FormLabel>
                    <Select
                        value={selectedIntegrationId || ""}
                        onChange={(e) => setSelectedIntegrationId(e.target.value)}
                        placeholder="Choose a Google Calendar integration"
                    >
                        {calendarIntegrations.map((integration: Integration) => (
                            <option key={integration.integration_id} value={integration.integration_id}>
                                {integration.integration_config.email} ({integration.integration_id})
                            </option>
                        ))}
                    </Select>
                </FormControl>
            )}

            {!isLoading && calendarIntegrations.length === 0 && (
                <Alert status="warning" borderRadius="md">
                    <AlertIcon />
                    <Text>
                        No Google Calendar accounts connected. Go to <strong>Integrations</strong> to connect a Google Calendar account first.
                    </Text>
                </Alert>
            )}

            {/* Calendar Tools Information */}
            {hasAnyCalendarTools && (
                <>
                    <Text fontWeight="bold">Available Tools</Text>
                    {hasReadOnly && (
                        <Text>
                            <strong>Read-only:</strong> list_calendar_events, get_calendar_event, list_calendars
                        </Text>
                    )}
                    {hasManage && (
                        <Text>
                            <strong>Manage Events:</strong> create_calendar_event, update_calendar_event
                        </Text>
                    )}
                    {hasDelete && (
                        <Text>
                            <strong>Delete:</strong> <Text as="span" color="red.500">delete_calendar_event</Text>
                        </Text>
                    )}
                </>
            )}

            {/* Example Prompt */}
            {selectedIntegration && hasAnyCalendarTools && (
                <>
                    <Text fontWeight="bold">Example Prompt Addition</Text>
                    <Text fontSize="sm">
                        Add this to your agent prompt and enable &quot;Uses Prompt Args&quot; to use Google Calendar tools:
                    </Text>
                    <CodeSnippet language="text" code={getExamplePrompt()} />
                </>
            )}
        </Flex>
    );
});

