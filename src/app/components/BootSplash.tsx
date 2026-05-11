'use client';
import { Box, Spinner, Text } from '@chakra-ui/react';

export function BootSplash() {
  return (
    <Box
      position="fixed"
      top={0}
      left={0}
      right={0}
      bottom={0}
      display="flex"
      flexDirection="column"
      alignItems="center"
      justifyContent="center"
      bg="white"
      zIndex={9999}
    >
      <Spinner size="xl" color="blue.500" mb={4} />
      <Text color="gray.500" fontSize="sm">Preparing your workspace...</Text>
    </Box>
  );
}
