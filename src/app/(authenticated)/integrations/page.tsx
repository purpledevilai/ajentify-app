'use client';

import React, { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { observer } from 'mobx-react-lite';
import { integrationsStore } from '@/store/IntegrationsStore';
import { integrationBuilderStore } from '@/store/IntegrationBuilderStore';
import { Integration } from '@/types/integration';
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
import { authStore } from '@/store/AuthStore';

const IntegrationsPage = observer(() => {
  const router = useRouter();
  const { showAlert } = useAlert();

  useEffect(() => {
    if (!authStore.signedIn) return;
    integrationsStore.setShowAlert(showAlert);
    integrationsStore.loadIntegrations();
  });

  const handleAddIntegrationClick = () => {
    integrationBuilderStore.reset();
    integrationBuilderStore.isNew = true;
    router.push('/integration-builder');
  };

  const handleIntegrationClick = (integration: Integration) => {
    integrationBuilderStore.setType(integration.type);
    router.push(`/integration-builder/${integration.integration_id}`);
  };

  return (
    <Box p={6}>
      <Heading as="h1" size="xl" mb={6}>
        Integrations
      </Heading>
      {integrationsStore.integrationsLoading ? (
        <Flex justify="center" align="center" height="200px">
          <Spinner size="xl" />
        </Flex>
      ) : (
        <Box>
          <Grid templateColumns="repeat(auto-fill, minmax(200px, 1fr))" gap={6}>
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
                onClick={handleAddIntegrationClick}
                minHeight="150px"
              >
                <Text fontWeight="bold" color="brand.500">
                  + Add Integration
                </Text>
              </Flex>
            </GridItem>
            {integrationsStore.integrations ? (
              integrationsStore.integrations.map((integration) => (
                <GridItem key={integration.integration_id}>
                  <Card
                    shadow="md"
                    _hover={{ shadow: 'lg' }}
                    cursor="pointer"
                    onClick={() => handleIntegrationClick(integration)}
                    minHeight="150px"
                  >
                    <Flex h="100%" direction="column">
                      <Heading as="h3" size="md" mb={2} isTruncated>
                        {integration.type}
                      </Heading>
                    </Flex>
                  </Card>
                </GridItem>
              ))
            ) : (
              <Text>No integrations found</Text>
            )}
          </Grid>
        </Box>
      )}
    </Box>
  );
});

export default IntegrationsPage;
