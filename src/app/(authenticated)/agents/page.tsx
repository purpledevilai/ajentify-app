'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { observer } from 'mobx-react-lite';
import { agentsStore } from '@/store/AgentsStore';
import { agentBuilderStore } from '@/store/AgentBuilderStore';
import { toolsStore } from '@/store/ToolsStore';
import { modelsStore } from '@/store/ModelsStore';
import { Agent } from '@/types/agent';
import {
  Box,
  Heading,
  Flex,
  Text,
  Spinner,
  Button,
  Badge,
  IconButton,
  useColorModeValue,
  Popover,
  PopoverTrigger,
  PopoverContent,
  PopoverBody,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  TableContainer,
  Icon,
  Input,
  InputGroup,
  InputLeftElement,
} from '@chakra-ui/react';
import { CopyIcon, ChevronDownIcon, ChevronUpIcon, SearchIcon } from '@chakra-ui/icons';
import { useAlert } from '@/app/components/AlertProvider';
import { authStore } from '@/store/AuthStore';

type SortField = 'name' | 'model' | 'is_public' | 'created_at' | 'updated_at';
type SortDir = 'asc' | 'desc';

const DEFAULT_DIR: Record<SortField, SortDir> = {
  name: 'asc',
  model: 'asc',
  is_public: 'desc',
  created_at: 'desc',
  updated_at: 'desc',
};

