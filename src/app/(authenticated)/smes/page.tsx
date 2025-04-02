'use client';

import React, { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { observer } from 'mobx-react-lite';
import { singleMessageEndpointsStore } from '@/store/SingleMessageEndpointStore';
import { smeBuilderStore } from '@/store/SingleMessageEndpointBuilderStore';
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
import { SingleMessageEndpoint } from '@/types/singlemessageendpoint';
import { authStore } from '@/store/AuthStore';

const SMEsPage = observer(() => {
  const router = useRouter();
  const { showAlert } = useAlert();

  useEffect(() => {
    if (!authStore.signedIn) return;
    setShowAlertOnStore();
    singleMessageEndpointsStore.loadSMEs();
  });

  const setShowAlertOnStore = () => {
    singleMessageEndpointsStore.setShowAlert(showAlert);
  };

  const handleAddSMEClick = () => {
    smeBuilderStore.initiateNew();
    router.push('/sme-builder');
  };

  const handleSMEClick = (sme: SingleMessageEndpoint) => {
    smeBuilderStore.setSME({ ...sme });
    router.push(`/sme-builder/${sme.sme_id}`);
  };

  return (
    <Box p={6}>
      {/* Page Heading */}
      <Heading as="h1" size="xl" mb={6}>
        Single Message Endpoints
      </Heading>

      {/* Content Section */}
      {singleMessageEndpointsStore.smesLoading ? (
        <Flex justify="center" align="center" height="200px">
          <Spinner size="xl" />
        </Flex>
      ) : (
        <Box>
          <Grid templateColumns="repeat(auto-fill, minmax(200px, 1fr))" gap={6}>
            {/* Add SME Button */}
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
                onClick={handleAddSMEClick}
                minHeight="150px"
              >
                <Text fontWeight="bold" color="brand.500">
                  + Add SME
                </Text>
              </Flex>
            </GridItem>

            {/* SME Cards */}
            {singleMessageEndpointsStore.smes ? (
              singleMessageEndpointsStore.smes.map((sme) => (
                <GridItem key={sme.sme_id}>
                  <Card
                    shadow="md"
                    _hover={{ shadow: 'lg' }}
                    cursor="pointer"
                    onClick={() => handleSMEClick(sme)}
                    minHeight="150px"
                  >
                    <Flex h="100%" direction="column">
                      <Heading as="h3" size="md" mb={2} isTruncated>
                        {sme.name}
                      </Heading>
                      <Text fontSize="sm" color="gray.500" isTruncated>
                        {sme.description}
                      </Text>
                    </Flex>
                  </Card>
                </GridItem>
              ))
            ) : (
              <Text>No SMEs found</Text>
            )}
          </Grid>
        </Box>
      )}
    </Box>
  );
});

export default SMEsPage;
