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
    // Base URL and query parameters
    const baseUrl = "https://auth.atlassian.com/authorize";
    const clientId = process.env.NEXT_PUBLIC_JIRA_CLIENT_ID || "iNDi7s62IUH20FdOVH10kG9RTXgCaHgW";
    const redirectUri = process.env.NEXT_PUBLIC_OAUTH_CALLBACK_URL || "http://localhost:3000/oath-grant-response";
    const state = authStore.user?.id || '';
    const responseType = "code";
    const audience = "api.atlassian.com";
    const prompt = "consent";
    
    // List of all required scopes
    const scopes = [
      // Classic Jira scopes
      "read:jira-work",

      // Granular scopes for Jira Cloud
      "read:application-role:jira",
      "read:avatar:jira",
      "read:group:jira",
      "read:field:jira",
      "read:field.default-value:jira",
      "read:field.option:jira",
      "read:issue-details:jira",
      "read:issue-type:jira",
      "read:issue-type-hierarchy:jira",
      "read:user:jira",
      "read:project:jira",
      "read:project-category:jira",
      "read:project.component:jira",
      "read:project.property:jira",
      "read:project-version:jira",
      "read:jql:jira",
      "read:board-scope:jira-software",
      "read:epic:jira-software",
      "write:epic:jira-software",
      "read:sprint:jira-software",
      "write:sprint:jira-software",

      // To allow refresh tokens
      "offline_access"
    ];
    
    // Join scopes with spaces and encode for URL
    const scopeParam = encodeURIComponent(scopes.join(" "));
    
    // Construct the full URL with all parameters
    const url = `${baseUrl}?` + 
      `audience=${audience}&` +
      `client_id=${clientId}&` +
      `scope=${scopeParam}&` +
      `redirect_uri=${encodeURIComponent(redirectUri)}&` +
      `state=${encodeURIComponent(state)}&` +
      `response_type=${responseType}&` +
      `prompt=${prompt}`;
    
    console.log('Redirecting to Jira OAuth:', url);
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
