'use client';

import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import {
    Box,
    Button,
    Flex,
    Heading,
    Spinner,
    Text,
    Badge,
    SimpleGrid,
    useColorModeValue,
    Divider,
} from '@chakra-ui/react';
import { ArrowBackIcon } from '@chakra-ui/icons';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { oneDark, oneLight } from 'react-syntax-highlighter/dist/esm/styles/prism';
import { authStore } from '@/store/AuthStore';
import { getContext } from '@/api/context/getContext';
import { Context, Message } from '@/types/context';
import { CopyButton } from '../CopyButton';

const formatTimestamp = (ts: number | undefined | null): string => {
    if (!ts) return '—';
    return new Date(ts * 1000).toLocaleString();
};

/**
 * Pretty-print a string as JSON if it parses, otherwise show as plain text.
 * Used for tool_output where the content is a string but is often JSON.
 */
const JsonOrText = ({ value }: { value: string }) => {
    const syntaxStyle = useColorModeValue(oneLight, oneDark);
    const textBg = useColorModeValue('gray.50', 'gray.800');
    let parsed: unknown = null;
    let isJson = false;
    if (value && (value.trimStart().startsWith('{') || value.trimStart().startsWith('['))) {
        try {
            parsed = JSON.parse(value);
            isJson = true;
        } catch {
            isJson = false;
        }
    }
    if (isJson) {
        return (
            <Box borderRadius="md" overflow="hidden" maxH="400px" overflowY="auto">
                <SyntaxHighlighter
                    language="json"
                    style={syntaxStyle}
                    customStyle={{ padding: '0.75rem', margin: 0, fontSize: '0.85rem' }}
                >
                    {JSON.stringify(parsed, null, 2)}
                </SyntaxHighlighter>
            </Box>
        );
    }
    return (
        <Box
            as="pre"
            whiteSpace="pre-wrap"
            wordBreak="break-word"
            fontFamily="mono"
            fontSize="sm"
            p={3}
            borderRadius="md"
            bg={textBg}
            maxH="400px"
            overflowY="auto"
        >
            {value || '(empty)'}
        </Box>
    );
};

const JsonBlock = ({ value }: { value: unknown }) => {
    const syntaxStyle = useColorModeValue(oneLight, oneDark);
    return (
        <Box borderRadius="md" overflow="hidden" maxH="400px" overflowY="auto">
            <SyntaxHighlighter
                language="json"
                style={syntaxStyle}
                customStyle={{ padding: '0.75rem', margin: 0, fontSize: '0.85rem' }}
            >
                {JSON.stringify(value ?? null, null, 2)}
            </SyntaxHighlighter>
        </Box>
    );
};

const HeaderField = ({
    label,
    value,
    copyable,
}: {
    label: string;
    value: React.ReactNode;
    copyable?: string;
}) => {
    const labelColor = useColorModeValue('gray.500', 'gray.400');
    return (
        <Box>
            <Text fontSize="xs" color={labelColor} textTransform="uppercase" letterSpacing="wide">
                {label}
            </Text>
            <Flex align="center" gap={1}>
                <Text fontSize="sm" fontFamily={copyable ? 'mono' : undefined} wordBreak="break-all">
                    {value || '—'}
                </Text>
                {copyable && (
                    <CopyButton value={copyable} ariaLabel={`Copy ${label}`} />
                )}
            </Flex>
        </Box>
    );
};

const senderBadgeColor: Record<string, string> = {
    human: 'blue',
    ai: 'purple',
    system: 'gray',
};

const TextMessageCard = ({ msg }: { msg: Extract<Message, { sender: string }> }) => {
    const cardBg = useColorModeValue('white', 'gray.800');
    const borderCol = useColorModeValue('gray.200', 'gray.700');
    return (
        <Box bg={cardBg} borderWidth="1px" borderColor={borderCol} borderRadius="md" p={4}>
            <Badge colorScheme={senderBadgeColor[msg.sender] || 'gray'} mb={2} textTransform="uppercase" fontSize="xs">
                {msg.sender}
            </Badge>
            <Text whiteSpace="pre-wrap" wordBreak="break-word" fontSize="sm">
                {msg.message}
            </Text>
        </Box>
    );
};

const ToolCallCard = ({
    msg,
}: {
    msg: Extract<Message, { type: 'tool_call' }>;
}) => {
    const cardBg = useColorModeValue('orange.50', 'orange.900');
    const borderCol = useColorModeValue('orange.200', 'orange.700');
    const labelColor = useColorModeValue('gray.600', 'gray.300');
    return (
        <Box bg={cardBg} borderWidth="1px" borderColor={borderCol} borderRadius="md" p={4}>
            <Flex align="center" gap={2} mb={2} wrap="wrap">
                <Badge colorScheme="orange" textTransform="uppercase" fontSize="xs">
                    Tool Call
                </Badge>
                <Text fontFamily="mono" fontSize="sm" fontWeight="semibold">
                    {msg.tool_name}
                </Text>
                <Text fontSize="xs" color={labelColor} fontFamily="mono">
                    {msg.tool_call_id}
                </Text>
            </Flex>
            <Text fontSize="xs" color={labelColor} mb={1}>Input</Text>
            <JsonBlock value={msg.tool_input ?? {}} />
        </Box>
    );
};

