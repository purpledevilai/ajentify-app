import { Box, Heading, Text, VStack } from '@chakra-ui/react';

export default function StructuredResponsesSection() {
    return (
        <Box as="section" py="10" px="6" textAlign="center">
            <Heading as="h2" size="xl" mb="4">
                AI Endpoints, As Easy As It Should Be
            </Heading>
            <VStack spacing="4" maxW="3xl" mx="auto">
                <Text>
                    Not every job needs a full conversation. Sometimes, you just need a fast, structured response from a single prompt.
                </Text>
                <Text>
                    Ajentify lets you define these endpoints, customize the exact JSON output, and host them instantly — perfect for pipelines, functions, or anywhere LLM-powered insights are needed.
                </Text>
            </VStack>
        </Box>
    );
}