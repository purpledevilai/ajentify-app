'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { observer } from 'mobx-react-lite';
import { chatPagesStore } from '@/store/ChatPagesStore';
import {
  Box,
  Heading,
  Grid,
  GridItem,
  Flex,
  Text,
  Spinner,
  Button,
  Spacer,
} from '@chakra-ui/react';
import Card from '@/app/components/Card';
import { ChatPageData } from '@/types/chatpagedata';
import { chatPageBuilderStore } from '@/store/ChatPageBuilderStore';
import { ChatPageCard } from './components/ChatPageCard';

const ChatPagesPage = observer(() => {
  const router = useRouter();

  useEffect(() => {
    chatPagesStore.loadChatPages();
  }, []);

  const handleAddChatPageClick = () => {
    chatPageBuilderStore.initiateNew();
    router.push('/chat-page-builder');
  };

  const handleChatPageClick = (chatPage: ChatPageData) => {
    chatPageBuilderStore.setChatPage(chatPage);
    router.push('/chat-page-builder');
  };

  return (
    <Box p={6}>
      {/* Page Heading */}
      <Heading as="h1" size="xl" mb={6}>
        Chat Pages
      </Heading>

      {/* Content Section */}
      {chatPagesStore.chatPagesLoading ? (
        <Flex justify="center" align="center" height="200px">
          <Spinner size="xl" />
        </Flex>
      ) : (
        <Grid templateColumns="repeat(auto-fill, minmax(200px, 1fr))" gap={6}>
          {/* Add Agent Button */}
          <GridItem>
            <Flex
              align="center"
              justify="center"
              bg="gray.100"
              _dark={{ bg: 'gray.700', borderColor: 'gray.600' }}
              p={6}
              borderRadius="md"
              border="1px dashed"
              borderColor="gray.300"
              cursor="pointer"
              _hover={{ bg: 'gray.200', _dark: { bg: 'gray.600' } }}
              onClick={handleAddChatPageClick}
              minHeight="150px" // Uniform height for all cards
            >
              <Text fontWeight="bold" color="brand.500">
                + Add Chat Page
              </Text>
            </Flex>
          </GridItem>

          {/* Chat Page Cards */}
          {chatPagesStore.chatPages ? (
            chatPagesStore.chatPages.map((chatPage) => (
              <GridItem key={chatPage.chat_page_id}>
                <ChatPageCard chatPage={chatPage} handleChatPageClick={handleChatPageClick} />
              </GridItem>
            ))
          ) : (
            <Text>No chat pages found</Text>
          )}
        </Grid>
      )}
    </Box>
  );
});

export default ChatPagesPage;
