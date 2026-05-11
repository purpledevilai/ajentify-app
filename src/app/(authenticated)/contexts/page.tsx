'use client';

import React, { useEffect, useMemo, useState } from 'react';
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
import { useStores } from '@/store/StoreContext';
import { InlineError } from '@/app/components/InlineError';
import { CopyButton } from './CopyButton';

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
    const { agents: agentsStore, auth: authStore, contexts: contextsStore } = useStores();

    // Draft filter inputs (typed but not yet applied). Initialised from the
    // store's currently-applied filters so the inputs reflect the data the
    // user is looking at when they navigate back from a context detail page.
    const [agentDraft, setAgentDraft] = useState<string>(contextsStore.appliedAgentId);
    const [clientDraft, setClientDraft] = useState<string>(contextsStore.appliedClientId);
    const [contextIdDraft, setContextIdDraft] = useState<string>(contextsStore.appliedContextId);

    const subtextColor = useColorModeValue('gray.500', 'gray.400');
    const tableBorder = useColorModeValue('gray.200', 'gray.700');
    const hoverBg = useColorModeValue('gray.50', 'gray.700');

    useEffect(() => {
        if (!authStore.signedIn) return;
        agentsStore.loadAgents();
        // Honours the cache: only fetches if the store hasn't been loaded yet
        // in this session, so navigating into a context and back doesn't
        // trigger a refetch.
        contextsStore.loadContexts();
    }, [agentsStore, authStore.signedIn, contextsStore]);

    const handleApplyFilters = () => {
        contextsStore.setFilters({
            agentId: agentDraft,
            clientId: clientDraft.trim(),
            contextId: contextIdDraft.trim(),
        });
        contextsStore.loadContexts(true);
    };

    const handleClearFilters = () => {
        const hadAppliedFilters =
            !!contextsStore.appliedAgentId ||
            !!contextsStore.appliedClientId ||
            !!contextsStore.appliedContextId;
        setAgentDraft('');
        setClientDraft('');
        setContextIdDraft('');
        contextsStore.setFilters({ agentId: '', clientId: '', contextId: '' });
        if (hadAppliedFilters) {
            contextsStore.loadContexts(true);
        }
    };

    const handleRefresh = () => {
        contextsStore.loadContexts(true);
    };

    const handleRowClick = (context_id: string) => {
        router.push(`/contexts/${context_id}`);
    };

    const handleLoadMore = () => {
        contextsStore.loadMore();
    };

    const agentNameById = useMemo(() => {
        const map = new Map<string, string>();
        for (const a of agentsStore.agents || []) {
            map.set(a.agent_id, a.agent_name);
        }
        return map;
    }, [agentsStore.agents]);

    const { contexts, loading, loadingMore, nextCursor, appliedAgentId, appliedClientId, appliedContextId } = contextsStore;
    const hasAnyDraftOrApplied =
        !!appliedAgentId ||
        !!appliedClientId ||
        !!appliedContextId ||
        !!agentDraft ||
        !!clientDraft ||
        !!contextIdDraft;
    const hasAnyAppliedFilter = !!appliedAgentId || !!appliedClientId || !!appliedContextId;

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

                <Box flex="1" minW="220px">
                    <Text fontSize="sm" mb={1} color={subtextColor}>Context ID</Text>
                    <InputGroup size="sm">
                        <InputLeftElement pointerEvents="none">
                            <SearchIcon color="gray.400" />
                        </InputLeftElement>
                        <Input
                            placeholder="Exact context_id..."
                            value={contextIdDraft}
                            onChange={(e) => setContextIdDraft(e.target.value)}
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
                        isDisabled={!hasAnyDraftOrApplied}
                    >
                        Clear
                    </Button>
                </Flex>
            </Flex>

            {loading && (
                <Flex justify="center" align="center" height="200px">
                    <Spinner size="xl" />
                </Flex>
            )}
            {contextsStore.contextsError && (
                <InlineError message={contextsStore.contextsError} onRetry={() => contextsStore.loadContexts(true)} />
            )}
            {!loading && !contextsStore.contextsError && (
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
                                {hasAnyAppliedFilter
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
                                onClick={handleLoadMore}
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
