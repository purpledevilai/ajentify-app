'use client';

import {
    Box,
    Button,
    Container,
    Flex,
    Heading,
    Stack,
    Text,
    useColorModeValue,
} from '@chakra-ui/react';
import { ExternalLinkIcon } from '@chakra-ui/icons';
import { CodeSnippet } from '@/app/components/CodeSnippet';

const DOCS_URL = 'https://api.ajentify.com/docs';

const ONBOARDING_PROMPT = `Add an AI chat feature to my app using Ajentify.

Read the docs at ${DOCS_URL} — every endpoint, schema, and example is in there. Then:

1. Create an Agent and a Context for the current user.
2. Wire up a /chat call from my frontend, streaming responses.
3. Show me the exact code changes and where to put them.`;

export default function ForCodingAgentsSection() {
    const descColor = useColorModeValue('gray.600', 'gray.400');
    const cardBg = useColorModeValue('white', 'gray.800');
    const cardBorder = useColorModeValue('gray.200', 'gray.700');
    const accentColor = useColorModeValue('brand.600', 'brand.300');
    const eyebrowColor = useColorModeValue('brand.600', 'brand.300');
    const urlColor = useColorModeValue('gray.900', 'white');

    return (
        <Box as="section" py={{ base: 16, md: 24 }} px="6">
            <Container maxW="6xl">
                <Stack spacing={{ base: 3, md: 4 }} mb={{ base: 10, md: 14 }} maxW="3xl">
                    <Text
                        fontSize="sm"
                        fontWeight="semibold"
                        letterSpacing="wider"
                        textTransform="uppercase"
                        color={eyebrowColor}
                    >
                        Docs-first, agent-native
                    </Text>
                    <Heading
                        as="h2"
                        size={{ base: 'xl', md: '2xl' }}
                        fontWeight="extrabold"
                        letterSpacing="-0.02em"
                    >
                        Built to be read by AI.
                    </Heading>
                    <Text fontSize={{ base: 'md', md: 'lg' }} color={descColor}>
                        The API is plain HTTP — easy to call directly, easy to wrap in your own SDK.
                        The docs are structured so a coding agent can crawl them, understand the
                        full surface, and implement an integration end-to-end.
                    </Text>
                </Stack>

                <Box
                    bg={cardBg}
                    border="1px solid"
                    borderColor={cardBorder}
                    borderRadius="xl"
                    p={{ base: 6, md: 8 }}
                    mb={{ base: 8, md: 10 }}
                >
                    <Flex
                        direction={{ base: 'column', md: 'row' }}
                        align={{ base: 'flex-start', md: 'center' }}
                        justify="space-between"
                        gap={{ base: 5, md: 6 }}
                    >
                        <Stack spacing="1" flex="1">
                            <Text
                                fontSize="xs"
                                fontWeight="semibold"
                                color={accentColor}
                                textTransform="uppercase"
                                letterSpacing="wider"
                            >
                                The one URL your coding agent needs
                            </Text>
                            <Text
                                fontFamily="mono"
                                fontSize={{ base: 'md', md: 'xl' }}
                                fontWeight="bold"
                                color={urlColor}
                                wordBreak="break-all"
                            >
                                {DOCS_URL}
                            </Text>
                            <Text color={descColor} fontSize="sm" lineHeight="1.6" pt="1">
                                Every endpoint, request and response schema, and runnable example —
                                in one crawlable surface.
                            </Text>
                        </Stack>
                        <Button
                            as="a"
                            href={DOCS_URL}
                            target="_blank"
                            rel="noopener noreferrer"
                            size="lg"
                            variant="solid"
                            rightIcon={<ExternalLinkIcon />}
                            flexShrink={0}
                        >
                            View docs
                        </Button>
                    </Flex>
                </Box>

                <Stack spacing="3" maxW="3xl">
                    <Text fontSize="sm" fontWeight="semibold" color={descColor}>
                        The onboarding prompt (copy, paste, ship):
                    </Text>
                    <CodeSnippet language="markdown" code={ONBOARDING_PROMPT} />
                </Stack>
            </Container>
        </Box>
    );
}