const ToolResponseCard = ({
    msg,
}: {
    msg: Extract<Message, { type: 'tool_response' }>;
}) => {
    const cardBg = useColorModeValue('teal.50', 'teal.900');
    const borderCol = useColorModeValue('teal.200', 'teal.700');
    const labelColor = useColorModeValue('gray.600', 'gray.300');
    return (
        <Box bg={cardBg} borderWidth="1px" borderColor={borderCol} borderRadius="md" p={4}>
            <Flex align="center" gap={2} mb={2} wrap="wrap">
                <Badge colorScheme="teal" textTransform="uppercase" fontSize="xs">
                    Tool Response
                </Badge>
                <Text fontSize="xs" color={labelColor} fontFamily="mono">
                    {msg.tool_call_id}
                </Text>
            </Flex>
            <Text fontSize="xs" color={labelColor} mb={1}>Output</Text>
            <JsonOrText value={msg.tool_output ?? ''} />
        </Box>
    );
};

const renderMessage = (msg: Message, index: number) => {
    if ('sender' in msg) {
        return <TextMessageCard key={index} msg={msg} />;
    }
    if (msg.type === 'tool_call') {
        return <ToolCallCard key={index} msg={msg} />;
    }
    if (msg.type === 'tool_response') {
        return <ToolResponseCard key={index} msg={msg} />;
    }
    return null;
};

export default function ContextDetailPage() {
    const router = useRouter();
    const params = useParams<{ context_id: string }>();
    const contextId = params?.context_id as string;

    const [context, setContext] = useState<Context | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const headerCardBg = useColorModeValue('white', 'gray.800');

    useEffect(() => {
        if (!authStore.signedIn || !contextId) return;
        let cancelled = false;
        const load = async () => {
            setLoading(true);
            setError(null);
            try {
                const c = await getContext({ context_id: contextId, with_tool_calls: true });
                if (!cancelled) setContext(c);
            } catch (e) {
                if (!cancelled) setError((e as Error).message || 'Failed to load context');
            } finally {
                if (!cancelled) setLoading(false);
            }
        };
        load();
        return () => { cancelled = true; };
    }, [contextId]);

    return (
        <Box p={{ base: 4, md: 6 }} h="100%" overflowY="auto">
            <Flex align="center" mb={4} gap={2}>
                <Button
                    leftIcon={<ArrowBackIcon />}
                    size="sm"
                    variant="ghost"
                    onClick={() => router.push('/contexts')}
                >
                    Back
                </Button>
                <Heading as="h1" size="lg" flex="1" noOfLines={1}>
                    Context
                </Heading>
            </Flex>

            {loading && (
                <Flex justify="center" align="center" py={12}>
                    <Spinner size="xl" />
                </Flex>
            )}

            {error && !loading && (
                <Box p={4} mb={6} bg="red.50" _dark={{ bg: 'red.900' }} borderRadius="md">
                    <Text color="red.500">{error}</Text>
                </Box>
            )}

            {!loading && !error && context && (
                <Flex direction="column" gap={6}>
                    <Box
                        borderWidth="1px"
                        borderRadius="md"
                        p={4}
                        bg={headerCardBg}
                    >
                        <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} spacingY={3} spacingX={6}>
                            <HeaderField
                                label="Context ID"
                                value={context.context_id}
                                copyable={context.context_id}
                            />
                            <HeaderField
                                label="Agent ID"
                                value={
                                    <Text
                                        as="a"
                                        color="blue.500"
                                        cursor="pointer"
                                        onClick={() => router.push(`/agent-builder/${context.agent_id}`)}
                                    >
                                        {context.agent_id}
                                    </Text>
                                }
                                copyable={context.agent_id}
                            />
                            <HeaderField
                                label="Owner (user_id)"
                                value={context.user_id || '—'}
                                copyable={context.user_id}
                            />
                            <HeaderField
                                label="Client ID"
                                value={context.client_id || '—'}
                                copyable={context.client_id || undefined}
                            />
                            <HeaderField
                                label="Org ID"
                                value={context.org_id || '—'}
                                copyable={context.org_id || undefined}
                            />
                            <HeaderField label="Model" value={context.model_id || '—'} />
                            <HeaderField label="Created" value={formatTimestamp(context.created_at)} />
                            <HeaderField label="Updated" value={formatTimestamp(context.updated_at)} />
                            <HeaderField label="Expires" value={formatTimestamp(context.expires_at)} />
                        </SimpleGrid>

                        {context.user_defined && Object.keys(context.user_defined).length > 0 && (
                            <Box mt={4}>
                                <Divider mb={3} />
                                <Text fontSize="xs" color="gray.500" textTransform="uppercase" letterSpacing="wide" mb={2}>
                                    user_defined
                                </Text>
                                <JsonBlock value={context.user_defined} />
                            </Box>
                        )}
                    </Box>

                    <Box>
                        <Heading as="h2" size="md" mb={3}>
                            Messages ({context.messages?.length ?? 0})
                        </Heading>
                        {(!context.messages || context.messages.length === 0) ? (
                            <Box
                                borderWidth="1px"
                                borderRadius="md"
                                py={10}
                                textAlign="center"
                                color="gray.500"
                            >
                                <Text>No messages.</Text>
                            </Box>
                        ) : (
                            <Flex direction="column" gap={3}>
                                {context.messages.map((m, i) => renderMessage(m, i))}
                            </Flex>
                        )}
                    </Box>
                </Flex>
            )}
        </Box>
    );
}
