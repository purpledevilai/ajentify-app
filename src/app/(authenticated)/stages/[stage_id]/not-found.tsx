import { Box, Heading, Text } from '@chakra-ui/react';

export default function StageNotFound() {
  return (
    <Box p={6} textAlign="center">
      <Heading size="md" mb={2}>Not found</Heading>
      <Text color="gray.500">This resource doesn&apos;t exist or was deleted.</Text>
    </Box>
  );
}
