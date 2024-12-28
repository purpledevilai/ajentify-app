import { Box, BoxProps } from '@chakra-ui/react';

export default function Card({ children, ...props }: BoxProps) {
  return (
    <Box
      bg="gray.50"
      border="1px solid"
      borderColor="gray.200"
      _dark={{
        bg: "gray.900",
        border: "1px solid",
        borderColor: "gray.700",
      }}
      borderRadius="md"
      boxShadow="lg"
      p={6}
      _hover={{ boxShadow: 'xl' }}
      display="flex"
      flexDirection="column"
      height="100%"
      {...props}
    >
      {children}
    </Box>
  );
}
