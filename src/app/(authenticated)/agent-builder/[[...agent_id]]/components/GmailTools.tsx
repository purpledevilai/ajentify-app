import React, { useEffect, useState } from "react";
import { agentBuilderStore } from "@/store/AgentBuilderStore";
import { integrationsStore } from "@/store/IntegrationsStore";
import { Heading, Text, Button, Flex, Select, FormControl, FormLabel, Alert, AlertIcon, Box } from "@chakra-ui/react";
import { CodeSnippet } from "@/app/components/CodeSnippet";
import { observer } from "mobx-react-lite";
import { Integration } from "@/types/integration";

export const GmailTools = observer(() => {
    const [selectedIntegrationId, setSelectedIntegrationId] = useState<string>("");
    const [isLoading, setIsLoading] = useState<boolean>(true);

    const gmailReadTools = ["list_emails", "get_email"];
    const gmailWriteTools = ["send_email"];
    const gmailManageTools = ["mark_email_read", "mark_email_unread"];

    const hasReadTools = gmailReadTools.some(tool =>
        agentBuilderStore.currentAgent.tools?.some(agentTool => agentTool === tool)
    );

    const hasWriteTools = gmailWriteTools.some(tool =>
        agentBuilderStore.currentAgent.tools?.some(agentTool => agentTool === tool)
    );

    const hasManageTools = gmailManageTools.some(tool =>
        agentBuilderStore.currentAgent.tools?.some(agentTool => agentTool === tool)
    );

    useEffect(() => {
        loadIntegrations();
    }, []);

    const loadIntegrations = async () => {
        try {
            setIsLoading(true);
            await integrationsStore.loadIntegrations();
            const gmailIntegrations = integrationsStore.getGmailIntegrations();
            if (gmailIntegrations.length > 0 && !selectedIntegrationId) {
                setSelectedIntegrationId(gmailIntegrations[0].integration_id);
            }
        } finally {
            setIsLoading(false);
        }
    };

    const toggleReadTools = () => {
        if (hasReadTools) {
            gmailReadTools.forEach(tool => {
                agentBuilderStore.removeTool({ tool_id: tool, org_id: "default", name: tool });
            });
        } else {
            gmailReadTools.forEach(tool => {
                agentBuilderStore.addTool({ tool_id: tool, org_id: "default", name: tool });
            });
        }
    };

    const toggleWriteTools = () => {
        if (hasWriteTools) {
            gmailWriteTools.forEach(tool => {
                agentBuilderStore.removeTool({ tool_id: tool, org_id: "default", name: tool });
            });
        } else {
            gmailWriteTools.forEach(tool => {
                agentBuilderStore.addTool({ tool_id: tool, org_id: "default", name: tool });
            });
        }
    };

    const toggleManageTools = () => {
        if (hasManageTools) {
            gmailManageTools.forEach(tool => {
                agentBuilderStore.removeTool({ tool_id: tool, org_id: "default", name: tool });
            });
        } else {
            gmailManageTools.forEach(tool => {
                agentBuilderStore.addTool({ tool_id: tool, org_id: "default", name: tool });
            });
        }
    };

    const gmailIntegrations = integrationsStore.getGmailIntegrations();
    const selectedIntegration = gmailIntegrations.find((i: Integration) => i.integration_id === selectedIntegrationId);
    const hasAnyGmailTools = hasReadTools || hasWriteTools || hasManageTools;

    const getExamplePrompt = () => {
        if (!selectedIntegration) return "";

        return `You have access to a Gmail account (${selectedIntegration.integration_config.email}). ${hasReadTools ? "You can list and read emails. " : ""}${hasWriteTools ? "You can send emails. " : ""}${hasManageTools ? "You can mark emails as read or unread." : ""}

When using Gmail tools, always use the integration_id: ${selectedIntegration.integration_id}`;
    };

    return (
        <Flex direction="column" gap={4} pb={4}>
            <Flex direction="row" justify="space-between" align="center" flexWrap="wrap" gap={2}>
                <Heading size="md">Gmail Tools</Heading>
                <Flex gap={2} flexWrap="wrap">
                    <Button
                        onClick={toggleReadTools}
                        colorScheme={hasReadTools ? "purple" : "gray"}
                        variant={hasReadTools ? "solid" : "outline"}
                        size="sm"
                    >
                        {hasReadTools ? "Remove" : "Add"} Read
                    </Button>
                    <Button
                        onClick={toggleWriteTools}
                        colorScheme={hasWriteTools ? "purple" : "gray"}
                        variant={hasWriteTools ? "solid" : "outline"}
                        size="sm"
                    >
                        {hasWriteTools ? "Remove" : "Add"} Send
                    </Button>
                    <Button
                        onClick={toggleManageTools}
                        colorScheme={hasManageTools ? "purple" : "gray"}
                        variant={hasManageTools ? "solid" : "outline"}
                        size="sm"
                    >
                        {hasManageTools ? "Remove" : "Add"} Manage
                    </Button>
                </Flex>
            </Flex>

            <Text fontWeight="bold">Description</Text>
            <Text>
                Gmail Tools allow your agent to interact with a connected Gmail account.
                The agent can read emails, send emails, and manage email status (mark as read/unread).
            </Text>

            {/* Warning about integration requirement */}
            <Alert status="info" borderRadius="md">
                <AlertIcon />
                <Box>
                    <Text fontWeight="bold">Integration Required</Text>
                    <Text fontSize="sm">
                        Gmail tools require a connected Gmail account. Use <code>{'{gmail_integration_id}'}</code> in 
                        your prompt and pass the actual integration ID via <code>prompt_args</code> when creating a context.
                    </Text>
                </Box>
            </Alert>

            {/* Integration Selection */}
            {!isLoading && gmailIntegrations.length > 0 && (
                <FormControl>
                    <FormLabel>Select Gmail Integration</FormLabel>
                    <Select
                        value={selectedIntegrationId || ""}
                        onChange={(e) => setSelectedIntegrationId(e.target.value)}
                        placeholder="Choose a Gmail integration"
                    >
                        {gmailIntegrations.map((integration: Integration) => (
                            <option key={integration.integration_id} value={integration.integration_id}>
                                {integration.integration_config.email} ({integration.integration_id})
                            </option>
                        ))}
                    </Select>
                </FormControl>
            )}

            {!isLoading && gmailIntegrations.length === 0 && (
                <Alert status="warning" borderRadius="md">
                    <AlertIcon />
                    <Text>
                        No Gmail accounts connected. Go to <strong>Integrations</strong> to connect a Gmail account first.
                    </Text>
                </Alert>
            )}

            {/* Gmail Tools Information */}
            {hasAnyGmailTools && (
                <>
                    <Text fontWeight="bold">Available Tools</Text>
                    {hasReadTools && (
                        <Text>
                            <strong>Read:</strong> list_emails, get_email
                        </Text>
                    )}
                    {hasWriteTools && (
                        <Text>
                            <strong>Send:</strong> send_email
                        </Text>
                    )}
                    {hasManageTools && (
                        <Text>
                            <strong>Manage:</strong> mark_email_read, mark_email_unread
                        </Text>
                    )}
                </>
            )}

            {/* Example Prompt */}
            {selectedIntegration && hasAnyGmailTools && (
                <>
                    <Text fontWeight="bold">Example Prompt Addition</Text>
                    <Text fontSize="sm">
                        Add this to your agent prompt and enable &quot;Uses Prompt Args&quot; to use Gmail tools:
                    </Text>
                    <CodeSnippet language="text" code={getExamplePrompt()} />
                </>
            )}
        </Flex>
    );
});

