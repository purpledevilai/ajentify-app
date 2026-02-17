import React, { useEffect, useState } from "react";
import { agentBuilderStore } from "@/store/AgentBuilderStore";
import { integrationsStore } from "@/store/IntegrationsStore";
import { Heading, Text, Button, Flex, Select, FormControl, FormLabel, Alert, AlertIcon, Box } from "@chakra-ui/react";
import { CodeSnippet } from "@/app/components/CodeSnippet";
import { observer } from "mobx-react-lite";
import { Integration } from "@/types/integration";

export const OutlookTools = observer(() => {
    const [selectedIntegrationId, setSelectedIntegrationId] = useState<string>("");
    const [isLoading, setIsLoading] = useState<boolean>(true);

    // Use-case based tool groupings (cumulative)
    const readOnlyTools = ["list_outlook_emails", "get_outlook_email", "list_outlook_folders"];
    const basicManageTools = ["set_outlook_email_read_status", "archive_outlook_email", "move_outlook_email", "modify_outlook_email_categories"];
    const sendTools = ["send_outlook_email", "reply_outlook_email", "reply_all_outlook_email"];
    const draftTools = ["create_outlook_draft", "list_outlook_drafts", "get_outlook_draft", "update_outlook_draft", "send_outlook_draft", "delete_outlook_draft", "create_outlook_reply_draft", "create_outlook_reply_all_draft"];
    const fullManageTools = ["trash_outlook_email", "untrash_outlook_email", "delete_outlook_email", "create_outlook_folder", "delete_outlook_folder"];

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

    const hasAnyOutlookTools = hasReadOnly || hasBasicManage || hasSend || hasDrafts || hasFullManage;

    useEffect(() => {
        loadIntegrations();
    }, []);

    const loadIntegrations = async () => {
        try {
            setIsLoading(true);
            await integrationsStore.loadIntegrations();
            const outlookIntegrations = integrationsStore.getOutlookIntegrations();
            if (outlookIntegrations.length > 0 && !selectedIntegrationId) {
                setSelectedIntegrationId(outlookIntegrations[0].integration_id);
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

    const outlookIntegrations = integrationsStore.getOutlookIntegrations();
    const selectedIntegration = outlookIntegrations.find((i: Integration) => i.integration_id === selectedIntegrationId);

    const getExamplePrompt = () => {
        if (!selectedIntegration) return "";

        const capabilities: string[] = [];
        
        if (hasReadOnly) {
            capabilities.push("list and read emails, and view folders");
        }
        if (hasBasicManage) {
            capabilities.push("mark emails as read/unread, archive emails, move emails between folders, and modify categories");
        }
        if (hasSend) {
            capabilities.push("send emails and reply to emails");
        }
        if (hasDrafts) {
            capabilities.push("create, manage, and send draft emails including reply drafts");
        }
        if (hasFullManage) {
            capabilities.push("trash, restore, permanently delete emails, and manage folders");
        }

        const capabilityText = capabilities.length > 0 
            ? `You can ${capabilities.join("; ")}.`
            : "";

        const warningText = hasFullManage 
            ? "\n\nWARNING: You have access to destructive operations. Use delete_outlook_email with extreme caution as it permanently deletes emails and cannot be undone. Prefer trash_outlook_email which allows recovery from Deleted Items."
            : "";

        return `You have access to an Outlook account (${selectedIntegration.integration_config.email}). ${capabilityText}

When using Outlook tools, always use the integration_id: ${selectedIntegration.integration_id}${warningText}`;
    };

    return (
        <Flex direction="column" gap={4} pb={4}>
            <Flex direction="row" justify="space-between" align="center" flexWrap="wrap" gap={2}>
                <Heading size="md">Outlook Tools</Heading>
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
                Outlook Tools allow your agent to interact with a connected Outlook account.
                Enable tool groups based on your use case - each level adds more capabilities.
            </Text>

            {/* Warning about integration requirement */}
            <Alert status="info" borderRadius="md">
                <AlertIcon />
                <Box>
                    <Text fontWeight="bold">Integration Required</Text>
                    <Text fontSize="sm">
                        Outlook tools require a connected Outlook account. Use <code>{'{outlook_integration_id}'}</code> in 
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
                            Full Management includes <code>delete_outlook_email</code> which <strong>permanently deletes emails</strong> and cannot be undone.
                            Consider using <code>trash_outlook_email</code> instead, which allows recovery from Deleted Items.
                        </Text>
                    </Box>
                </Alert>
            )}

            {/* Integration Selection */}
            {!isLoading && outlookIntegrations.length > 0 && (
                <FormControl>
                    <FormLabel>Select Outlook Integration</FormLabel>
                    <Select
                        value={selectedIntegrationId || ""}
                        onChange={(e) => setSelectedIntegrationId(e.target.value)}
                        placeholder="Choose an Outlook integration"
                    >
                        {outlookIntegrations.map((integration: Integration) => (
                            <option key={integration.integration_id} value={integration.integration_id}>
                                {integration.integration_config.email} ({integration.integration_id})
                            </option>
                        ))}
                    </Select>
                </FormControl>
            )}

            {!isLoading && outlookIntegrations.length === 0 && (
                <Alert status="warning" borderRadius="md">
                    <AlertIcon />
                    <Text>
                        No Outlook accounts connected. Go to <strong>Integrations</strong> to connect an Outlook account first.
                    </Text>
                </Alert>
            )}

            {/* Outlook Tools Information */}
            {hasAnyOutlookTools && (
                <>
                    <Text fontWeight="bold">Available Tools</Text>
                    {hasReadOnly && (
                        <Text>
                            <strong>Read-only:</strong> list_outlook_emails, get_outlook_email, list_outlook_folders
                        </Text>
                    )}
                    {hasBasicManage && (
                        <Text>
                            <strong>Basic Management:</strong> set_outlook_email_read_status, archive_outlook_email, move_outlook_email, modify_outlook_email_categories
                        </Text>
                    )}
                    {hasSend && (
                        <Text>
                            <strong>Send:</strong> send_outlook_email, reply_outlook_email, reply_all_outlook_email
                        </Text>
                    )}
                    {hasDrafts && (
                        <Text>
                            <strong>Drafts:</strong> create_outlook_draft, list_outlook_drafts, get_outlook_draft, update_outlook_draft, send_outlook_draft, delete_outlook_draft, create_outlook_reply_draft, create_outlook_reply_all_draft
                        </Text>
                    )}
                    {hasFullManage && (
                        <Text>
                            <strong>Full Management:</strong> trash_outlook_email, untrash_outlook_email, <Text as="span" color="red.500">delete_outlook_email</Text>, create_outlook_folder, delete_outlook_folder
                        </Text>
                    )}
                </>
            )}

            {/* Example Prompt */}
            {selectedIntegration && hasAnyOutlookTools && (
                <>
                    <Text fontWeight="bold">Example Prompt Addition</Text>
                    <Text fontSize="sm">
                        Add this to your agent prompt and enable &quot;Uses Prompt Args&quot; to use Outlook tools:
                    </Text>
                    <CodeSnippet language="text" code={getExamplePrompt()} />
                </>
            )}
        </Flex>
    );
});

