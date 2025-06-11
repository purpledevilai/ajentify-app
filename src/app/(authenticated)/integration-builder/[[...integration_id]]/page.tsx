'use client';

import React, { useEffect } from 'react';
import { observer } from 'mobx-react-lite';
import {
  Flex,
  FormControl,
  FormLabel,
  Select,
  Heading,
  IconButton,
  Button,
} from '@chakra-ui/react';
import { ArrowBackIcon } from '@chakra-ui/icons';
import { useAlert } from '@/app/components/AlertProvider';
import { integrationBuilderStore } from '@/store/IntegrationBuilderStore';
import { authStore } from '@/store/AuthStore';

type Params = Promise<{ integration_id: string[] }>;

interface IntegrationBuilderPageProps {
  params: Params;
}

const IntegrationBuilderPage = observer(({ params }: IntegrationBuilderPageProps) => {
  const { showAlert } = useAlert();

  useEffect(() => {
    integrationBuilderStore.setShowAlert(showAlert);
    loadIntegrationId();
    return () => {
      integrationBuilderStore.reset();
    };
  }, []);

  const loadIntegrationId = async () => {
    const paramArray = (await params).integration_id ?? undefined;
    const id = paramArray ? paramArray[0] : undefined;
    if (!id) {
      integrationBuilderStore.isNew = true;
    }
  };

  const onConnectJira = () => {
    const userId = authStore.user?.id || '';
    const url = `https://auth.atlassian.com/authorize?audience=api.atlassian.com&client_id=chQV2R1rUq7Ydx9tznQrR32b5TWEfmTk&scope=read%3Ajira-work%20write%3Ajira-work&redirect_uri=https%3A%2F%2Fwww.ajentify.com%2Foath-grant-response&state=${userId}&response_type=code&prompt=consent`;
    window.location.href = url;
  };

  return (
    <Flex p={4} direction="column" alignItems="center" h="100%" w="100%">
      <Flex direction="row" w="100%" mb={8} gap={4} align="center">
        <IconButton
          aria-label="Back"
          icon={<ArrowBackIcon />}
          variant="ghost"
          color="inherit"
          _hover={{ bg: 'gray.200', _dark: { bg: 'gray.700' } }}
          onClick={() => window.history.back()}
        />
        <Heading flex="1">Integration Builder</Heading>
      </Flex>
      <Flex direction="column" w="100%" h="100%" maxW={800} gap={8}>
        <FormControl>
          <FormLabel>Integration Type</FormLabel>
          <Select
            value={integrationBuilderStore.type}
            onChange={(e) => integrationBuilderStore.setType(e.target.value)}
          >
            <option value="jira">Jira</option>
          </Select>
        </FormControl>
        {integrationBuilderStore.type === 'jira' && (
          <Button onClick={onConnectJira} colorScheme="purple">
            Connect to Jira
          </Button>
        )}
      </Flex>
    </Flex>
  );
});

export default IntegrationBuilderPage;
