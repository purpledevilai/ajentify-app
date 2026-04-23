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

const COMPARISONS = [
    {
        name: 'LangChain',
        positioning:
            'A good wrapper around LLMs — handy for prototyping and stitching calls together. But it is not the infrastructure you need when you are putting AI into a production app: you still run the servers, manage memory, and build the chat surface yourself. Ajentify handles all of that for you (and happily wraps LangChain underneath).',
    },
    {
        name: 'OpenAI Assistants / Responses API',
        positioning:
            'OpenAI keeps rotating its agent API — Assistants is being deprecated, replaced by Responses + Conversations, with more churn to come. Every shift is your migration. And the moment you want Claude or Gemini, you rebuild. Ajentify wraps any model behind a stable API that does not shift under you.',
    },
    {
        name: 'Vercel AI SDK',
        positioning:
            'A TypeScript library for streaming AI into your Next.js or React app — great for the UI layer. It is not a backend: you still build persistent contexts, tool execution, memory, and eval yourself. Ajentify is a hosted backend you can call from it — the SDK handles the browser, Ajentify handles the rest.',
    },
    {
        name: 'Mastra / CrewAI',
        positioning:
            'Frameworks you install, import into your own codebase, and deploy yourself — on your EC2, your Kubernetes, your uptime. You own the infrastructure. Ajentify is a service: no deploys to babysit, no scaling to figure out, no version drift. HTTP in, HTTP out.',
    },
];

export default function WhyAjentifySection() {
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
                        Where Ajentify fits.
                    </Heading>
                    <Text fontSize={{ base: 'md', md: 'lg' }} color={descColor}>
                        There are a lot of tools in this space. Here&apos;s an honest take on where
                        Ajentify sits next to the ones you&apos;ve probably already looked at.
                    </Text>
                </Stack>

                <SimpleGrid columns={{ base: 1, md: 2 }} spacing={{ base: 4, md: 6 }}>
                    {COMPARISONS.map((item) => (
                        <Box
                            key={item.name}
                            bg={cardBg}
                            border="1px solid"
                            borderColor={cardBorder}
                            borderRadius="lg"
                            p={{ base: 6, md: 7 }}
                        >
                            <Text
                                fontSize="xs"
                                fontWeight="semibold"
                                color={accentColor}
                                textTransform="uppercase"
                                letterSpacing="wider"
                                mb="2"
                            >
                                vs {item.name}
                            </Text>
                            <Text color={descColor} fontSize={{ base: 'sm', md: 'md' }} lineHeight="1.7">
                                {item.positioning}
                            </Text>
                        </Box>
                    ))}
                </SimpleGrid>
            </Container>
        </Box>
    );
}
