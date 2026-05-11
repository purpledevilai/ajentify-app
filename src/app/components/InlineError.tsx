'use client';
import { Box, Text, Button } from '@chakra-ui/react';

interface InlineErrorProps {
  message: string;
  onRetry?: () => void;
}

export function InlineError({ message, onRetry }: InlineErrorProps) {
  return (
    <Box p={4} borderRadius="md" bg="red.50" borderWidth={1} borderColor="red.200">
      <Text color="red.700" fontSize="sm">{message}</Text>
      {onRetry && (
        <Button size="sm" mt={2} colorScheme="red" variant="outline" onClick={onRetry}>
          Retry
        </Button>
      )}
    </Box>
  );
}
