'use client';

import React, { useEffect, useState } from 'react';
import { Box, Flex, Heading, Spinner, useColorMode } from '@chakra-ui/react';
import ChatBox, { defaultChatBoxStyle, defaultDarkChatBoxStyle } from '@/app/components/chatbox/ChatBox';
import { createContext } from '@/api/context/createContext';
import { getAgents } from '@/api/agent/getAgents';
import { Context } from '@/types/context';
import { Agent } from '@/types/agent';
import { useAlert } from '@/app/components/AlertProvider';

type Params = Promise<{ agent_id: string[] }>;

interface OpenChatPageProps {
    params: Params;
}

const OpenChatPage = ({ params }: OpenChatPageProps) => {
    const [context, setContext] = useState<Context | undefined>(undefined);
    const [agent, setAgent] = useState<Agent | undefined>(undefined);
    const [loading, setLoading] = useState(true);
    const { showAlert } = useAlert();
    const chatBoxStyle = useColorMode().colorMode === 'dark' ? defaultDarkChatBoxStyle : defaultChatBoxStyle;

    useEffect(() => {
        const init = async () => {
            try {
                const paramArray = (await params).agent_id ?? undefined;
                const agent_id = paramArray ? paramArray[0] : undefined;
                if (!agent_id) {
                    throw new Error('agent_id is required');
                }
                const agents = await getAgents();
                const foundAgent = agents.find(a => a.agent_id === agent_id);
                if (foundAgent) {
                    setAgent(foundAgent);
                }
                const ctx = await createContext({ agent_id });
                setContext(ctx);
            } catch (error) {
                showAlert({
                    title: 'Failed to open chat',
                    message: (error as Error).message,
                });
            } finally {
                setLoading(false);
            }
        };
        init();
    }, []); // eslint-disable-line react-hooks/exhaustive-deps

    if (loading || !context) {
        return (
            <Flex justify="center" align="center" height="100vh">
                <Spinner size="xl" />
            </Flex>
        );
    }

    return (
        <Flex direction="column" h="100vh" p={6}>
            <Heading as="h1" size="xl" mb={4} textAlign="center">
                {agent ? `Chat with ${agent.agent_name}` : 'Chat'}
            </Heading>
            <Box flex="1" boxShadow="lg" borderRadius="md" overflow="hidden">
                <ChatBox context={context} style={chatBoxStyle} />
            </Box>
        </Flex>
    );
};

export default OpenChatPage;
