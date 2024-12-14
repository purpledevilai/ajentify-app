'use client';

import React, { useState, useEffect, useRef, use } from 'react';
import {
    Flex,
    Heading,
    IconButton,
    Drawer,
    DrawerBody,
    DrawerHeader,
    DrawerOverlay,
    DrawerContent,
    DrawerCloseButton,
    useDisclosure,
    useColorMode,
    useBreakpointValue,
    Menu,
    MenuButton,
    MenuList,
    Spinner,
    Text,
    MenuItem,
    Divider,
    Box,
} from '@chakra-ui/react';
import { observer } from 'mobx-react-lite';
import ChatBox from '@/app/components/chatbox/ChatBox';
import { Context } from '@/types/context';
import { createContext } from '@/api/context/createContext';
import { useAlert } from '@/app/components/AlertProvider';
import { defaultChatBoxStyle, defaultDarkChatBoxStyle } from '@/app/components/chatbox/ChatBox';
import { ChevronDownIcon, ChevronUpIcon, HamburgerIcon } from '@chakra-ui/icons';
import { chatPageStore } from '@/store/ChatPageStore';
import { formatTimestamp } from '@/utils/formattimestamp';


const ChatPage = observer(() => {

    const isMobile = useBreakpointValue({ base: true, lg: false });
    const { showAlert } = useAlert();
    const chatBoxStyle = useColorMode().colorMode === 'dark' ? defaultDarkChatBoxStyle : defaultChatBoxStyle;
    const {
        isOpen: isMobileChatDrawerOpen,
        onOpen: onMobileChatDrawerOpen,
        onClose: onMobileChatDrawereClose
    } = useDisclosure();
    const {
        isOpen: isAgentMenuOpen,
        onOpen: onOpenAgentMenu,
        onClose: onCloseAgentMenu
    } = useDisclosure();

    useEffect(() => {
        chatPageStore.loadData();
    }, [])

    useEffect(() => {
        if (chatPageStore.showAlert) {
            showAlert({
                title: chatPageStore.alertTitle,
                message: chatPageStore.alertMessage,
                onClose: chatPageStore.closeAlert
            });
        }
    }, [chatPageStore.showAlert])

    return (
        <Flex direction="column" height="100%" p={2}>
            {/* Page Heading */}
            <Flex mb={2}>
                <Heading flex="1" as="h1" size="xl">
                    Chat
                </Heading>
                {isMobile && (
                    <IconButton
                        aria-label={'Open Chat Menu'}
                        icon={<HamburgerIcon />}
                        variant="ghost"
                        color="inherit"
                        _hover={{ bg: 'gray.200', _dark: { bg: 'gray.700' } }}
                        onClick={onMobileChatDrawerOpen}
                    />
                )}
            </Flex>
            {/* Body */}
            <Flex flex="1" direction="row" gap={4}>
                {/* Chat Box */}
                <Flex height="100%" flex="1">
                    {chatPageStore.currentContextLoading ? (
                        <Flex justify="center" align="center" height="40px">
                            <Spinner size="sm" />
                        </Flex>
                    ) : (
                        chatPageStore.currentContext && (
                            <ChatBox context={chatPageStore.currentContext} style={chatBoxStyle} />
                        )
                    )}
                </Flex>
                {/* Chat History */}
                {!isMobile && (
                    <Flex direction="column" height="100%" bg="gray.800" width="300px" borderRadius="md" p={2}>
                        {chatPageStore.currentContextLoading || !chatPageStore.currentAgentName || chatPageStore.agents === undefined ? (
                            <Flex justify="center" align="center" height="40px">
                                <Spinner size="sm" />
                            </Flex>
                        ) : (
                            <Menu isOpen={isAgentMenuOpen} onClose={onCloseAgentMenu}>
                                <MenuButton
                                    width="100%"
                                    p={2}
                                    _hover={{ bg: 'gray.700' }}
                                    borderRadius="md"
                                    onClick={onOpenAgentMenu}
                                >
                                    <Flex justify="space-between" align="center">
                                        <Text fontWeight="bold">{chatPageStore.currentAgentName}</Text>
                                        {isAgentMenuOpen ? <ChevronUpIcon /> : <ChevronDownIcon />}
                                    </Flex>
                                </MenuButton>
                                <MenuList>
                                    {chatPageStore.agents.map((agent) => (
                                        <MenuItem key={agent.agent_id} onClick={() => console.log(`Need to implement chatPageStore.createNewContext(agent.agent_id)`)}>
                                            {agent.agent_name}
                                        </MenuItem>
                                    ))}
                                </MenuList>
                            </Menu>
                        )}
                        <Divider />
                        {/* Chat History Content */}
                        {chatPageStore.contextHistoryLoading ? (
                            <Flex justify="center" align="center" flex="1">
                                <Spinner size="sm" />
                            </Flex>
                        ) : (
                            chatPageStore.contextHistory && (
                                <Box width="100%" height="100%" position="relative">
                                    <Box
                                        position="absolute"
                                        top="0"
                                        bottom="0"
                                        width="100%"
                                        overflowY="auto"
                                    >
                                        {chatPageStore.contextHistory.map((contextHistory) => (
                                            <div key={contextHistory.context_id}>
                                                <Flex direction="column" p={2} _hover={{ bg: 'gray.700' }} borderRadius="md">
                                                    <Flex direction="row" justify="space-between" align="center">
                                                        <Text fontWeight="bold">{contextHistory.agent.agent_name}</Text>
                                                        <Text fontSize="sm">{formatTimestamp(contextHistory.time_stamp)}</Text>
                                                    </Flex>
                                                    <Text fontSize="sm">{contextHistory.last_message}</Text>
                                                </Flex>
                                                <Divider />
                                            </div>
                                        ))}
                                    </Box>
                                </Box>
                            )
                        )}

                    </Flex>
                )}
            </Flex>
            {/* Mobile Chat History */}
            <Drawer
                isOpen={isMobileChatDrawerOpen}
                placement="right" // Slide in from the right
                onClose={onMobileChatDrawereClose}
            >
                <DrawerOverlay />
                <DrawerContent bg="gray.800" color="white">
                    <DrawerCloseButton />
                    <DrawerHeader>Chat History</DrawerHeader>
                    <DrawerBody>
                        {/* Content goes here */}
                        Chat History Content
                    </DrawerBody>
                </DrawerContent>
            </Drawer>
        </Flex>
    )
});

export default ChatPage;