import { Box, Heading, Text, VStack } from '@chakra-ui/react';

export default function BenefitsSection() {
    return (
        <Box as="section" py="10" px="6" textAlign="center">
            <Heading as="h2" size="xl" mb="4">
                AI That Works the Way You Do
            </Heading>
            <VStack spacing="4" maxW="4xl" mx="auto">
                <Text>
                    No more fighting with low-code builders or black-box logic. Ajentify empowers developers to write tools using real code — bringing real-world context, APIs, and actions into your agent’s toolkit.
                </Text>
                <Text>
                    Whether you&apos;re calling an internal API, querying a database, or sending a webhook, Ajentify lets your agent handle it all with ease.
                </Text>
            </VStack>
        </Box>
    );
}