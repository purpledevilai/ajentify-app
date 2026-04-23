'use client';

import {
    Box,
    Container,
    Heading,
    SimpleGrid,
    Stack,
    Text,
    useColorModeValue,
} from '@chakra-ui/react';

const PRIMITIVES = [
    {
        name: 'Agent',
        description: 'Prompt, model, tools, and behavior — defined once, invoked anywhere.',
    },
    {
        name: 'Context',
        description: 'The conversation window for an agent. Full message history, customizable memory, programmatic control of the loop.',
    },
    {
        name: 'Tool',
        description: 'Custom code an agent can invoke. Server-side, client-side, or async — your choice.',
    },
    {
        name: 'Structured Output',
        description: 'A typed JSON response endpoint. One prompt in, a predictable schema out.',
    },
    {
        name: 'Document',
        description: 'Durable, structured memory agents can read from and write to.',
    },
    {
        name: 'Data Window',
        description: 'Real-time cached context injected into an agent at runtime. Always fresh.',
    },
];

export default function SixPrimitivesSection() {
    const sectionBg = useColorModeValue('gray.50', 'gray.900');
    const cardBg = useColorModeValue('white', 'gray.800');
    const cardBorder = useColorModeValue('gray.200', 'gray.700');
    const descColor = useColorModeValue('gray.600', 'gray.400');
    const accentColor = useColorModeValue('brand.600', 'brand.300');

    return (
        <Box as="section" bg={sectionBg} py={{ base: 16, md: 24 }} px="6">
            <Container maxW="6xl">
                <Stack spacing={{ base: 3, md: 4 }} mb={{ base: 10, md: 14 }} maxW="3xl">
                    <Heading
                        as="h2"
                        size={{ base: 'xl', md: '2xl' }}
                        fontWeight="extrabold"
                        letterSpacing="-0.02em"
                    >
                        The Primitives.
                    </Heading>
                    <Text fontSize={{ base: 'md', md: 'lg' }} color={descColor}>
                        Agent · Context · Tool · Structured Output · Document · Data Window.
                        Compose them, ship anything.
                    </Text>
                </Stack>

                <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} spacing={{ base: 4, md: 6 }}>
                    {PRIMITIVES.map((primitive, idx) => (
                        <Box
                            key={primitive.name}
                            bg={cardBg}
                            border="1px solid"
                            borderColor={cardBorder}
                            borderRadius="lg"
                            p={{ base: 5, md: 6 }}
                            position="relative"
                            transition="border-color 150ms ease"
                            _hover={{ borderColor: accentColor }}
                        >
                            <Text
                                fontSize="xs"
                                fontWeight="semibold"
                                color={accentColor}
                                mb="3"
                                fontFamily="mono"
                            >
                                {String(idx + 1).padStart(2, '0')}
                            </Text>
                            <Heading
                                as="h3"
                                size="md"
                                fontWeight="bold"
                                mb="2"
                                letterSpacing="-0.01em"
                            >
                                {primitive.name}
                            </Heading>
                            <Text color={descColor} fontSize="sm" lineHeight="1.6">
                                {primitive.description}
                            </Text>
                        </Box>
                    ))}
                </SimpleGrid>
            </Container>
        </Box>
    );
}
