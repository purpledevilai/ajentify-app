'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { observer } from 'mobx-react-lite';
import { toolsStore } from '@/store/ToolsStore';
import { toolBuilderStore } from '@/store/ToolBuilderStore';
import {
  Box,
  Heading,
  Grid,
  GridItem,
  Flex,
  Text,
  Spinner,
} from '@chakra-ui/react';
import Card from '@/app/components/Card';
import { useAlert } from '@/app/components/AlertProvider';

const ToolsPage = observer(() => {
  const router = useRouter();
  const { showAlert } = useAlert();

//   useEffect(() => {
//     if (!authStore.signedIn) return;
//     setShowAlertOnStore();
//     toolsStore.loadTools();
//   });

  const setShowAlertOnStore = () => {
    toolsStore.setShowAlert(showAlert);
  }

  const handleAddToolClick = () => {
    router.push('/tool-builder');
  };

  const handleToolClick = (tool: Record<string, any>) => {
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
          <Grid templateColumns="repeat(auto-fill, minmax(200px, 1fr))" gap={6}>
            {/* Add Tool Button */}
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
                onClick={handleAddToolClick}
                minHeight="150px" // Uniform height for all cards
              >
                <Text fontWeight="bold" color="brand.500">
                  + Add Tool
                </Text>
              </Flex>
            </GridItem>

            {/* Agent Cards */}
            {toolsStore.tools ? (
              toolsStore.tools.map((tool) => (
                <GridItem key={tool['tool_id']}>
                  <Card
                    shadow="md"
                    _hover={{ shadow: 'lg' }}
                    cursor="pointer"
                    onClick={() => handleToolClick(tool)}
                    minHeight="150px" // Uniform height for all cards
                  >
                    <Flex h="100%" direction="column">
                      <Heading as="h3" size="md" mb={2} isTruncated>
                        {tool.agent_name}
                      </Heading>
                      <Text fontSize="sm" color="gray.500" isTruncated>
                        {tool.agent_description}
                      </Text>
                    </Flex>
                  </Card>
                </GridItem>
              ))
            ) : (
              <Text>No tools found</Text>
            )}
          </Grid>
        </Box>
      )}
    </Box>
  );
});

export default ToolsPage;
