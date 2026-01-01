'use client';

import React, { useEffect, useState } from 'react';
import { observer } from 'mobx-react-lite';
import { integrationsStore } from '@/store/IntegrationsStore';
import { authStore } from '@/store/AuthStore';
import { getGmailAuthUrl } from '@/api/integration/getGmailAuthUrl';
import { Integration } from '@/types/integration';
import {
  Box,
  Heading,
  Flex,
  Text,
  Spinner,
  Button,
  Spacer,
  Icon,
  useDisclosure,
  AlertDialog,
  AlertDialogBody,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogContent,
  AlertDialogOverlay,
} from '@chakra-ui/react';
import Card from '@/app/components/Card';
import { useAlert } from '@/app/components/AlertProvider';
import { FaGoogle } from 'react-icons/fa';

const IntegrationsPage = observer(() => {
  const { showAlert } = useAlert();
  const [connectingGmail, setConnectingGmail] = useState(false);
  const [integrationToDelete, setIntegrationToDelete] = useState<Integration | null>(null);
  const { isOpen, onOpen, onClose } = useDisclosure();
  const cancelRef = React.useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!authStore.signedIn) return;
    setShowAlertOnStore();
    integrationsStore.loadIntegrations();
  });

  const setShowAlertOnStore = () => {
    integrationsStore.setShowAlert(showAlert);
  };

  const handleConnectGmail = async () => {
    setConnectingGmail(true);
    try {
      const orgId = authStore.user?.organizations[0]?.id;
      const authUrl = await getGmailAuthUrl(orgId);
      window.location.href = authUrl;
    } catch (error) {
      showAlert({
        title: 'Error',
        message: (error as Error).message || 'Failed to connect Gmail',
      });
      setConnectingGmail(false);
    }
  };

  const handleDisconnectClick = (integration: Integration) => {
    setIntegrationToDelete(integration);
    onOpen();
  };

  const handleConfirmDisconnect = async () => {
    if (integrationToDelete) {
      await integrationsStore.deleteIntegration(integrationToDelete.integration_id);
      setIntegrationToDelete(null);
      onClose();
    }
  };

  const formatDate = (timestamp: number) => {
    return new Date(timestamp * 1000).toLocaleDateString();
  };

  const gmailIntegrations = integrationsStore.getGmailIntegrations();

  return (
    <Box p={6}>
      {/* Page Heading */}
      <Heading as="h1" size="xl" mb={6}>
        Integrations
      </Heading>

      {/* Content Section */}
      {integrationsStore.integrationsLoading ? (
        <Flex justify="center" align="center" height="200px">
          <Spinner size="xl" />
        </Flex>
      ) : (
        <Box>
          {/* Gmail Section */}
          <Heading as="h2" size="lg" mb={4}>
            Gmail
          </Heading>
          <Text color="gray.500" mb={4}>
            Connect your Gmail account to allow agents to read and send emails on your behalf.
          </Text>

          <Flex direction="column" gap={6}>
            {/* Connect Gmail Button */}
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
              onClick={handleConnectGmail}
              minHeight="100px"
            >
              {connectingGmail ? (
                <Spinner size="md" />
              ) : (
                <Flex align="center" gap={2}>
                  <Icon as={FaGoogle} />
                  <Text fontWeight="bold" color="brand.500">
                    + Connect Gmail Account
                  </Text>
                </Flex>
              )}
            </Flex>

            {/* Gmail Integration Cards */}
            {gmailIntegrations.length > 0 ? (
              gmailIntegrations.map((integration) => (
                <Card key={integration.integration_id} minHeight="100px">
                  <Flex h="100%" direction="column">
                    <Flex align="center" gap={3} mb={2}>
                      <Icon as={FaGoogle} boxSize={5} color="red.500" />
                      <Heading as="h3" size="md" isTruncated>
                        {integration.integration_config.email || 'Gmail Account'}
                      </Heading>
                    </Flex>
                    <Text fontSize="sm" color="gray.500">
                      Connected {formatDate(integration.created_at)}
                    </Text>
                    <Spacer />
                    <Flex mt={4}>
                      <Button
                        size="sm"
                        variant="outline"
                        colorScheme="red"
                        onClick={() => handleDisconnectClick(integration)}
                        isLoading={integrationsStore.deleteLoading && integrationToDelete?.integration_id === integration.integration_id}
                      >
                        Disconnect
                      </Button>
                    </Flex>
                  </Flex>
                </Card>
              ))
            ) : (
              <Text color="gray.500">No Gmail accounts connected yet.</Text>
            )}
          </Flex>
        </Box>
      )}

      {/* Disconnect Confirmation Dialog */}
      <AlertDialog
        isOpen={isOpen}
        leastDestructiveRef={cancelRef}
        onClose={onClose}
      >
        <AlertDialogOverlay>
          <AlertDialogContent>
            <AlertDialogHeader fontSize="lg" fontWeight="bold">
              Disconnect Gmail
            </AlertDialogHeader>

            <AlertDialogBody>
              Are you sure you want to disconnect {integrationToDelete?.integration_config.email}? 
              Agents will no longer be able to access this Gmail account.
            </AlertDialogBody>

            <AlertDialogFooter>
              <Button ref={cancelRef} onClick={onClose}>
                Cancel
              </Button>
              <Button 
                colorScheme="red" 
                onClick={handleConfirmDisconnect} 
                ml={3}
                isLoading={integrationsStore.deleteLoading}
              >
                Disconnect
              </Button>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialogOverlay>
      </AlertDialog>
    </Box>
  );
});

export default IntegrationsPage;

