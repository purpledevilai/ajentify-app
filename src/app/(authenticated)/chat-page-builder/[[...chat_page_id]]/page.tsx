'use client';

import React, { useEffect, useState } from 'react';
import { observer } from 'mobx-react-lite';
import { agentsStore } from '@/store/AgentsStore';
import {
  Box,
  Flex,
  Heading,
  Text,
  Input,
  Select,
  Switch,
  Button,
  Textarea,
  FormControl,
  FormLabel,
  useColorModeValue,
  useBreakpointValue,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalCloseButton,
  ModalBody,
  IconButton,
  Spacer,
} from '@chakra-ui/react';
import { chatPageBuilderStore } from '@/store/ChatPageBuilderStore';
import ChatPage from '@/app/components/chatpage/ChatPage';
import { ArrowBackIcon } from '@chakra-ui/icons';
import { chatPagesStore } from '@/store/ChatPagesStore';
import { useAlert } from "@/app/components/AlertProvider";

type Params = Promise<{ chat_page_id: string[] }>;

interface ChatBuilderPageProps {
  params: Params;
}

const ChatPageBuilder = ({ params }: ChatBuilderPageProps) => {

  const sectionBackground = useColorModeValue('gray.50', 'gray.800');
  const [isPreviewModalOpen, setPreviewModalOpen] = useState(false);
  const isLargeScreen = useBreakpointValue({ base: false, lg: true });
  const { showAlert } = useAlert();


  useEffect(() => {
    setAlertOnStore();
    loadChatPageId();
  }, []);

  const setAlertOnStore = () => {
    chatPageBuilderStore.setShowAlert(showAlert);
  }

  const loadChatPageId = async () => {
    const paramArray = (await params).chat_page_id ?? undefined;
    const chat_page_id = paramArray ? paramArray[0] : undefined;
    if (chat_page_id) {
      if (chatPageBuilderStore.chatPage.chat_page_id !== chat_page_id) {
        chatPageBuilderStore.setChatPageWithId(chat_page_id)
      }
    }
  }

  const onSaveButtonClick = async () => {
    if (await chatPageBuilderStore.saveChatPage()) {
      chatPagesStore.loadChatPages(true);
      window.history.back();
    }
  };

  const onDeleteButtonClick = async () => {
    if (await chatPageBuilderStore.deleteChatPage()) {
      chatPagesStore.loadChatPages(true);
      window.history.back();
    }
  }

  return (
    <Flex gap={4} direction="column" h="100%">
      {/* Page Heading */}
      <Flex
        align="center"
        mb={4}
      >
        <IconButton
          aria-label="Back"
          icon={<ArrowBackIcon />}
          variant="ghost"
          color="inherit"
          _hover={{ bg: 'gray.200', _dark: { bg: 'gray.700' } }}
          onClick={() => window.history.back()}
        />
        <Heading size="lg">Chat Page Builder</Heading>
        <Spacer />
        {!isLargeScreen && <Button colorScheme="blue" size="sm" onClick={() => setPreviewModalOpen(true)}>Show Preview</Button>}
      </Flex>

      <Flex gap={4} direction="row" h="100%">
        {/* Sidebar Form */}
        <Box
          w={isLargeScreen ? '40%' : '100%'}
          h="100%"
          bg={sectionBackground}
          borderRadius="md"
          boxShadow="md"
          position="relative"
        >
          <Box
            position="absolute"
            top="0"
            bottom="0"
            w="100%"
            overflowY="auto"
            display="flex"
            flexDirection="column"
            gap={4}
            p={4}
          >
            {/* Agent Selection */}
            <FormControl>
              <FormLabel>Agent</FormLabel>
              <Select placeholder="Select an Agent" value={chatPageBuilderStore.chatPage.agent_id} onChange={(e) => chatPageBuilderStore.setAgentId(e.target.value)}>
                {agentsStore.agents && agentsStore.agents.map((agent) => (
                  <option key={agent.agent_id} value={agent.agent_id}>{agent.agent_name}</option>
                ))}
              </Select>
            </FormControl>

            {/* Header */}
            <FormControl>
              <FormLabel>Header</FormLabel>
              <Input
                placeholder="Welcome to Ajentify Chat!"
                value={chatPageBuilderStore.chatPage.heading}
                onChange={(e) => chatPageBuilderStore.setHeading(e.target.value)}
              />
            </FormControl>

            {/* Description */}
            <FormControl>
              <FormLabel>Description</FormLabel>
              <Textarea
                placeholder="This is where conversations with your agent happen."
                value={chatPageBuilderStore.chatPage.description}
                onChange={(e) => chatPageBuilderStore.setDescription(e.target.value)}
              />
            </FormControl>

            {/* Colors */}
            <FormControl>
              <FormLabel>Background Color</FormLabel>
              <Input
                type="color"
                value={chatPageBuilderStore.chatPage.chat_page_style.background_color}
                onChange={(e) => chatPageBuilderStore.setBackgroundColor(e.target.value)}
              />
            </FormControl>

            {/* Text Color */}
            <FormControl>
              <FormLabel>Text Color</FormLabel>
              <Input
                type="color"
                value={chatPageBuilderStore.chatPage.chat_page_style.heading_color}
                onChange={(e) => chatPageBuilderStore.setTextColor(e.target.value)}
              />
            </FormControl>

            {/* ChatBox Mode */}
            <FormControl display="flex" alignItems="center">
              <FormLabel mb="0">ChatBox Mode</FormLabel>
              <Switch
                colorScheme="purple"
                isChecked={chatPageBuilderStore.chatBoxMode === 'dark'}
                onChange={(e) => chatPageBuilderStore.setChatBoxMode(e.target.checked ? 'dark' : 'light')}
              />
              <Text ml={2}>{chatPageBuilderStore.chatBoxMode === 'dark' ? 'Dark' : 'Light'}</Text>
            </FormControl>

            {/* Buttons */}
            {/* <Divider />
                <Heading size="md" mt={4}>Buttons</Heading>
                {chatPageBuilderStore.chatPage.buttons && chatPageBuilderStore.chatPage.buttons.map((button, index) => (
                  <HStack key={index} spacing={2}>
                    <Input
                      placeholder="Label"
                      value={button.label}
                      onChange={(e) => updateButton(index, 'label', e.target.value)}
                    />
                    <Input
                      placeholder="Link"
                      value={button.link}
                      onChange={(e) => updateButton(index, 'link', e.target.value)}
                    />
                    <Button size="sm" colorScheme="red" onClick={() => removeButton(index)}>Remove</Button>
                  </HStack>
                ))}
                <Button onClick={addButton} colorScheme="blue" size="sm">Add Button</Button> */}

            <Button
              mt={6}
              minH="40px"
              onClick={onSaveButtonClick}
              isLoading={chatPageBuilderStore.chatPageSaving}
            >
              {chatPageBuilderStore.isUpdating ? "Update" : "Save"}
            </Button>
            {chatPageBuilderStore.isUpdating && (
              <Button
                mt={2}
                minH="40px"
                variant="outline"
                onClick={onDeleteButtonClick}
                isLoading={chatPageBuilderStore.chatPageDeleting}
              >
                Delete
              </Button>
            )}
          </Box>
        </Box>

        {/* Inline Preview (Large Screens Only) */}
        {isLargeScreen && (
          <Box
            w="60%"
            h="100%"
            bg={sectionBackground}
            borderRadius="md"
            boxShadow="md"
            position="relative"
          >
            <Box
              position="absolute"
              top="0"
              bottom="0"
              w="100%"
              overflowY="auto"
              display="flex"
              flexDirection="column"
              gap={4}
              p={4}
            >
              <FormLabel mb={0} >Preview</FormLabel>
              <Box flex="1">
                <ChatPage
                  chatPageData={chatPageBuilderStore.chatPage}
                  context={chatPageBuilderStore.dummyContext}
                />
              </Box>
            </Box>
          </Box>
        )}

        {/* Modal Preview (Smaller Screens Only) */}
        <Modal isOpen={isPreviewModalOpen} onClose={() => setPreviewModalOpen(false)} size="full">
          <ModalOverlay />
          <ModalContent h="100vh">
            <ModalHeader>Preview</ModalHeader>
            <ModalCloseButton />
            <ModalBody display="flex" flexDirection="column" flex="1">
              <Flex direction="column" h="100%" w="100%">
                <ChatPage
                  chatPageData={chatPageBuilderStore.chatPage}
                  context={chatPageBuilderStore.dummyContext}
                />
              </Flex>
            </ModalBody>
          </ModalContent>
        </Modal>
      </Flex>
    </Flex>
  );
};

export default observer(ChatPageBuilder);
