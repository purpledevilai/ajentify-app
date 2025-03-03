'use client';

import { ChatPageData } from "@/types/chatpagedata";
import Card from "@/app/components/Card";
import { Flex, Text, Heading, Spacer, Button, useClipboard, Modal, ModalBody, ModalCloseButton, ModalContent, ModalHeader, ModalOverlay, useDisclosure } from "@chakra-ui/react";
import React from "react";
import { CheckIcon, CopyIcon } from "@chakra-ui/icons";
import { CodeSnippet } from "@/app/components/CodeSnippet";


interface ChatPageCardProps {
    chatPage: ChatPageData;
    handleChatPageClick: (chatPage: ChatPageData) => void;
}

export const ChatPageCard = ({ chatPage, handleChatPageClick }: ChatPageCardProps) => {

    const { hasCopied, onCopy } = useClipboard(chatPage.chat_page_id);
    const { isOpen: isCodeModalOpen, onOpen: onCodeModalOpen, onClose: onCodeModalClose } = useDisclosure();
    const [selectedCodeView, setSelectedCodeView] = React.useState('link');



    const handleOpenCodeView = (e: React.MouseEvent) => {
        e.stopPropagation();
        onCodeModalOpen();
    };

    const handleCopy = (e: React.MouseEvent) => {
        e.stopPropagation();
        onCopy();
    }

    const getCodeSnippet = () => {
        if (selectedCodeView === "link") {
            return `https://www.ajentify.com/chat-page/${chatPage.chat_page_id}`;
        }
        if (selectedCodeView === "script tag") {
            return `<script src="https://api.ajentify.com/chat-bot/${chatPage.chat_page_id}"></script>`;
        }
        if (selectedCodeView === "id") {
            return `${chatPage.chat_page_id}`;
        }
        return '';
    }


    return (
        <>
            <Card
                shadow="md"
                _hover={{ shadow: 'lg' }}
                cursor="pointer"
                onClick={() => handleChatPageClick(chatPage)}
                minHeight="150px" // Uniform height for all cards
                p={4}
            >
                <Flex h="100%" direction="column">
                    <Heading as="h3" size="md" mb={2} isTruncated>
                        {chatPage.heading}
                    </Heading>
                    <Flex direction="row" gap={1} align="center">
                        {/* copy icon button */}
                        <Button
                            size="sm"
                            onClick={handleCopy}
                            colorScheme={hasCopied ? 'green' : 'brand'}
                            variant="ghost"
                        >
                            {hasCopied ? <CheckIcon /> : <CopyIcon />}
                        </Button>
                        <Text fontSize="sm" color="gray.500" isTruncated>
                            {chatPage.chat_page_id}
                        </Text>
                    </Flex>
                    <Spacer />
                    <Button
                        size="sm"
                        onClick={(e) => handleOpenCodeView(e)}
                    >
                        Show Code
                    </Button>
                </Flex>
            </Card>
            {/* Code Modal */}
            <Modal isOpen={isCodeModalOpen} onClose={onCodeModalClose} size="2xl">
                <ModalOverlay />
                <ModalContent>
                    <ModalHeader>Code</ModalHeader>
                    <ModalCloseButton />
                    <ModalBody>
                        <Flex gap={4} mb={4}>
                            <Button
                                size="sm"
                                variant={selectedCodeView === 'link' ? 'solid' : 'outline'}
                                onClick={() => setSelectedCodeView('link')}
                            >
                                link
                            </Button>
                            <Button
                                size="sm"
                                variant={selectedCodeView === 'script tag' ? 'solid' : 'outline'}
                                onClick={() => setSelectedCodeView('script tag')}
                            >
                                script tag
                            </Button>
                            <Button
                                size="sm"
                                variant={selectedCodeView === 'id' ? 'solid' : 'outline'}
                                onClick={() => setSelectedCodeView('id')}
                            >
                                ID
                            </Button>
                        </Flex>
                        {<CodeSnippet code={getCodeSnippet()} language={selectedCodeView} />}
                    </ModalBody>
                </ModalContent>
            </Modal>
        </>
    )
};