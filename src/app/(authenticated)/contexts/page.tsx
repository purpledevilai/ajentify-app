'use client';

import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { observer } from 'mobx-react-lite';
import {
    Box,
    Button,
    Flex,
    Heading,
    Input,
    InputGroup,
    InputLeftElement,
    Select,
    Spinner,
    Table,
    Thead,
    Tbody,
    Tr,
    Th,
    Td,
    TableContainer,
    Text,
    Badge,
    IconButton,
    useColorModeValue,
} from '@chakra-ui/react';
import { RepeatIcon, SearchIcon } from '@chakra-ui/icons';
import { agentsStore } from '@/store/AgentsStore';
import { authStore } from '@/store/AuthStore';
import { getOrgContexts } from '@/api/context/getOrgContexts';
import { OrgContextSummary } from '@/types/context';
import { useAlert } from '@/app/components/AlertProvider';
import { CopyButton } from './CopyButton';

const PAGE_SIZE = 25;

const formatTimestamp = (ts: number | undefined | null): string => {
    if (!ts) return '—';
    return new Date(ts * 1000).toLocaleString(undefined, {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
    });
};

const truncateId = (id: string): string =>
    id.length > 10 ? `${id.substring(0, 8)}…` : id;

const ContextsPage = observer(() => {
    const router = useRouter();
    const { showAlert } = useAlert();

    const [contexts, setContexts] = useState<OrgContextSummary[]>([]);
    const [loading, setLoading] = useState(false);
    const [loadingMore, setLoadingMore] = useState(false);
    const [nextCursor, setNextCursor] = useState<string | null>(null);

    // Applied filters (these drive the actual fetch).
    const [appliedAgentId, setAppliedAgentId] = useState<string>('');
    const [appliedClientId, setAppliedClientId] = useState<string>('');

    // Draft filter inputs (typed but not yet applied).
    const [agentDraft, setAgentDraft] = useState<string>('');
    const [clientDraft, setClientDraft] = useState<string>('');

    // `showAlert` from AlertProvider is recreated on every render of the
    // provider (e.g. when an alert opens/closes), so we keep a ref to it to
    // avoid invalidating `fetchPage`'s memoization and triggering a reload
    // every time the user copies an ID.
    const showAlertRef = useRef(showAlert);
    useEffect(() => {
        showAlertRef.current = showAlert;
    }, [showAlert]);

    const subtextColor = useColorModeValue('gray.500', 'gray.400');
    const tableBorder = useColorModeValue('gray.200', 'gray.700');
    const hoverBg = useColorModeValue('gray.50', 'gray.700');

    const fetchPage = useCallback(async (
        opts: { reset?: boolean; cursor?: string } = {}
    ) => {
        const { reset = false, cursor } = opts;
        if (reset) {
            setLoading(true);
        } else {
            setLoadingMore(true);
        }
        try {
            const response = await getOrgContexts({
                agent_id: appliedAgentId || undefined,
                client_id: appliedClientId || undefined,
                limit: PAGE_SIZE,
                cursor: cursor || undefined,
            });
            setNextCursor(response.next_cursor ?? null);
            setContexts((prev) =>
                reset ? response.contexts : [...prev, ...response.contexts]
            );
        } catch (error) {
            showAlertRef.current({
                title: 'Failed to load contexts',
                message: (error as Error).message || 'Unknown error',
            });
        } finally {
            if (reset) {
                setLoading(false);
            } else {
                setLoadingMore(false);
            }
        }
    }, [appliedAgentId, appliedClientId]);

    useEffect(() => {
        if (!authStore.signedIn) return;
        agentsStore.setShowAlert(showAlertRef.current);
        agentsStore.loadAgents();
        router.prefetch('/contexts');
    }, [router]);

    // Refetch the first page whenever applied filters change.
    useEffect(() => {
        if (!authStore.signedIn) return;
        fetchPage({ reset: true });
    }, [fetchPage]);

    const handleApplyFilters = () => {
        setAppliedAgentId(agentDraft);
        setAppliedClientId(clientDraft.trim());
    };

    const handleClearFilters = () => {
        setAgentDraft('');
        setClientDraft('');
        setAppliedAgentId('');
        setAppliedClientId('');
    };

    const handleRefresh = () => {
        fetchPage({ reset: true });
    };

    const handleRowClick = (context_id: string) => {
        router.push(`/contexts/${context_id}`);
    };

    const agentNameById = useMemo(() => {
        const map = new Map<string, string>();
        for (const a of agentsStore.agents || []) {
            map.set(a.agent_id, a.agent_name);
        }
        return map;
    }, [agentsStore.agents]);

    return (
        <Box p={{ base: 4, md: 6 }} h="100%" overflowY="auto">
            <Flex align="center" mb={4} gap={2} wrap="wrap">
                <Heading as="h1" size="xl" flex="1">
                    Contexts
                </Heading>
                <IconButton
                    aria-label="Refresh"
                    icon={<RepeatIcon />}
                    size="sm"
                    variant="outline"
                    onClick={handleRefresh}
                    isLoading={loading}
                />
            </Flex>

            <Text color={subtextColor} fontSize="sm" mb={4}>
                Read-only view of contexts created by API keys or via public agents in your organization.
                Cognito user contexts are intentionally excluded.
            </Text>

            <Flex gap={3} mb={4} wrap="wrap" align="flex-end">
                <Box flex="1" minW="200px">
                    <Text fontSize="sm" mb={1} color={subtextColor}>Agent</Text>
                    <Select
                        size="sm"
                        placeholder="All agents"
                        value={agentDraft}
                        onChange={(e) => setAgentDraft(e.target.value)}
                        isDisabled={agentsStore.agentsLoading}
                    >
                        {(agentsStore.agents || []).map((a) => (
                            <option key={a.agent_id} value={a.agent_id}>
                                {a.agent_name}
                            </option>
                        ))}
                    </Select>
                </Box>

                <Box flex="1" minW="220px">
                    <Text fontSize="sm" mb={1} color={subtextColor}>Client ID</Text>
                    <InputGroup size="sm">
                        <InputLeftElement pointerEvents="none">
                            <SearchIcon color="gray.400" />
                        </InputLeftElement>
                        <Input
                            placeholder="Filter by client_id..."
                            value={clientDraft}
                            onChange={(e) => setClientDraft(e.target.value)}
                            onKeyDown={(e) => {
                                if (e.key === 'Enter') handleApplyFilters();
                            }}
                            fontFamily="mono"
                        />
                    </InputGroup>
                </Box>

                <Flex gap={2} flexShrink={0}>
                    <Button size="sm" colorScheme="brand" onClick={handleApplyFilters}>
                        Apply
                    </Button>
                    <Button
                        size="sm"
                        variant="outline"
                        onClick={handleClearFilters}
                        isDisabled={!appliedAgentId && !appliedClientId && !agentDraft && !clientDraft}
                    >
                        Clear
                    </Button>
                </Flex>
            </Flex>

            {loading ? (
                <Flex justify="center" align="center" height="200px">
                    <Spinner size="xl" />
                </Flex>
            ) : (
                <Flex direction="column" gap={4}>
                    {contexts.length > 0 ? (
                        <TableContainer
                            borderWidth="1px"
                            borderColor={tableBorder}
                            borderRadius="md"
                            overflowX="auto"
                        >
                            <Table variant="simple" size="md">
                                <Thead>
                                    <Tr>
                                        <Th>Updated</Th>
                                        <Th>Agent</Th>
                                        <Th>Owner</Th>
                                        <Th>Client</Th>
                                        <Th>Last message</Th>
                                        <Th>Context ID</Th>
                                    </Tr>
                                </Thead>
                                <Tbody>
                                    {contexts.map((ctx) => {
                                        const agentName = agentNameById.get(ctx.agent_id) || ctx.agent_id;
                                        return (
                                            <Tr
                                                key={ctx.context_id}
                                                cursor="pointer"
                                                _hover={{ bg: hoverBg }}
                                                onClick={() => handleRowClick(ctx.context_id)}
                                            >
                                                <Td whiteSpace="nowrap">
                                                    <Text fontSize="sm">{formatTimestamp(ctx.updated_at)}</Text>
                                                </Td>
                                                <Td maxW="220px">
                                                    <Text fontSize="sm" noOfLines={1} fontWeight="medium">
                                                        {agentName}
                                                    </Text>
                                                </Td>
                                                <Td whiteSpace="nowrap">
                                                    <Badge
                                                        colorScheme={ctx.owner_kind === 'public' ? 'green' : 'blue'}
                                                        fontSize="xs"
                                                        textTransform="none"
                                                    >
                                                        {ctx.owner_kind === 'public' ? 'Public' : 'API Key'}
                                                    </Badge>
                                                </Td>
                                                <Td whiteSpace="nowrap">
                                                    {ctx.client_id ? (
                                                        <Flex align="center" gap={1}>
                                                            <Text fontSize="xs" fontFamily="mono" color={subtextColor}>
                                                                {truncateId(ctx.client_id)}
                                                            </Text>
                                                            <CopyButton
                                                                value={ctx.client_id}
                                                                ariaLabel="Copy client ID"
                                                            />
                                                        </Flex>
                                                    ) : (
                                                        <Text fontSize="xs" color={subtextColor}>—</Text>
                                                    )}
                                                </Td>
                                                <Td maxW="320px">
                                                    <Text fontSize="sm" color={subtextColor} noOfLines={1}>
                                                        {ctx.last_message_preview || '—'}
                                                    </Text>
                                                </Td>
                                                <Td whiteSpace="nowrap">
                                                    <Flex align="center" gap={1}>
                                                        <Text fontSize="xs" fontFamily="mono" color={subtextColor}>
                                                            {truncateId(ctx.context_id)}
                                                        </Text>
                                                        <CopyButton
                                                            value={ctx.context_id}
                                                            ariaLabel="Copy context ID"
                                                        />
                                                    </Flex>
                                                </Td>
                                            </Tr>
                                        );
                                    })}
                                </Tbody>
                            </Table>
                        </TableContainer>
                    ) : (
                        <Box
                            borderWidth="1px"
                            borderColor={tableBorder}
                            borderRadius="md"
                            py={12}
                            textAlign="center"
                        >
                            <Text color={subtextColor}>
                                {appliedAgentId || appliedClientId
                                    ? 'No contexts match the current filters.'
                                    : 'No API-key or public contexts in this organization yet.'}
                            </Text>
                        </Box>
                    )}

                    {nextCursor && (
                        <Flex justify="center">
                            <Button
                                size="sm"
                                variant="outline"
                                onClick={() => fetchPage({ cursor: nextCursor })}
                                isLoading={loadingMore}
                                loadingText="Loading more..."
                            >
                                Load more
                            </Button>
                        </Flex>
                    )}
                </Flex>
            )}
        </Box>
    );
});

export default ContextsPage;
