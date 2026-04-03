'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { observer } from 'mobx-react-lite';
import { structuredResponseEndpointsStore } from '@/store/StructuredResponseEndpointStore';
import { sreBuilderStore } from '@/store/StructuredResponseEndpointBuilderStore';
import { modelsStore } from '@/store/ModelsStore';
import { StructuredResponseEndpoint } from '@/types/structuredresponseendpoint';
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
  Wrap,
  WrapItem,
} from '@chakra-ui/react';
import { CopyIcon, ChevronUpIcon, ChevronDownIcon, SearchIcon } from '@chakra-ui/icons';
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

const truncateId = (id: string): string =>
  id.length > 8 ? `${id.substring(0, 8)}…` : id;

const getVariableNames = (sre: StructuredResponseEndpoint): string[] => {
  if (sre.variable_names && sre.variable_names.length > 0) {
    return sre.variable_names;
  }
  const matches = sre.prompt_template?.match(/\{([^}]+)\}/g) || [];
  return matches.map((m) => m.replace(/[{}]/g, ''));
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

const SRERow = observer(
  ({ sre, onClick }: { sre: StructuredResponseEndpoint; onClick: () => void }) => {
    const [idHovered, setIdHovered] = useState(false);
    const { showAlert } = useAlert();

    const hoverBg = useColorModeValue('gray.50', 'gray.700');
    const subtextColor = useColorModeValue('gray.500', 'gray.400');
    const tagBg = useColorModeValue('gray.100', 'gray.600');

    const model = sre.model_id ? modelsStore.getModelByName(sre.model_id) : null;
    const modelLabel = model ? model.model : 'Default';
    const modelColor = model
      ? model.model_provider === 'anthropic'
        ? 'orange'
        : 'teal'
      : 'gray';

    const variables = getVariableNames(sre);

    const handleCopyId = (e: React.MouseEvent) => {
      e.stopPropagation();
      navigator.clipboard.writeText(sre.sre_id);
      showAlert({ title: 'Copied', message: 'SRE ID copied to clipboard' });
    };

    return (
      <Tr
        cursor="pointer"
        _hover={{ bg: hoverBg }}
        onClick={onClick}
        transition="background 0.15s"
      >
        {/* Name */}
        <Td fontWeight="semibold" maxW="180px">
          <Text noOfLines={1}>{sre.name}</Text>
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
                aria-label="Copy SRE ID"
                icon={<CopyIcon />}
                size="xs"
                variant="ghost"
                onClick={handleCopyId}
              />
            ) : (
              <Text fontSize="xs" fontFamily="mono" color={subtextColor} userSelect="none">
                {truncateId(sre.sre_id)}
              </Text>
            )}
          </Flex>
        </Td>

        {/* Description */}
        <Td maxW="260px">
          <Text fontSize="sm" color={subtextColor} noOfLines={1}>
            {sre.description || '—'}
          </Text>
        </Td>

        {/* Variables */}
        <Td maxW="220px">
          {variables.length > 0 ? (
            <Wrap spacing={1} overflow="hidden" flexWrap="nowrap">
              {variables.map((v) => (
                <WrapItem key={v} flexShrink={0}>
                  <Badge
                    bg={tagBg}
                    color={subtextColor}
                    fontSize="xs"
                    fontFamily="mono"
                    textTransform="none"
                    fontWeight="normal"
                    px={1.5}
                    borderRadius="sm"
                  >
                    {v}
                  </Badge>
                </WrapItem>
              ))}
            </Wrap>
          ) : (
            <Text fontSize="xs" color={subtextColor}>
              —
            </Text>
          )}
        </Td>

        {/* Model */}
        <Td w="1px" whiteSpace="nowrap">
          <Badge colorScheme={modelColor} fontSize="xs" textTransform="none">
            {modelLabel}
          </Badge>
        </Td>

        {/* Visibility */}
        <Td w="1px" whiteSpace="nowrap">
          <Badge
            colorScheme={sre.is_public ? 'green' : 'gray'}
            fontSize="xs"
            variant={sre.is_public ? 'solid' : 'subtle'}
          >
            {sre.is_public ? 'Public' : 'Private'}
          </Badge>
        </Td>

        {/* Created At */}
        <Td w="1px" whiteSpace="nowrap" isNumeric>
          <Text fontSize="xs" color={subtextColor}>
            {formatTimestamp(sre.created_at)}
          </Text>
        </Td>

        {/* Updated At */}
        <Td w="1px" whiteSpace="nowrap" isNumeric>
          <Text fontSize="xs" color={subtextColor}>
            {formatTimestamp(sre.updated_at)}
          </Text>
        </Td>
      </Tr>
    );
  }
);

