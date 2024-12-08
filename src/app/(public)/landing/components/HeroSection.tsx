import { Box, Button, Heading, Text } from '@chakra-ui/react';

export default function HeroSection() {
    return (
        <Box
            as="section"
            bg="brand.500"
            color="white"
            textAlign="center"
            py="10"
            px="6"
        >
            <Heading as="h1" size="2xl" mb="4">
                Welcome to Ajentify
            </Heading>
            <Text fontSize="lg" mb="6">
                Your AI agent platform. Automate tasks, solve problems, and streamline your workflow effortlessly.
            </Text>
            <Button bg="brand.300" size="lg">
                Get Started
            </Button>
        </Box>
    );
}
