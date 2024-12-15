'use client';

import React from "react";
import { Flex, FormControl, FormLabel, Heading, IconButton, useColorMode, Input, Switch, Tooltip, Textarea } from "@chakra-ui/react";
import { ArrowBackIcon, QuestionIcon } from "@chakra-ui/icons";
import { Context } from "@/types/context";
import ChatBox, { defaultChatBoxStyle, defaultDarkChatBoxStyle } from "@/app/components/chatbox/ChatBox";
import { FormLabelToolTip } from "@/app/components/FormLableToolTip";

const AgentBuilderPage = () => {

    const chatBoxStyle = useColorMode().colorMode === 'dark' ? defaultDarkChatBoxStyle : defaultChatBoxStyle;

    const mockContext: Context = {
        context_id: "1",
        agent_id: "1",
        messages: [
            { from: "ai", message: "Hi I'm AJ, your personal agent builder. I'm an expert prompt engineer and can help you create your perfect agent." },
        ]
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
                <Heading>Agent Builder</Heading>
            </Flex>
            <Flex direction="row" h="100%" w="100%" gap={8}>
                <Flex direction="column" width="50vw" height="100%">
                    <ChatBox context={mockContext} style={chatBoxStyle} />
                </Flex>
                <Flex direction="column" w="100%" h="100%" gap={8}>
                    {/* Agent Name */}
                    <FormControl>
                        <FormLabelToolTip label="Agent Name" tooltip="The name the agent will refer itself to" />
                        <Input mt={2} placeholder="Domingo" />
                    </FormControl>
                    {/* Agent Descriptin */}
                    <FormControl>
                        <FormLabelToolTip label="Agent Description" tooltip="Short description for your reference. Not public." />
                        <Input mt={2} placeholder="A friendly agent that helps you with your daily tasks." />
                    </FormControl>
                    <Flex direction="row" w="100%" justifyContent="flex-start" align="center" gap={12}>
                        {/* Agent Is Public */}
                        <FormControl width="auto">
                            <FormLabelToolTip
                                label="Public Agent"
                                tooltip="If not public, only you and your organization can talk to this agent"
                            />
                            <Switch mt={2} colorScheme="purple" size="lg" />
                        </FormControl>
                        {/* Agent Speaks First */}
                        <FormControl width="auto">
                            <FormLabelToolTip
                                label="Agent Speaks First"
                                tooltip="When a new context with this agent is created, the agent will generate the first message."
                            />
                            <Switch mt={2} colorScheme="purple" size="lg" />
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
                        />
                    </FormControl>
                </Flex>
            </Flex>
        </Flex>
    )
};

export default AgentBuilderPage;