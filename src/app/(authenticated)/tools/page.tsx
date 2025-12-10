'use client';

import React, { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { observer } from 'mobx-react-lite';
import { toolsStore } from '@/store/ToolsStore';
import { toolBuilderStore } from '@/store/ToolBuilderStore';
import {
  Box,
  Heading,
  Flex,
  Text,
  Spinner,
} from '@chakra-ui/react';
import Card from '@/app/components/Card';
import { useAlert } from '@/app/components/AlertProvider';
import { Tool } from '@/types/tools';
import { authStore } from '@/store/AuthStore';

const ToolsPage = observer(() => {
  const router = useRouter();
  const { showAlert } = useAlert();

  useEffect(() => {
    if (!authStore.signedIn) return;
    setShowAlertOnStore();
    toolsStore.loadTools();
  });

  // eslint-disable-next-line
  const setShowAlertOnStore = () => {
    toolsStore.setShowAlert(showAlert);
  }

  const handleAddToolClick = () => {
    router.push('/tool-builder');
  };

  const handleToolClick = (tool: Tool) => {
    toolBuilderStore.setTool({ ...tool });
    router.push(`/tool-builder/${tool['tool_id']}`);
  };


  return (
    <Box p={6}>
      {/* Page Heading */}
      <Heading as="h1" size="xl" mb={6}>
        Tools
      </Heading>

      {/* Content Section */}
      {toolsStore.toolsLoading ? (
        <Flex justify="center" align="center" height="200px">
          <Spinner size="xl" />
        </Flex>
      ) : (
        <Box>
          <Flex direction="column" gap={6}>
            {/* Add Tool Button */}
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
              onClick={handleAddToolClick}
              minHeight="150px"
            >
              <Text fontWeight="bold" color="brand.500">
                + Add Tool
              </Text>
            </Flex>

            {/* Tool Cards */}
            {toolsStore.tools ? (
              toolsStore.tools.map((tool) => (
                <Card
                  key={tool['tool_id']}
                  shadow="md"
                  _hover={{ shadow: 'lg' }}
                  cursor="pointer"
                  onClick={() => handleToolClick(tool)}
                  minHeight="150px"
                >
                  <Flex h="100%" direction="column">
                    <Heading as="h3" size="md" mb={2} isTruncated>
                      {tool.name}
                    </Heading>
                    <Text fontSize="sm" color="gray.500" isTruncated>
                      {tool.description}
                    </Text>
                  </Flex>
                </Card>
              ))
            ) : (
              <Text>No tools found</Text>
            )}
          </Flex>
        </Box>
      )}
    </Box>
  );
});

export default ToolsPage;