const formatTimestamp = (ts: number | undefined): string => {
  if (!ts) return '—';
  return new Date(ts * 1000).toLocaleDateString(undefined, {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
};

const truncateId = (id: string): string => {
  return id.length > 8 ? `${id.substring(0, 8)}…` : id;
};

const SortableTh = ({
  field,
  sortField,
  sortDir,
  onSort,
  children,
  isNumeric,
  ...props
}: {
  field: SortField;
  sortField: SortField;
  sortDir: SortDir;
  onSort: (field: SortField) => void;
  children: React.ReactNode;
  isNumeric?: boolean;
} & React.ComponentProps<typeof Th>) => {
  const active = sortField === field;
  const activeColor = useColorModeValue('gray.800', 'white');
  const inactiveColor = useColorModeValue('gray.500', 'gray.400');

  return (
    <Th
      isNumeric={isNumeric}
      cursor="pointer"
      userSelect="none"
      onClick={() => onSort(field)}
      color={active ? activeColor : inactiveColor}
      _hover={{ color: activeColor }}
      transition="color 0.15s"
      {...props}
    >
      <Flex
        align="center"
        gap={1}
        justify={isNumeric ? 'flex-end' : 'flex-start'}
        display="inline-flex"
      >
        {children}
        {active ? (
          <Icon as={sortDir === 'asc' ? ChevronUpIcon : ChevronDownIcon} boxSize={3.5} />
        ) : (
          <Box w={3.5} />
        )}
      </Flex>
    </Th>
  );
};

const AgentRow = observer(({ agent, onClick }: { agent: Agent; onClick: () => void }) => {
  const [idHovered, setIdHovered] = useState(false);
  const [toolsOpen, setToolsOpen] = useState(false);
  const { showAlert } = useAlert();

  const hoverBg = useColorModeValue('gray.50', 'gray.700');
  const subtextColor = useColorModeValue('gray.500', 'gray.400');

  const model = agent.model_id ? modelsStore.getModelByName(agent.model_id) : null;
  const modelLabel = model ? model.model : 'Default';
  const modelColor = model
    ? model.model_provider === 'anthropic'
      ? 'orange'
      : 'teal'
    : 'gray';

  const toolNames = (agent.tools || []).map((toolId) => {
    const tool = toolsStore.tools?.find((t) => t.tool_id === toolId);
    return tool ? tool.name : toolId;
  });

  const handleCopyId = (e: React.MouseEvent) => {
    e.stopPropagation();
    navigator.clipboard.writeText(agent.agent_id);
    showAlert({ title: 'Copied', message: 'Agent ID copied to clipboard' });
  };

  return (
    <Tr
      cursor="pointer"
      _hover={{ bg: hoverBg }}
      onClick={onClick}
      transition="background 0.15s"
    >
      {/* Name */}
      <Td fontWeight="semibold" maxW="200px">
        <Text noOfLines={1}>{agent.agent_name}</Text>
      </Td>

      {/* ID */}
      <Td w="1px" whiteSpace="nowrap">
        <Flex
          align="center"
          justify="center"
          minW="110px"
          onMouseEnter={() => setIdHovered(true)}
          onMouseLeave={() => setIdHovered(false)}
        >
          {idHovered ? (
            <IconButton
              aria-label="Copy agent ID"
              icon={<CopyIcon />}
              size="xs"
              variant="ghost"
              onClick={handleCopyId}
            />
          ) : (
            <Text fontSize="xs" fontFamily="mono" color={subtextColor} userSelect="none">
              {truncateId(agent.agent_id)}
            </Text>
          )}
        </Flex>
      </Td>

      {/* Description */}
      <Td maxW="300px">
        <Text fontSize="sm" color={subtextColor} noOfLines={1}>
          {agent.agent_description || '—'}
        </Text>
      </Td>

      {/* Model */}
      <Td w="1px" whiteSpace="nowrap">
        <Badge colorScheme={modelColor} fontSize="xs" textTransform="none">
          {modelLabel}
        </Badge>
      </Td>

      {/* Public */}
      <Td w="1px" whiteSpace="nowrap">
        <Badge
          colorScheme={agent.is_public ? 'green' : 'gray'}
          fontSize="xs"
          variant={agent.is_public ? 'solid' : 'subtle'}
        >
          {agent.is_public ? 'Public' : 'Private'}
        </Badge>
      </Td>

      {/* Tools */}
      <Td w="1px" whiteSpace="nowrap">
        {toolNames.length > 0 ? (
          <Popover
            isOpen={toolsOpen}
            onClose={() => setToolsOpen(false)}
            placement="bottom-start"
          >
            <PopoverTrigger>
              <Button
                size="xs"
                variant="outline"
                rightIcon={<ChevronDownIcon />}
                onClick={(e) => {
                  e.stopPropagation();
                  setToolsOpen(!toolsOpen);
                }}
              >
                {toolNames.length} tool{toolNames.length !== 1 ? 's' : ''}
              </Button>
            </PopoverTrigger>
            <PopoverContent w="auto" minW="160px" onClick={(e) => e.stopPropagation()}>
              <PopoverBody p={2}>
                <Flex direction="column" gap={1}>
                  {toolNames.map((name, i) => (
                    <Text key={i} fontSize="sm" px={2} py={0.5}>
                      {name}
                    </Text>
                  ))}
                </Flex>
              </PopoverBody>
            </PopoverContent>
          </Popover>
        ) : (
          <Text fontSize="xs" color={subtextColor}>
            —
          </Text>
        )}
      </Td>

      {/* Created At */}
      <Td w="1px" whiteSpace="nowrap" isNumeric>
        <Text fontSize="xs" color={subtextColor}>
          {formatTimestamp(agent.created_at)}
        </Text>
      </Td>

      {/* Updated At */}
      <Td w="1px" whiteSpace="nowrap" isNumeric>
        <Text fontSize="xs" color={subtextColor}>
          {formatTimestamp(agent.updated_at)}
        </Text>
      </Td>
    </Tr>
  );
});

const AgentsPage = observer(() => {
  const router = useRouter();
  const [sortField, setSortField] = useState<SortField>('created_at');
  const [sortDir, setSortDir] = useState<SortDir>('desc');
  const [search, setSearch] = useState('');
  const { showAlert } = useAlert();

  const subtextColor = useColorModeValue('gray.500', 'gray.400');
  const tableBorder = useColorModeValue('gray.200', 'gray.700');

  useEffect(() => {
    if (!authStore.signedIn) return;
    agentsStore.setShowAlert(showAlert);
    agentsStore.loadAgents();
    toolsStore.loadTools();
    modelsStore.loadModels();
  });

  const handleSort = (field: SortField) => {
    if (field === sortField) {
      setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortField(field);
      setSortDir(DEFAULT_DIR[field]);
    }
  };

  const handleAddAgentClick = () => {
    agentBuilderStore.setIsNewAgent(true);
    router.push('/agent-builder');
  };

  const handleAgentClick = (agent: Agent) => {
    agentBuilderStore.setCurrentAgent({ ...agent });
    router.push(`/agent-builder/${agent.agent_id}`);
  };

  const filteredAgents = agentsStore.agents
    ? agentsStore.agents.filter((a) =>
        a.agent_name.toLowerCase().includes(search.toLowerCase())
      )
    : [];

  const sortedAgents = filteredAgents.length > 0 || search
    ? [...filteredAgents].sort((a, b) => {
        let aVal: string | number = 0;
        let bVal: string | number = 0;

        if (sortField === 'name') {
          aVal = a.agent_name.toLowerCase();
          bVal = b.agent_name.toLowerCase();
        } else if (sortField === 'model') {
          aVal = (a.model_id ?? 'default').toLowerCase();
          bVal = (b.model_id ?? 'default').toLowerCase();
        } else if (sortField === 'is_public') {
          aVal = a.is_public ? 1 : 0;
          bVal = b.is_public ? 1 : 0;
        } else if (sortField === 'created_at') {
          aVal = a.created_at ?? 0;
          bVal = b.created_at ?? 0;
        } else if (sortField === 'updated_at') {
          aVal = a.updated_at ?? 0;
          bVal = b.updated_at ?? 0;
        }

        if (aVal < bVal) return sortDir === 'asc' ? -1 : 1;
        if (aVal > bVal) return sortDir === 'asc' ? 1 : -1;
        return 0;
      })
    : [];

  const thProps = { sortField, sortDir, onSort: handleSort };

  return (
    <Box p={{ base: 4, md: 6 }}>
      <Flex align="center" mb={4}>
        <Heading as="h1" size="xl">
          Agents
        </Heading>
        <Button
          ml="auto"
          colorScheme="brand"
          size="sm"
          onClick={handleAddAgentClick}
        >
          + Add Agent
        </Button>
      </Flex>
      <InputGroup mb={4}>
        <InputLeftElement pointerEvents="none">
          <SearchIcon color="gray.400" />
        </InputLeftElement>
        <Input
          placeholder="Search agents..."
          size="md"
          borderRadius="md"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </InputGroup>

      {agentsStore.agentsLoading ? (
        <Flex justify="center" align="center" height="200px">
          <Spinner size="xl" />
        </Flex>
      ) : (
        <Flex direction="column" gap={4}>
          {sortedAgents.length > 0 && (
            <TableContainer
              borderWidth="1px"
              borderColor={tableBorder}
              borderRadius="md"
              overflowX="auto"
            >
              <Table variant="simple" size="md">
                <Thead>
                  <Tr>
                    <SortableTh field="name" {...thProps}>
                      Name
                    </SortableTh>
                    <Th>ID</Th>
                    <Th>Description</Th>
                    <SortableTh field="model" {...thProps}>
                      Model
                    </SortableTh>
                    <SortableTh field="is_public" {...thProps}>
                      Visibility
                    </SortableTh>
                    <Th>Tools</Th>
                    <SortableTh field="created_at" {...thProps} isNumeric>
                      Created
                    </SortableTh>
                    <SortableTh field="updated_at" {...thProps} isNumeric>
                      Updated
                    </SortableTh>
                  </Tr>
                </Thead>
                <Tbody>
                  {sortedAgents.map((agent) => (
                    <AgentRow
                      key={agent.agent_id}
                      agent={agent}
                      onClick={() => handleAgentClick(agent)}
                    />
                  ))}
                </Tbody>
              </Table>
            </TableContainer>
          )}

          {sortedAgents.length === 0 && (
            <Text color={subtextColor} fontSize="sm" mt={2} textAlign="center">
              {search ? `No agents matching "${search}"` : 'No agents yet. Create one to get started.'}
            </Text>
          )}
        </Flex>
      )}
    </Box>
  );
});

export default AgentsPage;
