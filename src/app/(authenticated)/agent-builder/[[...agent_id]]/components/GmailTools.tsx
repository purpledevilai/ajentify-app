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

    // Use-case based tool groupings (cumulative)
    const readOnlyTools = ["list_emails", "get_email", "list_labels"];
    const basicManageTools = ["set_email_read_status", "archive_email", "modify_email_labels"];
    const sendTools = ["send_email"];
    const draftTools = ["create_draft", "list_drafts", "get_draft", "update_draft", "send_draft", "delete_draft"];
    const fullManageTools = ["trash_email", "untrash_email", "delete_email"];

    // Check if each tool group is enabled
    const hasReadOnly = readOnlyTools.some(tool =>
        agentBuilderStore.currentAgent.tools?.some(agentTool => agentTool === tool)
    );

    const hasBasicManage = basicManageTools.some(tool =>
        agentBuilderStore.currentAgent.tools?.some(agentTool => agentTool === tool)
    );

    const hasSend = sendTools.some(tool =>
        agentBuilderStore.currentAgent.tools?.some(agentTool => agentTool === tool)
    );

    const hasDrafts = draftTools.some(tool =>
        agentBuilderStore.currentAgent.tools?.some(agentTool => agentTool === tool)
    );

    const hasFullManage = fullManageTools.some(tool =>
        agentBuilderStore.currentAgent.tools?.some(agentTool => agentTool === tool)
    );

    const hasAnyGmailTools = hasReadOnly || hasBasicManage || hasSend || hasDrafts || hasFullManage;

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
    const toggleBasicManage = () => toggleToolGroup(basicManageTools, hasBasicManage);
    const toggleSend = () => toggleToolGroup(sendTools, hasSend);
    const toggleDrafts = () => toggleToolGroup(draftTools, hasDrafts);
    const toggleFullManage = () => toggleToolGroup(fullManageTools, hasFullManage);

    const gmailIntegrations = integrationsStore.getGmailIntegrations();
    const selectedIntegration = gmailIntegrations.find((i: Integration) => i.integration_id === selectedIntegrationId);

    const getExamplePrompt = () => {
        if (!selectedIntegration) return "";

        const capabilities: string[] = [];
        
        if (hasReadOnly) {
            capabilities.push("list and read emails, and view labels");
        }
        if (hasBasicManage) {
            capabilities.push("mark emails as read/unread, archive emails, and modify labels");
        }
        if (hasSend) {
            capabilities.push("send emails");
        }
        if (hasDrafts) {
            capabilities.push("create, manage, and send draft emails");
        }
        if (hasFullManage) {
            capabilities.push("trash, restore, and permanently delete emails");
        }

        const capabilityText = capabilities.length > 0 
            ? `You can ${capabilities.join("; ")}.`
            : "";

        const warningText = hasFullManage 
            ? "\n\nWARNING: You have access to destructive operations. Use delete_email with extreme caution as it permanently deletes emails and cannot be undone. Prefer trash_email which allows recovery within 30 days."
            : "";

        return `You have access to a Gmail account (${selectedIntegration.integration_config.email}). ${capabilityText}

When using Gmail tools, always use the integration_id: ${selectedIntegration.integration_id}${warningText}`;
    };

    return (
        <Flex direction="column" gap={4} pb={4}>
            <Flex direction="row" justify="space-between" align="center" flexWrap="wrap" gap={2}>
                <Heading size="md">Gmail Tools</Heading>
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
                    onClick={toggleBasicManage}
                    colorScheme={hasBasicManage ? "purple" : "gray"}
                    variant={hasBasicManage ? "solid" : "outline"}
                    size="sm"
                >
                    {hasBasicManage ? "Remove" : "Add"} Basic Manage
                </Button>
                <Button
                    onClick={toggleSend}
                    colorScheme={hasSend ? "purple" : "gray"}
                    variant={hasSend ? "solid" : "outline"}
                    size="sm"
                >
                    {hasSend ? "Remove" : "Add"} Send
                </Button>
                <Button
                    onClick={toggleDrafts}
                    colorScheme={hasDrafts ? "purple" : "gray"}
                    variant={hasDrafts ? "solid" : "outline"}
                    size="sm"
                >
                    {hasDrafts ? "Remove" : "Add"} Drafts
                </Button>
                <Button
                    onClick={toggleFullManage}
                    colorScheme={hasFullManage ? "red" : "gray"}
                    variant={hasFullManage ? "solid" : "outline"}
                    size="sm"
                >
                    {hasFullManage ? "Remove" : "Add"} Full Manage
                </Button>
            </Flex>

            <Text fontWeight="bold">Description</Text>
            <Text>
                Gmail Tools allow your agent to interact with a connected Gmail account.
                Enable tool groups based on your use case - each level adds more capabilities.
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

            {/* Warning for Full Management tools */}
            {hasFullManage && (
                <Alert status="warning" borderRadius="md">
                    <AlertIcon />
                    <Box>
                        <Text fontWeight="bold">Destructive Operations Enabled</Text>
                        <Text fontSize="sm">
                            Full Management includes <code>delete_email</code> which <strong>permanently deletes emails</strong> and cannot be undone.
                            Consider using <code>trash_email</code> instead, which allows recovery within 30 days.
                        </Text>
                    </Box>
                </Alert>
            )}

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
                    {hasReadOnly && (
                        <Text>
                            <strong>Read-only:</strong> list_emails, get_email, list_labels
                        </Text>
                    )}
                    {hasBasicManage && (
                        <Text>
                            <strong>Basic Management:</strong> set_email_read_status, archive_email, modify_email_labels
                        </Text>
                    )}
                    {hasSend && (
                        <Text>
                            <strong>Send:</strong> send_email
                        </Text>
                    )}
                    {hasDrafts && (
                        <Text>
                            <strong>Drafts:</strong> create_draft, list_drafts, get_draft, update_draft, send_draft, delete_draft
                        </Text>
                    )}
                    {hasFullManage && (
                        <Text>
                            <strong>Full Management:</strong> trash_email, untrash_email, <Text as="span" color="red.500">delete_email</Text>
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
