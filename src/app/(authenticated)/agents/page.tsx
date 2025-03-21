'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { observer } from 'mobx-react-lite';
import { agentsStore } from '@/store/AgentsStore';
import { agentBuilderStore } from '@/store/AgentBuilderStore';
import { Agent } from '@/types/agent';
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
  useDisclosure,
  Modal,
  ModalOverlay,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalHeader,
} from '@chakra-ui/react';
import Card from '@/app/components/Card';
import { CodeSnippet } from '@/app/components/CodeSnippet';
import { generateStartConversationSnippet } from '@/utils/codesnippets/StartConversation';
import { useAlert } from '@/app/components/AlertProvider';
import { authStore } from '@/store/AuthStore';

const AgentsPage = observer(() => {
  const router = useRouter();
  const { isOpen: isCodeModalOpen, onOpen: onCodeModalOpen, onClose: onCodeModalClose } = useDisclosure();
  const [selectedLanguage, setSelectedLanguage] = useState('javascript');
  const [currentAgentId, setCurrentAgentId] = useState<string | null>(null);
  const { showAlert } = useAlert();

  useEffect(() => {
    if (!authStore.signedIn) return;
    setShowAlertOnStore();
    agentsStore.loadAgents();
  });

  const setShowAlertOnStore = () => {
    agentsStore.setShowAlert(showAlert);
  }

  const handleAddAgentClick = () => {
    agentBuilderStore.setIsNewAgent(true);
    router.push('/agent-builder');
  };

  const handleAgentClick = (agent: Agent) => {
    agentBuilderStore.setCurrentAgent({ ...agent });
    router.push(`/agent-builder/${agent.agent_id}`);
  };

  const handleShowCodeClick = (e: React.MouseEvent, agent: Agent) => {
    e.stopPropagation();
    setCurrentAgentId(agent.agent_id);
    onCodeModalOpen();
  };

  const handleCreateTeamClick = () => {
    router.push('/create-team');
  }

  return (
    <Box p={6}>
      {/* Page Heading */}
      <Heading as="h1" size="xl" mb={6}>
        Agents
      </Heading>

      {/* Content Section */}
      {agentsStore.agentsLoading ? (
        <Flex justify="center" align="center" height="200px">
          <Spinner size="xl" />
        </Flex>
      ) : (
        <Box>
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
                onClick={handleAddAgentClick}
                minHeight="150px" // Uniform height for all cards
              >
                <Text fontWeight="bold" color="brand.500">
                  + Add Agent
                </Text>
              </Flex>
            </GridItem>

            {/* Agent Cards */}
            {agentsStore.agents ? (
              agentsStore.agents.map((agent) => (
                <GridItem key={agent.agent_id}>
                  <Card
                    shadow="md"
                    _hover={{ shadow: 'lg' }}
                    cursor="pointer"
                    onClick={() => handleAgentClick(agent)}
                    minHeight="150px" // Uniform height for all cards
                  >
                    <Flex h="100%" direction="column">
                      <Heading as="h3" size="md" mb={2} isTruncated>
                        {agent.agent_name}
                      </Heading>
                      <Text fontSize="sm" color="gray.500" isTruncated>
                        {agent.agent_description}
                      </Text>
                      <Spacer />
                      <Button
                        size="sm"
                        onClick={(e) => handleShowCodeClick(e, agent)}
                      >
                        Show Code
                      </Button>
                    </Flex>
                  </Card>
                </GridItem>
              ))
            ) : (
              <Text>No agents found</Text>
            )}
          </Grid>
          <Heading as="h1" size="xl" mb={2} mt={8}>
            Create Team
          </Heading>
          <Text fontSize="md" color="gray.500" isTruncated>
            {"Tell us about your business and we'll create a team of agents for you."}
          </Text>
          <Button
            size="md"
            onClick={handleCreateTeamClick}
            mt={4}
          >
            Create Team
          </Button>
        </Box>
      )}

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
                variant={selectedLanguage === 'javascript' ? 'solid' : 'outline'}
                onClick={() => setSelectedLanguage('javascript')}
              >
                JavaScript
              </Button>
              <Button
                size="sm"
                variant={selectedLanguage === 'python' ? 'solid' : 'outline'}
                onClick={() => setSelectedLanguage('python')}
              >
                Python
              </Button>
              <Button
                size="sm"
                variant={selectedLanguage === 'id' ? 'solid' : 'outline'}
                onClick={() => setSelectedLanguage('id')}
              >
                ID
              </Button>
            </Flex>
            {currentAgentId && <CodeSnippet code={generateStartConversationSnippet(currentAgentId, selectedLanguage)} language={selectedLanguage} />}
          </ModalBody>
        </ModalContent>
      </Modal>
    </Box>
  );
});

export default AgentsPage;
