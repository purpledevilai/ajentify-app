'use client';

import React, { useEffect } from 'react';
import { observer } from 'mobx-react-lite';
import ChatBox from '@/app/components/chatbox/ChatBox';
import { useAlert } from '@/app/components/AlertProvider';
import { defaultChatBoxStyle, defaultDarkChatBoxStyle } from '@/app/components/chatbox/ChatBox';
import { chatPageStore } from '@/store/ChatPageStore';
import { ChatSideBar } from './components/chatsidebar/ChatSideBar';
import { ChatHeading } from './components/ChatHeading';
import {
    Flex,
    Drawer,
    DrawerBody,
    DrawerOverlay,
    DrawerContent,
    DrawerCloseButton,
    useDisclosure,
    useColorMode,
    useBreakpointValue,
    Spinner,
    Box,
    useColorModeValue,
} from '@chakra-ui/react';


const ChatPage = observer(() => {

    const isMobile = useBreakpointValue({ base: true, lg: false });
    const chatBoxStyle = useColorMode().colorMode === 'dark' ? defaultDarkChatBoxStyle : defaultChatBoxStyle;
    const mobileDrawerBgColor = useColorModeValue('gray.50', 'gray.800');
    const {
        isOpen: isMobileChatDrawerOpen,
        onOpen: onMobileChatDrawerOpen,
        onClose: onMobileChatDrawereClose
    } = useDisclosure();
    const { showAlert } = useAlert();

    // Initiate load
    useEffect(() => {
        chatPageStore.loadData();
    }, [])

    // Show alerts
    useEffect(() => {
        chatPageStore.setShowAlert(showAlert);
    }, [showAlert])

    return (
        <Flex direction="column" height="100%" p={2}>
            {/* Page Heading */}
            <ChatHeading onMobileChatDrawerOpen={onMobileChatDrawerOpen} />

            {/* Body */}
            <Flex flex="1" direction="row" gap={4}>
                {/* Chat Box */}
                <Flex height="100%" flex="1">
                    {chatPageStore.currentContextLoading ? (
                        <Flex justify="center" align="center" width="100%" height="100%">
                            <Spinner size="sm" />
                        </Flex>
                    ) : (
                        chatPageStore.currentContext && (
                            <ChatBox context={chatPageStore.currentContext} style={chatBoxStyle} />
                        )
                    )}
                </Flex>

                {/* Chat Side Bar */}
                {!isMobile && (
                    <Box width="300px">
                        <ChatSideBar />
                    </Box>
                )}
            </Flex>

            {/* Mobile Chat Drawer */}
            <Drawer
                isOpen={isMobileChatDrawerOpen}
                placement="right"
                onClose={onMobileChatDrawereClose}
            >
                <DrawerOverlay />
                <DrawerContent bg={mobileDrawerBgColor}>
                    <DrawerCloseButton />
                    <DrawerBody pt={14}>
                        <ChatSideBar />
                    </DrawerBody>
                </DrawerContent>
            </Drawer>
        </Flex>
    )
});

export default ChatPage;