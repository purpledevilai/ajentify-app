'use client';

import { ChatPageData } from "@/types/chatpagedata";
import Card from "@/app/components/Card";
import { Flex, Text, Heading, Spacer, Button, useClipboard } from "@chakra-ui/react";
import React from "react";
import { CheckIcon, CopyIcon } from "@chakra-ui/icons";
import { FiExternalLink } from "react-icons/fi";


interface ChatPageCardProps {
    chatPage: ChatPageData;
    handleChatPageClick: (chatPage: ChatPageData) => void;
}

export const ChatPageCard = ({ chatPage, handleChatPageClick }: ChatPageCardProps) => {

    const { hasCopied, onCopy } = useClipboard(chatPage.chat_page_id);
    

    const handleGoToChatPageClick = (e: React.MouseEvent, chatPage: ChatPageData) => {
        e.stopPropagation();
        window.open(`/chat-page/${chatPage.chat_page_id}`, '_blank', 'noopener,noreferrer');
    };

    const handleCopy = (e: React.MouseEvent) => {
        e.stopPropagation();
        onCopy();
    }


    return (
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
                    onClick={(e) => handleGoToChatPageClick(e, chatPage)}
                    rightIcon={<FiExternalLink />}
                >
                    Chat Page
                </Button>
            </Flex>
        </Card>
    )
};