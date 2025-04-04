'use client';

import React, { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { observer } from 'mobx-react-lite';
import { structuredResponseEndpointsStore } from '@/store/StructuredResponseEndpointStore';
import { sreBuilderStore } from '@/store/StructuredResponseEndpointBuilderStore';
import {
  Box,
  Heading,
  Grid,
  GridItem,
  Flex,
  Text,
  Spinner,
} from '@chakra-ui/react';
import { useAlert } from '@/app/components/AlertProvider';
import { StructuredResponseEndpoint } from '@/types/structuredresponseendpoint';
import { authStore } from '@/store/AuthStore';
import { SRECard } from './components/SRECard';

const SREsPage = observer(() => {
  const router = useRouter();
  const { showAlert } = useAlert();

  useEffect(() => {
    if (!authStore.signedIn) return;
    setShowAlertOnStore();
    structuredResponseEndpointsStore.loadSREs();
  });

  const setShowAlertOnStore = () => {
    structuredResponseEndpointsStore.setShowAlert(showAlert);
  };

  const handleAddSREClick = () => {
    sreBuilderStore.initiateNew();
    router.push('/sre-builder');
  };

  const handleSREClick = (sre: StructuredResponseEndpoint) => {
    sreBuilderStore.setSRE({ ...sre });
    router.push(`/sre-builder/${sre.sre_id}`);
  };

  return (
    <Box p={6}>
      {/* Page Heading */}
      <Heading as="h1" size="xl" mb={6}>
        Structured Response Endpoints
      </Heading>

      {/* Content Section */}
      {structuredResponseEndpointsStore.sresLoading ? (
        <Flex justify="center" align="center" height="200px">
          <Spinner size="xl" />
        </Flex>
      ) : (
        <Box>
          <Grid templateColumns="repeat(auto-fill, minmax(200px, 1fr))" gap={6}>
            {/* Add SRE Button */}
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
                onClick={handleAddSREClick}
                minHeight="150px"
              >
                <Text fontWeight="bold" color="brand.500">
                  + Add SRE
                </Text>
              </Flex>
            </GridItem>

            {/* SRE Cards */}
            {structuredResponseEndpointsStore.sres ? (
              structuredResponseEndpointsStore.sres.map((sre) => (
                <GridItem key={sre.sre_id}>
                  <SRECard
                    sre={sre}
                    handleClick={() => handleSREClick(sre)}
                  />
                </GridItem>
              ))
            ) : (
              <Text>No SREs found</Text>
            )}
          </Grid>
        </Box>
      )}
    </Box>
  );
});

export default SREsPage;
