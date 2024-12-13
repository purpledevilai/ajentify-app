'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Flex, Heading } from '@chakra-ui/react';
import { observer } from 'mobx-react-lite';
import ChatBox from '@/app/components/chatbox/ChatBox';
import { Context } from '@/types/context';
import { createContext } from '@/api/context/createContext';
import { useAlert } from '@/app/components/AlertProvider';

const ChatPage = observer(() => {

    const hasInitiatedLoadRef = useRef<boolean>(false);
    const [context, setContext] = useState<Context | undefined>(undefined);
    const { showAlert } = useAlert();

    useEffect(() => {
        if (hasInitiatedLoadRef.current) return;
        const createNewContext = async () => {
            try {
                const context = await createContext({ agent_id: 'rebin-agent', invoke_agent_message: true });
                setContext(context);
            } catch (error) {
                showAlert("Whoops", (error as Error).message);
            }
        }
        createNewContext();
    }, [])

    return (
        <Flex direction="column" height="100%" p={2}>
            {/* Page Heading */}
            <Heading as="h1" size="xl" mb={2}>
                Chat
            </Heading>
            <Flex flex="1" direction="row" gap={2}>
                <Flex height="100%" bg="gray.800">
                    Chat History
                </Flex>
                <Flex height="100%" flex="1">
                    {context && (
                        <ChatBox context={context}/>
                    )}
                </Flex>
            </Flex>
        </Flex>
    )
});

export default ChatPage;