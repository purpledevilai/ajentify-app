import { Box, BoxProps } from '@chakra-ui/react';

interface CardProps extends BoxProps {}

export default function Card({ children, ...props }: CardProps) {
  return (
    <Box
      bg="gray.50"
      border="1px solid"
      borderColor="gray.200" // Default borderColor for light mode
      _dark={{
        bg: "gray.900",
        border: "1px solid", // Reapply border for dark mode
        borderColor: "gray.700", // Dark mode borderColor
      }}
      borderRadius="md"
      boxShadow="lg"
      p={6}
      _hover={{ boxShadow: 'xl' }}
      {...props}
    >
      {children}
    </Box>
  );
}
