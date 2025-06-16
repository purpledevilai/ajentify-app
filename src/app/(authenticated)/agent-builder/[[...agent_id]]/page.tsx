'use client';

import React, { useEffect, useRef } from "react";
import { useNavigationGuard } from "next-navigation-guard";
import {
    Flex, Text, FormControl, Heading, IconButton, Input, Switch, Textarea, Button, Tooltip,
    useDisclosure, Modal, ModalBody, ModalCloseButton, ModalContent, ModalHeader, ModalOverlay,
    Drawer, DrawerBody, DrawerContent, DrawerHeader, DrawerOverlay, DrawerCloseButton,
    Tag, TagLabel, TagCloseButton,
    useColorMode,
    useClipboard,
    FormLabel
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
import { PassEventTool } from "./components/PassEventTool";
import { Tool } from "@/types/tools";
import { CustomAgentTools } from "./components/CustomAgentTools";

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
    const { isOpen: isToolPickerModalOpen, onOpen: onOpenToolPickerModal, onClose: onCloseToolPickerModal } = useDisclosure();
    const { hasCopied, onCopy } = useClipboard(agentBuilderStore.showAgentId ? agentBuilderStore.currentAgent.agent_id : '');
    const { showAlert } = useAlert();

    useEffect(() => {
        setShowAlertOnStore();
        loadAgentId();

        return () => {
            agentBuilderStore.reset();
        }
    }, []);

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

    const onRemoveTool = (agentTool: Tool) => {
        agentBuilderStore.removeTool(agentTool)
    }

    const getViewForTool = (toolName: string) => {
        switch (toolName) {
            case 'pass_event':
                return <PassEventTool />;
            case 'custom_code':
                return <CustomAgentTools />;
            default:
                return <Text>Tool not implemented yet</Text>;
        }
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

                {/* Configuration */}
                <Flex direction="column" borderWidth="1px" borderRadius="md" p={4} gap={4}>
                    <Heading size="sm">Configuration</Heading>

                    {/* Voice ID */}
                    <FormControl>
                        <FormLabelToolTip
                            label="Voice ID"
                            tooltip="Optional ElevenLabs voice ID for agent responses"
                        />
                        <Input
                            mt={2}
                            placeholder="ElevenLabs voice id"
                            value={agentBuilderStore.currentAgent.voice_id}
                            onChange={(e) => agentBuilderStore.setStringField("voice_id", e.target.value)}
                        />
                    </FormControl>
                    {/* Toggles */}
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

                    {/* Prompt Args Toggle */}
                    <FormControl>
                        <FormLabelToolTip
                            label="Uses Prompt Args"
                            tooltip="If enabled, the agent will accept arguments, ie. variables placed in curlly brackets, in the prompt. Set these variables when you create the context."
                        />
                        <Switch
                            mt={2}
                            colorScheme="purple"
                            size="lg"
                            isChecked={agentBuilderStore.currentAgent.uses_prompt_args}
                            onChange={(e) => agentBuilderStore.setBooleanField("uses_prompt_args", e.target.checked)}
                        />
                    </FormControl>

                    {/* Prompt Args List */}
                    {agentBuilderStore.currentAgent.uses_prompt_args && (
                        <Flex direction="column" w="100%" mt={2} gap={4}>
                            <Heading size="sm">Prompt Args</Heading>
                            {agentBuilderStore.promptArgs.map((arg, index) => (
                                <Text key={index}>- {arg}</Text>
                            ))}
                        </Flex>
                    )}
                </Flex>

                {/* Agent Tool Bar */}
                <FormControl>
                    <FormLabelToolTip
                        label="Agent Tools"
                        tooltip="Tools that the agent can use to help the user."
                    />
                    <Flex direction="row" wrap="wrap" gap={2} mt={2}>
                        <Button size="sm" onClick={onOpenToolPickerModal}>Add Tool</Button>
                        {agentBuilderStore.tools.map((tool, index) => (
                            <Tag key={index} colorScheme="purple" borderRadius="full">
                                <TagLabel>{tool.name}</TagLabel>
                                <TagCloseButton onClick={() => onRemoveTool(tool)} />
                            </Tag>
                        ))}
                    </Flex>
                </FormControl>


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

            {/* Tool Picker modal */}
            <Modal isOpen={isToolPickerModalOpen} onClose={onCloseToolPickerModal} size="2xl">
                <ModalOverlay />
                <ModalContent>
                    <ModalHeader>Tool Picker</ModalHeader>
                    <ModalCloseButton />
                    <ModalBody>
                        <Flex direction="column" gap={4}>
                            {/* Tool tab menue */}
                            <Flex direction="row" gap={4}>
                                {agentBuilderStore.agentTools.map((toolName, index) => (
                                    <Button
                                        key={index}
                                        variant={agentBuilderStore.presentedAgentTool === toolName ? 'solid' : 'outline'}
                                        onClick={() => agentBuilderStore.setPresentedAgentTool(toolName)}

                                    >
                                        {toolName}
                                    </Button>
                                ))}
                            </Flex>
                            {/* Tool view */}
                            {getViewForTool(agentBuilderStore.presentedAgentTool)}
                        </Flex>
                    </ModalBody>
                </ModalContent>
            </Modal>

            {/* Prompt engineer drawer */}
            <Drawer isOpen={isPromptEngineerModalOpen} placement="right" onClose={beforeClosePromptEngineerModal} size="md">
                <DrawerOverlay />
                <DrawerContent>
                    <DrawerHeader>Prompt Engineer</DrawerHeader>
                    <DrawerCloseButton />
                    <DrawerBody>
                        <Flex h="100%" w="100%" direction="column">
                            <ContentOrSpinner showSpinner={agentBuilderStore.promptEngineerContextLoading}>
                                {agentBuilderStore.promptEngineerContext && (
                                    <ChatBox
                                        context={agentBuilderStore.promptEngineerContext}
                                        style={chatBoxStyle}
                                        onEvents={onChatEvents}
                                    />
                                )}
                            </ContentOrSpinner>
                        </Flex>
                    </DrawerBody>
                </DrawerContent>
            </Drawer>


            {/* Test modal */}
            <Modal isOpen={isTestingAgentModalOpen} onClose={beforeCloseTestAgentModal} size="2xl">
                <ModalOverlay />
                <ModalContent>
                    <ModalHeader>Test Agent</ModalHeader>
                    <ModalCloseButton />
                    <ModalBody>
                        <Flex h="70vh" w="100%">
                            {agentBuilderStore.showPromptArgsInput ? (
                                <Flex w="100%" direction={"column"} gap={4} maxW={400}>
                                    <Heading size="md">First enter prompt arguments</Heading>
                                    {agentBuilderStore.promptArgs.map((arg, index) => (
                                        <div key={index}>
                                            <FormLabel>{arg}</FormLabel>
                                            <Input
                                                key={index}
                                                placeholder="Value"
                                                value={agentBuilderStore.promptArgsInput[arg] ?? ""}
                                                onChange={(e) => agentBuilderStore.updatePromptArg(arg, e.target.value)}
                                            />
                                        </div>
                                    ))}
                                    <Button onClick={() => agentBuilderStore.onPromptArgsSubmit()}>Test</Button>
                                </Flex>
                            ) : (
                                <ContentOrSpinner showSpinner={agentBuilderStore.agentLoading || agentBuilderStore.agentContextLoading}>
                                    {agentBuilderStore.agentContext && <ChatBox context={agentBuilderStore.agentContext} style={chatBoxStyle} />}
                                </ContentOrSpinner>
                            )}

                        </Flex>
                    </ModalBody>
                </ModalContent>
            </Modal>
        </Flex>
    );
});

export default AgentBuilderPage;