const SREsPage = observer(() => {
  const router = useRouter();
  const [sortField, setSortField] = useState<SortField>('created_at');
  const [sortDir, setSortDir] = useState<SortDir>('desc');
  const [search, setSearch] = useState('');
  const { showAlert } = useAlert();

  const subtextColor = useColorModeValue('gray.500', 'gray.400');
  const tableBorder = useColorModeValue('gray.200', 'gray.700');

  useEffect(() => {
    if (!authStore.signedIn) return;
    structuredResponseEndpointsStore.setShowAlert(showAlert);
    structuredResponseEndpointsStore.loadSREs();
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

  const handleAddSREClick = () => {
    sreBuilderStore.initiateNew();
    router.push('/sre-builder');
  };

  const handleSREClick = (sre: StructuredResponseEndpoint) => {
    sreBuilderStore.setSRE({ ...sre });
    router.push(`/sre-builder/${sre.sre_id}`);
  };

  const filteredSREs = structuredResponseEndpointsStore.sres
    ? structuredResponseEndpointsStore.sres.filter((s) =>
        s.name.toLowerCase().includes(search.toLowerCase())
      )
    : [];

  const sortedSREs = filteredSREs.length > 0 || search
    ? [...filteredSREs].sort((a, b) => {
        let aVal: string | number = 0;
        let bVal: string | number = 0;

        if (sortField === 'name') {
          aVal = a.name.toLowerCase();
          bVal = b.name.toLowerCase();
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
          Structured Response Endpoints
        </Heading>
        <Button ml="auto" colorScheme="brand" size="sm" onClick={handleAddSREClick} flexShrink={0}>
          + Add SRE
        </Button>
      </Flex>

      <InputGroup mb={4}>
        <InputLeftElement pointerEvents="none">
          <SearchIcon color="gray.400" />
        </InputLeftElement>
        <Input
          placeholder="Search SREs..."
          size="md"
          borderRadius="md"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </InputGroup>

      {structuredResponseEndpointsStore.sresLoading ? (
        <Flex justify="center" align="center" height="200px">
          <Spinner size="xl" />
        </Flex>
      ) : (
        <Flex direction="column" gap={4}>
          {sortedSREs.length > 0 && (
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
                    <Th>Variables</Th>
                    <SortableTh field="model" {...thProps}>
                      Model
                    </SortableTh>
                    <SortableTh field="is_public" {...thProps}>
                      Visibility
                    </SortableTh>
                    <SortableTh field="created_at" {...thProps} isNumeric>
                      Created
                    </SortableTh>
                    <SortableTh field="updated_at" {...thProps} isNumeric>
                      Updated
                    </SortableTh>
                  </Tr>
                </Thead>
                <Tbody>
                  {sortedSREs.map((sre) => (
                    <SRERow
                      key={sre.sre_id}
                      sre={sre}
                      onClick={() => handleSREClick(sre)}
                    />
                  ))}
                </Tbody>
              </Table>
            </TableContainer>
          )}

          {sortedSREs.length === 0 && (
            <Text color={subtextColor} fontSize="sm" mt={2} textAlign="center">
              {search
                ? `No SREs matching "${search}"`
                : 'No structured response endpoints yet. Create one to get started.'}
            </Text>
          )}
        </Flex>
      )}
    </Box>
  );
});

export default SREsPage;
