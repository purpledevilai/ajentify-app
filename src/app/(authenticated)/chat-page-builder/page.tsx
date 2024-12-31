'use client';

import React, { useState } from 'react';
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
//import PreviewWindow from './components/PreviewWindow';

interface ButtonConfig {
  label: string;
  link: string;
}

const ChatPageBuilder = () => {
  const [agentId, setAgentId] = useState('');
  const [header, setHeader] = useState('Welcome to Ajentify Chat!');
  const [description, setDescription] = useState('This is where conversations with your agent happen.');
  const [backgroundColor, setBackgroundColor] = useState('#f9fafc');
  const [textColor, setTextColor] = useState('#333333');
  const [chatBoxMode, setChatBoxMode] = useState<'light' | 'dark'>('light');
  const [buttons, setButtons] = useState<ButtonConfig[]>([{ label: 'Home', link: '#' }]);

  const [isPreviewModalOpen, setPreviewModalOpen] = useState(false);

  const addButton = () => {
    setButtons([...buttons, { label: '', link: '' }]);
  };

  const updateButton = (index: number, field: keyof ButtonConfig, value: string) => {
    const newButtons = [...buttons];
    newButtons[index][field] = value;
    setButtons(newButtons);
  };

  const removeButton = (index: number) => {
    setButtons(buttons.filter((_, i) => i !== index));
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
            <Select placeholder="Select an Agent" value={agentId} onChange={(e) => setAgentId(e.target.value)}>
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
              value={chatPageBuilderStore.chatPage?.heading}
              onChange={(e) => chatPageBuilderStore.setStringValue("heading", e.target.value)}
            />
          </FormControl>

          {/* Description */}
          <FormControl>
            <FormLabel>Description</FormLabel>
            <Textarea
              placeholder="This is where conversations with your agent happen."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </FormControl>

          {/* Colors */}
          <FormControl>
            <FormLabel>Background Color</FormLabel>
            <Input
              type="color"
              value={backgroundColor}
              onChange={(e) => setBackgroundColor(e.target.value)}
            />
          </FormControl>

          <FormControl>
            <FormLabel>Text Color</FormLabel>
            <Input
              type="color"
              value={textColor}
              onChange={(e) => setTextColor(e.target.value)}
            />
          </FormControl>

          {/* ChatBox Mode */}
          <FormControl display="flex" alignItems="center">
            <FormLabel mb="0">ChatBox Mode</FormLabel>
            <Switch
              isChecked={chatBoxMode === 'dark'}
              onChange={(e) => setChatBoxMode(e.target.checked ? 'dark' : 'light')}
            />
            <Text ml={2}>{chatBoxMode === 'dark' ? 'Dark' : 'Light'}</Text>
          </FormControl>

          <Divider />

          {/* Buttons */}
          <Heading size="md" mt={4}>Buttons</Heading>
          {buttons.map((button, index) => (
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
          {/* <PreviewWindow
            header={header}
            description={description}
            backgroundColor={backgroundColor}
            textColor={textColor}
            chatBoxMode={chatBoxMode}
            buttons={buttons}
          /> */}
        </Box>
      )}

      {/* Modal Preview (Smaller Screens Only) */}
      <Modal isOpen={isPreviewModalOpen} onClose={() => setPreviewModalOpen(false)} size="full">
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Preview</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            {/* <PreviewWindow
              header={header}
              description={description}
              backgroundColor={backgroundColor}
              textColor={textColor}
              chatBoxMode={chatBoxMode}
              buttons={buttons}
            /> */}
          </ModalBody>
        </ModalContent>
      </Modal>
    </Flex>
  );
};

export default ChatPageBuilder;
