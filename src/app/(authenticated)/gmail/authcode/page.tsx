'use client';

import { useEffect, useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { exchangeGmailCode } from '@/api/integration/exchangeGmailCode';
import {
  Box,
  Flex,
  Heading,
  Text,
  Spinner,
  Button,
  Icon,
} from '@chakra-ui/react';
import { CheckCircleIcon, WarningIcon } from '@chakra-ui/icons';

function GmailAuthCallbackContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const code = searchParams.get('code');
    const state = searchParams.get('state'); // Contains org_id if provided
    const errorParam = searchParams.get('error');

    if (errorParam) {
      setStatus('error');
      setError(`Google OAuth error: ${errorParam}`);
      return;
    }

    if (!code) {
      setStatus('error');
      setError('No authorization code received');
      return;
    }

    // Exchange the code for tokens
    exchangeCode(code, state);
  }, [searchParams]);

  async function exchangeCode(code: string, orgId: string | null) {
    try {
      await exchangeGmailCode(code, orgId || undefined);
      setStatus('success');

      // Redirect to integrations page after short delay
      setTimeout(() => {
        router.push('/integrations');
      }, 2000);
    } catch (err) {
      setStatus('error');
      setError(err instanceof Error ? err.message : 'Failed to connect Gmail');
    }
  }

  const handleGoBack = () => {
    router.push('/integrations');
  };

  return (
    <Flex
      direction="column"
      align="center"
      justify="center"
      minH="100vh"
      p={8}
    >
      <Box
        bg="gray.50"
        _dark={{ bg: 'gray.800' }}
        borderRadius="lg"
        p={8}
        textAlign="center"
        maxW="400px"
        w="100%"
        boxShadow="lg"
      >
        {status === 'loading' && (
          <>
            <Spinner size="xl" color="brand.500" mb={4} />
            <Heading size="md" mb={2}>
              Connecting Gmail
            </Heading>
            <Text color="gray.500">
              Please wait while we connect your Gmail account...
            </Text>
          </>
        )}

        {status === 'success' && (
          <>
            <Icon as={CheckCircleIcon} boxSize={12} color="green.500" mb={4} />
            <Heading size="md" mb={2}>
              Gmail Connected!
            </Heading>
            <Text color="gray.500" mb={4}>
              Your Gmail account has been successfully connected.
            </Text>
            <Text fontSize="sm" color="gray.400">
              Redirecting to integrations...
            </Text>
          </>
        )}

        {status === 'error' && (
          <>
            <Icon as={WarningIcon} boxSize={12} color="red.500" mb={4} />
            <Heading size="md" mb={2}>
              Connection Failed
            </Heading>
            <Text color="gray.500" mb={4}>
              {error}
            </Text>
            <Button onClick={handleGoBack} colorScheme="brand">
              Go to Integrations
            </Button>
          </>
        )}
      </Box>
    </Flex>
  );
}

export default function GmailAuthCallbackPage() {
  return (
    <Suspense
      fallback={
        <Flex
          direction="column"
          align="center"
          justify="center"
          minH="100vh"
          p={8}
        >
          <Spinner size="xl" />
        </Flex>
      }
    >
      <GmailAuthCallbackContent />
    </Suspense>
  );
}

