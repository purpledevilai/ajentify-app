'use client';

import React, { useEffect } from "react";
import { Flex, FormControl, Heading, IconButton, useColorMode, Input, Switch, Textarea, Button, Tooltip, useDisclosure, Modal, ModalBody, ModalCloseButton, ModalContent, ModalFooter, ModalHeader, ModalOverlay } from "@chakra-ui/react";
import { ArrowBackIcon } from "@chakra-ui/icons";
import ChatBox, { defaultChatBoxStyle, defaultDarkChatBoxStyle } from "@/app/components/chatbox/ChatBox";
import { FormLabelToolTip } from "@/app/components/FormLableToolTip";
import { agentBuilderStore } from "@/store/AgentBuilderStore";
import { ContentOrSpinner } from "@/app/components/ContentOrSpinner";
import { useAlert } from "@/app/components/AlertProvider";
import { UIUpdate } from "@/types/chatresponse";
import { observer } from "mobx-react-lite";

const AgentBuilderPage = observer(() => {

    const chatBoxStyle = useColorMode().colorMode === 'dark' ? defaultDarkChatBoxStyle : defaultChatBoxStyle;
    const { isOpen: isTestingAgentModalOpen, onOpen: onOpenTestingAgentModal, onClose: onCloseTesingAgentModal } = useDisclosure();
    const { showAlert } = useAlert();

    useEffect(() => {
        agentBuilderStore.initiateNewAgentState();
    }, []);

    useEffect(() => {
        if (agentBuilderStore.showAlert) {
            showAlert({
                title: agentBuilderStore.alertTitle,
                message: agentBuilderStore.alertMessage,
                onClose: agentBuilderStore.closeAlert
            });
        }
    }, [agentBuilderStore.showAlert])

    const onUIUpdates = (uiUpdates: UIUpdate[]) => {
        console.log("Calling UIUpdate function")
        uiUpdates.forEach(uiUpdate => {
            if (uiUpdate.type === 'set_prompt') {
                const promptUpdate = uiUpdate as unknown as { prompt: string }
                agentBuilderStore.setStringField("prompt", promptUpdate.prompt)
            }
        })
    }

    const onTestAgent = async () => {
        onOpenTestingAgentModal();
        if (agentBuilderStore.currentAgent.agent_id) {
            await agentBuilderStore.updateAgent()
        } else {
            await agentBuilderStore.createAgent()
        }
        agentBuilderStore.createAgentContext()
    }

    return (
        <Flex p={4} direction="column" h="100%" w="100%">
            <Flex direction="row" w="100%" mb={4} gap={4}>
                <IconButton
                    aria-label="Back"
                    icon={<ArrowBackIcon />}
                    variant="ghost"
                    color="inherit"
                    _hover={{ bg: 'gray.200', _dark: { bg: 'gray.700' } }}
                    onClick={() => window.history.back()}
                />
                <Heading flex="1">Agent Builder</Heading>
                <Tooltip isDisabled={agentBuilderStore.currentAgent.prompt !== ''} label="You must set an agent prompt first before testing" fontSize="md">
                    <Button 
                        disabled={agentBuilderStore.currentAgent.prompt === ''}
                        onClick={onTestAgent}
                    >
                        Test Agent
                    </Button>
                </Tooltip>

            </Flex>
            <Flex direction="row" h="100%" w="100%" gap={8}>
                <Flex direction="column" width="50vw" height="100%">
                    <ContentOrSpinner showSpinner={agentBuilderStore.promptEngineerContextLoading}>
                        {agentBuilderStore.promptEngineerContext &&
                            <ChatBox context={agentBuilderStore.promptEngineerContext} style={chatBoxStyle} onUIUpdates={onUIUpdates} />
                        }
                    </ContentOrSpinner>
                </Flex>
                <Flex direction="column" w="100%" h="100%" gap={8}>
                    {/* Agent Name */}
                    <FormControl>
                        <FormLabelToolTip label="Agent Name" tooltip="The name the agent will refer itself to" />
                        <Input
                            mt={2}
                            placeholder="Domingo"
                            value={agentBuilderStore.currentAgent.agent_name}
                            onChange={(e) => agentBuilderStore.setStringField("agent_name", e.target.value)}
                        />
                    </FormControl>
                    {/* Agent Descriptin */}
                    <FormControl>
                        <FormLabelToolTip label="Agent Description" tooltip="Short description for your reference. Not public." />
                        <Input
                            mt={2}
                            placeholder="A friendly agent that helps you with your daily tasks."
                            value={agentBuilderStore.currentAgent.agent_description}
                            onChange={(e) => agentBuilderStore.setStringField("agent_description", e.target.value)}
                        />
                    </FormControl>
                    <Flex direction="row" w="100%" justifyContent="flex-start" align="center" gap={12}>
                        {/* Agent Is Public */}
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
                        {/* Agent Speaks First */}
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
                        <FormLabelToolTip label="Agent Prompt" tooltip="The prompt sets the Agent's behavior, tone, and expertise. It acts as an initial instruction that guides how the Agent responds to all user inputs during the conversation." />
                        <Textarea
                            placeholder="You are an expert at..."
                            mt={2}
                            borderColor="gray.300"
                            _hover={{ borderColor: 'gray.400' }}
                            focusBorderColor="gray.500"
                            value={agentBuilderStore.currentAgent.prompt}
                            onChange={(e) => agentBuilderStore.setStringField("prompt", e.target.value)}
                        />
                    </FormControl>
                </Flex>
            </Flex>
            <Modal isOpen={isTestingAgentModalOpen} onClose={onCloseTesingAgentModal} size="2xl">
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
    )
});

export default AgentBuilderPage;