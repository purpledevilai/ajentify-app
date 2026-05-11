'use client';

import { Box, Button, Text, Heading } from '@chakra-ui/react';

export default function SreBuilderError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <Box p={6} textAlign="center">
      <Heading size="md" mb={2}>Something went wrong</Heading>
      <Text color="gray.500" mb={4}>{error.message}</Text>
      <Button onClick={reset} colorScheme="blue">Try again</Button>
    </Box>
  );
}
