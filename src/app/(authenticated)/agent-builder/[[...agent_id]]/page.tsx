'use client';

import React, { useEffect, useRef } from "react";
import { useNavigationGuard } from "next-navigation-guard";
import {
    Flex, Text, FormControl, Heading, IconButton, Input, Switch, Textarea, Button, Tooltip,
    useDisclosure, Modal, ModalBody, ModalCloseButton, ModalContent, ModalHeader, ModalOverlay,
    useColorMode,
    useClipboard
} from "@chakra-ui/react";
import { ArrowBackIcon, CheckIcon, CopyIcon } from "@chakra-ui/icons";
import ChatBox, { defaultChatBoxStyle, defaultDarkChatBoxStyle } from "@/app/components/chatbox/ChatBox";
import { FormLabelToolTip } from "@/app/components/FormLableToolTip";
import { agentBuilderStore } from "@/store/AgentBuilderStore";
import { agentsStore } from "@/store/AgentsStore";
import { ContentOrSpinner } from "@/app/components/ContentOrSpinner";
import { useAlert } from "@/app/components/AlertProvider";
import { ChatEvent } from "@/types/chatresponse";
import { observer } from "mobx-react-lite";

type Params = Promise<{ agent_id: string[] }>;

interface AgentBuilderPageProps {
    params: Params;
}

