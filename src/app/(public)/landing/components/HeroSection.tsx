'use client';

import {
    Box,
    Button,
    Container,
    Flex,
    Heading,
    HStack,
    Stack,
    Text,
    useClipboard,
    useColorModeValue,
} from '@chakra-ui/react';
import { CheckIcon, CopyIcon } from '@chakra-ui/icons';
import Link from 'next/link';
import { CodeSnippet } from '@/app/components/CodeSnippet';

const CODING_AGENT_PROMPT = `Add AI chat to my app using Ajentify. Read the docs at https://api.ajentify.com/docs and implement it end-to-end.`;

const CURL_EXAMPLE = `# 1) Create an agent
curl -X POST https://api.ajentify.com/agent \\
  -H "Authorization: $AJENTIFY_API_KEY" \\
  -d '{"name":"Support","prompt":"You help customers with their orders."}'

# 2) Give it a tool (your own code, running in your stack)
curl -X POST https://api.ajentify.com/tool \\
  -H "Authorization: $AJENTIFY_API_KEY" \\
  -d '{"name":"lookup_order","description":"Get an order by ID","schema":{...}}'

# 3) Start a conversation
curl -X POST https://api.ajentify.com/context \\
  -H "Authorization: $AJENTIFY_API_KEY" \\
  -d '{"agent_id":"agt_..."}'

# 4) Chat
curl -X POST https://api.ajentify.com/chat \\
  -H "Authorization: $AJENTIFY_API_KEY" \\
  -d '{"context_id":"ctx_...","message":"Where is order #4821?"}'`;

export default function HeroSection() {
    const { hasCopied, onCopy } = useClipboard(CODING_AGENT_PROMPT);

    const subheadColor = useColorModeValue('gray.700', 'gray.300');
    const eyebrowColor = useColorModeValue('brand.600', 'brand.300');
    const secondaryBtnColor = useColorModeValue('gray.700', 'gray.200');

    return (
        <Box as="section" position="relative" overflow="hidden" py={{ base: 16, md: 24 }} px="6">
            <Container maxW="6xl">
                <Stack spacing={{ base: 8, md: 10 }} align="flex-start">
                    <Text
                        fontSize="sm"
                        fontWeight="semibold"
                        letterSpacing="wider"
                        textTransform="uppercase"
                        color={eyebrowColor}
                    >
                        AI agents, as infrastructure
                    </Text>

                    <Heading
                        as="h1"
                        size={{ base: '2xl', md: '4xl' }}
                        fontWeight="extrabold"
                        letterSpacing="-0.02em"
                        lineHeight="1.05"
                    >
                        The Stripe of AI agents.
                    </Heading>

                    <Text
                        fontSize={{ base: 'lg', md: 'xl' }}
                        color={subheadColor}
                        maxW="3xl"
                        lineHeight="1.5"
                    >
                        The HTTP API for adding agents, memory, tools, and chat to any app — with
                        docs built to be read and implemented directly by coding agents like Cursor
                        and Claude Code.
                    </Text>

                    <Flex
                        direction={{ base: 'column', sm: 'row' }}
                        gap="3"
                        w={{ base: 'full', sm: 'auto' }}
                    >
                        <Button
                            size="lg"
                            variant="solid"
                            onClick={onCopy}
                            leftIcon={hasCopied ? <CheckIcon /> : <CopyIcon />}
                            px="7"
                        >
                            {hasCopied ? 'Prompt copied — paste into Cursor' : 'Give this to your coding agent'}
                        </Button>
                        <Link href="/signup" passHref>
                            <Button
                                size="lg"
                                variant="ghost"
                                color={secondaryBtnColor}
                                px="6"
                            >
                                Sign up
                            </Button>
                        </Link>
                    </Flex>

                    <Box w="full" pt={{ base: 2, md: 4 }}>
                        <HStack mb="2" spacing="2" color={subheadColor}>
                            <Text fontSize="sm">Or, from a terminal:</Text>
                        </HStack>
                        <CodeSnippet language="bash" code={CURL_EXAMPLE} />
                    </Box>
                </Stack>
            </Container>
        </Box>
    );
}
