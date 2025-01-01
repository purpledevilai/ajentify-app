'use client';

import React, { useState } from 'react';
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
  VStack,
  HStack,
  Divider,
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
} from '@chakra-ui/react';
import { chatPageBuilderStore } from '@/store/ChatPageBuilderStore';
import ChatPage from '@/app/components/chatpage/ChatPage';
//import PreviewWindow from './components/PreviewWindow';

interface ButtonConfig {
  label: string;
  link: string;
}

const ChatPageBuilder = () => {

  const [isPreviewModalOpen, setPreviewModalOpen] = useState(false);

  const addButton = () => {
    //setButtons([...buttons, { label: '', link: '' }]);
  };

  const updateButton = (index: number, field: keyof ButtonConfig, value: string) => {
    // const newButtons = [...buttons];
    // newButtons[index][field] = value;
    // setButtons(newButtons);
  };

  const removeButton = (index: number) => {
    //setButtons(buttons.filter((_, i) => i !== index));
  };

  // Determine whether to show modal or inline preview
  const isLargeScreen = useBreakpointValue({ base: false, lg: true });

  return (
    <Flex p={6} gap={6} direction={['column', 'column', 'row']} h="100vh">
      {/* Sidebar Form */}
      <Box
        w={isLargeScreen ? '40%' : '100%'}
        bg={useColorModeValue('gray.50', 'gray.800')}
        p={4}
        borderRadius="md"
        boxShadow="md"
        overflowY="auto"
      >
        <Heading size="lg" mb={4}>Chat Page Builder</Heading>
        <VStack spacing={4} align="stretch">
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
              isChecked={chatPageBuilderStore.chatBoxMode === 'dark'}
              onChange={(e) => chatPageBuilderStore.setChatBoxMode(e.target.checked ? 'dark' : 'light')}
            />
            <Text ml={2}>{chatPageBuilderStore.chatBoxMode === 'dark' ? 'Dark' : 'Light'}</Text>
          </FormControl>

          <Divider />

          {/* Buttons */}
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
          <Button onClick={addButton} colorScheme="blue" size="sm">Add Button</Button>
        </VStack>

        {!isLargeScreen && (
          <Button
            mt={6}
            colorScheme="blue"
            onClick={() => setPreviewModalOpen(true)}
          >
            Show Preview
          </Button>
        )}
      </Box>

      {/* Inline Preview (Large Screens Only) */}
      {isLargeScreen && (
        <Box
          w="60%"
          bg="white"
          p={4}
          borderRadius="md"
          boxShadow="md"
          overflowY="auto"
        >
          <Heading size="lg" mb={4}>Preview</Heading>
          <ChatPage
            chatPageData={chatPageBuilderStore.chatPage}
            context={chatPageBuilderStore.dummyContext}
          />
        </Box>
      )}

      {/* Modal Preview (Smaller Screens Only) */}
      <Modal isOpen={isPreviewModalOpen} onClose={() => setPreviewModalOpen(false)} size="full">
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Preview</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <ChatPage
              chatPageData={chatPageBuilderStore.chatPage}
              context={chatPageBuilderStore.dummyContext}
            />
          </ModalBody>
        </ModalContent>
      </Modal>
    </Flex>
  );
};

export default observer(ChatPageBuilder);