const AgentBuilderPage = observer(({ params }: AgentBuilderPageProps) => {

    // Nav Guard to detect page navigation - Really dump NextJS limitiation
    const navGuard = useNavigationGuard({});
    const isShowingNavAlert = useRef(false);

    const chatBoxStyle = useColorMode().colorMode === 'dark' ? defaultDarkChatBoxStyle : defaultChatBoxStyle;
    const { isOpen: isTestingAgentModalOpen, onOpen: onOpenTestingAgentModal, onClose: onCloseTesingAgentModal } = useDisclosure();
    const { isOpen: isPromptEngineerModalOpen, onOpen: onOpenPromptEngineerModal, onClose: onClosePromptEngineerModal } = useDisclosure();
    const { hasCopied, onCopy } = useClipboard(agentBuilderStore.showAgentId ? agentBuilderStore.currentAgent.agent_id : '');
    const { showAlert } = useAlert();

    useEffect(() => {
        setShowAlertOnStore();
        loadAgentId();
    });

    const setShowAlertOnStore = () => {
        agentBuilderStore.setShowAlert(showAlert);
    }

    const loadAgentId = async () => {
        const paramArray = (await params).agent_id ?? undefined;
        const agent_id = paramArray ? paramArray[0] : undefined;
        if (agent_id) {
            if (agentBuilderStore.currentAgent.agent_id !== agent_id) {
                agentBuilderStore.setCurrentAgentWithId(agent_id)
            }
        }
    }

    // Detect page navigation
    useEffect(() => {
        if (navGuard.active && !isShowingNavAlert.current) {
            isShowingNavAlert.current = true;
            const stayOnPage = () => {
                isShowingNavAlert.current = false;
                navGuard.reject();
            }
            const leavePage = async () => {
                if (agentBuilderStore.isNewAgent && agentBuilderStore.currentAgent.agent_id) {
                    // Delete the agent if it's new and not saved
                    await agentBuilderStore.deleteAgent();
                    agentsStore.loadAgents(true);
                }
                if (agentBuilderStore.agentContext) {
                    // Delete the agent context if it exists
                    await agentBuilderStore.deleteAgentContext();
                }
                if (agentBuilderStore.promptEngineerContext) {
                    // Delete the prompt engineer context if it exists
                    await agentBuilderStore.deletePromptEngineerContext();
                }
                agentBuilderStore.reset();
                navGuard.accept();
            }
            if (agentBuilderStore.hasUpdates) {
                // Unsaved changes alert
                showAlert({
                    title: "Unsaved Changes",
                    message: "You have unsaved changes. Are you sure you want to leave?",
                    actions: [
                        { label: "Cancel", onClick: stayOnPage },
                        { label: "Leave", onClick: leavePage }
                    ]
                })
            } else {
                leavePage();
            }
        }
    }, [navGuard, showAlert]);

    const onOpenPromptEngineerClick = () => {
        agentBuilderStore.createPromptEngineerContext();
        onOpenPromptEngineerModal();
    }

    const onChatEvents = (chatEvents: ChatEvent[]) => {
        chatEvents.forEach(chatEvent => {
            if (chatEvent.type === 'set_name') {
                agentBuilderStore.setStringField("agent_name", chatEvent.data);
            }
            if (chatEvent.type === 'set_description') {
                agentBuilderStore.setStringField("agent_description", chatEvent.data);
            }
            if (chatEvent.type === 'set_prompt') {
                agentBuilderStore.setStringField("prompt", chatEvent.data);
            }
        });
    };

    const onTestAgent = async () => {
        onOpenTestingAgentModal();
        agentBuilderStore.onTestAgentClick();
    };

    const onSaveAgent = async () => {
        await agentBuilderStore.onSaveAgentClick();
        agentsStore.loadAgents(true);
        // Navigate back
        window.history.back();
    }

    const onDeleteAgentClick = async () => {
        showAlert({
            title: "Delete Agent",
            message: "Are you sure you want to delete this agent?",
            actions: [
                { label: "Cancel", onClick: () => { } },
                {
                    label: "Delete", onClick: async () => {
                        await agentBuilderStore.deleteAgent();
                        agentBuilderStore.reset();
                        agentsStore.loadAgents(true);
                        // Navigate back
                        window.history.back();
                    }
                }
            ]
        })
    }

    const beforeCloseTestAgentModal = () => {
        agentBuilderStore.deleteAgentContext();
        onCloseTesingAgentModal();
    }

    const beforeClosePromptEngineerModal = () => {
        agentBuilderStore.deletePromptEngineerContext();
        onClosePromptEngineerModal();
    }


    return (
        <Flex p={4} direction="column" alignItems="center" h="100%" w="100%">
            {/* Header Section */}
            <Flex direction="row" w="100%" mb={8} gap={4} align="center">
                <IconButton
                    aria-label="Back"
                    icon={<ArrowBackIcon />}
                    variant="ghost"
                    color="inherit"
                    _hover={{ bg: 'gray.200', _dark: { bg: 'gray.700' } }}
                    onClick={() => window.history.back()}
                />
                <Heading flex="1">Agent Builder</Heading>
                <Tooltip
                    isDisabled={agentBuilderStore.currentAgent.prompt !== ''}
                    label="You must set an agent prompt first before testing"
                    fontSize="md"
                >
                    <Button
                        disabled={agentBuilderStore.currentAgent.prompt === ''}
                        onClick={onTestAgent}
                    >
                        Test Agent
                    </Button>
                </Tooltip>
            </Flex>

            {/* Agent Form */}
            <Flex direction="column" w="100%" h="100%" maxW={800} gap={8}>
                {/* Agent ID */}
                {agentBuilderStore.showAgentId && (
                    <FormControl>
                        <FormLabelToolTip
                            label="Agent ID"
                            tooltip="The unique identifier for the agent"
                        />
                        <Flex direction="row" align="center" gap={4}>
                            <Text>{agentBuilderStore.currentAgent.agent_id}</Text>
                            <Button
                                size="sm"
                                onClick={onCopy}
                                leftIcon={hasCopied ? <CheckIcon /> : <CopyIcon />}
                                colorScheme={hasCopied ? 'green' : 'blue'}
                                variant="ghost"
                            >
                                {hasCopied ? 'Copied' : 'Copy'}
                            </Button>
                        </Flex>
                    </FormControl>
                )}
                {/* Agent Name */}
                <FormControl>
                    <FormLabelToolTip
                        label="Agent Name"
                        tooltip="The name the agent will refer itself to"
                    />
                    <Input
                        mt={2}
                        placeholder="Domingo"
                        value={agentBuilderStore.currentAgent.agent_name}
                        onChange={(e) => agentBuilderStore.setStringField("agent_name", e.target.value)}
                    />
                </FormControl>
                {/* Agent Description */}
                <FormControl>
                    <FormLabelToolTip
                        label="Agent Description"
                        tooltip="Short description for your reference. Not public."
                    />
                    <Input
                        mt={2}
                        placeholder="A friendly agent that helps you with your daily tasks."
                        value={agentBuilderStore.currentAgent.agent_description}
                        onChange={(e) => agentBuilderStore.setStringField("agent_description", e.target.value)}
                    />
                </FormControl>
                {/* Toggles */}
                <Flex direction="row" w="100%" justifyContent="flex-start" align="center" gap={12}>
                    <FormControl width="auto">
                        <FormLabelToolTip
                            label="Public Agent"
                            tooltip="If not public, only you and your organization can talk to this agent"
                        />
                        <Switch
                            mt={2}
                            colorScheme="purple"
                            size="lg"
                            isChecked={agentBuilderStore.currentAgent.is_public}
                            onChange={(e) => agentBuilderStore.setBooleanField("is_public", e.target.checked)}
                        />
                    </FormControl>
                    <FormControl width="auto">
                        <FormLabelToolTip
                            label="Agent Speaks First"
                            tooltip="When a new context with this agent is created, the agent will generate the first message."
                        />
                        <Switch
                            mt={2}
                            colorScheme="purple"
                            size="lg"
                            isChecked={agentBuilderStore.currentAgent.agent_speaks_first}
                            onChange={(e) => agentBuilderStore.setBooleanField("agent_speaks_first", e.target.checked)}
                        />
                    </FormControl>
                </Flex>
                {/* Agent Prompt */}
                <FormControl>
                    <Flex direction="row" justifyContent="space-between" w="100%">
                        <FormLabelToolTip
                            label="Agent Prompt"
                            tooltip="The prompt sets the Agent's behavior, tone, and expertise."
                        />
                        <Button size="sm" onClick={onOpenPromptEngineerClick}>Open Prompt Engineer</Button>
                    </Flex>

                    <Textarea
                        placeholder="You are an expert at..."
                        mt={2}
                        borderColor="gray.300"
                        _hover={{ borderColor: 'gray.400' }}
                        focusBorderColor="gray.500"
                        value={agentBuilderStore.currentAgent.prompt}
                        onChange={(e) => agentBuilderStore.setStringField("prompt", e.target.value)}
                        h="50vh"
                    />
                </FormControl>
                {/* Save Button */}
                <Tooltip
                    isDisabled={!(!agentBuilderStore.currentAgent.agent_name || !agentBuilderStore.currentAgent.prompt)}
                    label="You must set an agent name and prompt before saving"
                    fontSize="md"
                >
                    <Button
                        onClick={onSaveAgent}
                        colorScheme="purple"
                        size="lg"
                        disabled={!agentBuilderStore.currentAgent.agent_name || !agentBuilderStore.currentAgent.prompt}
                        isLoading={agentBuilderStore.agentLoading || agentsStore.agentsLoading}
                    >Save</Button>
                </Tooltip>
                {/* Delete Button */}
                {agentBuilderStore.showDeleteButton && (
                    <Button
                        onClick={onDeleteAgentClick}
                        variant="outline"
                        size="lg"
                        isLoading={agentBuilderStore.agentDeleteLoading}
                    >Delete Agent</Button>
                )}
            </Flex>

            {/* Prompt engineer modal */}
            <Modal isOpen={isPromptEngineerModalOpen} onClose={beforeClosePromptEngineerModal} size="2xl">
                <ModalOverlay />
                <ModalContent>
                    <ModalHeader>Prompt Engineer</ModalHeader>
                    <ModalCloseButton />
                    <ModalBody>
                        <Flex h="70vh" w="100%">
                            <ContentOrSpinner showSpinner={agentBuilderStore.promptEngineerContextLoading}>
                                {agentBuilderStore.promptEngineerContext &&
                                    <ChatBox
                                        context={agentBuilderStore.promptEngineerContext}
                                        style={chatBoxStyle}
                                        onEvents={onChatEvents}
                                    />
                                }
                            </ContentOrSpinner>
                        </Flex>
                    </ModalBody>
                </ModalContent>
            </Modal>


            {/* Test modal */}
            <Modal isOpen={isTestingAgentModalOpen} onClose={beforeCloseTestAgentModal} size="2xl">
                <ModalOverlay />
                <ModalContent>
                    <ModalHeader>Test Agent</ModalHeader>
                    <ModalCloseButton />
                    <ModalBody>
                        <Flex h="70vh" w="100%">
                            <ContentOrSpinner showSpinner={agentBuilderStore.agentLoading || agentBuilderStore.agentContextLoading}>
                                {agentBuilderStore.agentContext && <ChatBox context={agentBuilderStore.agentContext} style={chatBoxStyle} />}
                            </ContentOrSpinner>
                        </Flex>
                    </ModalBody>
                </ModalContent>
            </Modal>
        </Flex>
    );
});

export default AgentBuilderPage;
