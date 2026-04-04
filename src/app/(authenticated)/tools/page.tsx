'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { observer } from 'mobx-react-lite';
import { toolsStore } from '@/store/ToolsStore';
import { toolBuilderStore } from '@/store/ToolBuilderStore';
import { Tool } from '@/types/tools';
import { Parameter, ParameterDefinition } from '@/types/parameterdefinition';
import { getParameterDefinitions } from '@/api/parameterdefinition/getParameterDefinitions';
import { deleteTool } from '@/api/tool/deleteTool';
import {
  Box,
  Heading,
  Flex,
  Text,
  Spinner,
  Button,
  Badge,
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
  Checkbox,
  AlertDialog,
  AlertDialogBody,
  AlertDialogContent,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogOverlay,
} from '@chakra-ui/react';
import { ChevronUpIcon, ChevronDownIcon, SearchIcon, DeleteIcon } from '@chakra-ui/icons';
import { useAlert } from '@/app/components/AlertProvider';
import { authStore } from '@/store/AuthStore';

type SortField = 'function' | 'language' | 'created_at' | 'updated_at';
type SortDir = 'asc' | 'desc';

const DEFAULT_DIR: Record<SortField, SortDir> = {
  function: 'asc',
  language: 'asc',
  created_at: 'desc',
  updated_at: 'desc',
};

const getCodeName = (name: string): string => name.replace(/ /g, '_').toLowerCase();

const buildFunctionParts = (tool: Tool, params: Parameter[]): { name: string; args: string } => {
  const paramNames = params.map((p) => getCodeName(p.name));
  if (tool.is_async) paramNames.unshift('tool_call_id');
  if (tool.pass_context) paramNames.unshift('context');
  return {
    name: getCodeName(tool.name),
    args: `(${paramNames.join(', ')})`,
  };
};

const buildFunctionDeclaration = (tool: Tool, params: Parameter[]): string => {
  const { name, args } = buildFunctionParts(tool, params);
  return `${name}${args}`;
};

const formatTimestamp = (ts: number | undefined): string => {
  if (!ts) return '—';
  return new Date(ts * 1000).toLocaleDateString(undefined, {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
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

const ToolRow = ({
  tool,
  params,
  onClick,
  selectMode,
  isSelected,
  onToggle,
}: {
  tool: Tool;
  params: Parameter[];
  onClick: () => void;
  selectMode: boolean;
  isSelected: boolean;
  onToggle: (e: React.MouseEvent) => void;
}) => {
  const [isNavigating, setIsNavigating] = useState(false);
  const hoverBg = useColorModeValue('gray.50', 'gray.700');
  const selectedBg = useColorModeValue('blue.50', 'blue.900');
  const subtextColor = useColorModeValue('gray.500', 'gray.400');
  const codeColor = useColorModeValue('purple.700', 'purple.300');

  const { name, args } = buildFunctionParts(tool, params);

  return (
    <Tr
      cursor={isNavigating ? 'progress' : 'pointer'}
      bg={isSelected ? selectedBg : undefined}
      _hover={{ bg: isSelected ? selectedBg : hoverBg }}
      onClick={selectMode ? onToggle : () => { setIsNavigating(true); onClick(); }}
      opacity={isNavigating ? 0.6 : 1}
      transition="background 0.15s, opacity 0.15s"
    >
      {selectMode && (
        <Td w="1px" onClick={(e) => e.stopPropagation()}>
          <Checkbox
            isChecked={isSelected}
            onChange={(e) => onToggle(e as unknown as React.MouseEvent)}
            colorScheme="blue"
          />
        </Td>
      )}

      {/* Function Declaration */}
      <Td maxW="320px">
        <Flex
          align="baseline"
          fontFamily="mono"
          fontSize="xs"
          color={codeColor}
          overflow="hidden"
          title={`${name}${args}`}
        >
          <Text fontFamily="mono" fontSize="xs" fontWeight="bold" color={codeColor} flexShrink={0}>
            {name}
          </Text>
          <Text fontFamily="mono" fontSize="xs" fontWeight="normal" color={codeColor} noOfLines={1}>
            {args}
          </Text>
          {isNavigating && <Spinner size="xs" flexShrink={0} ml={2} alignSelf="center" />}
        </Flex>
      </Td>

      {/* Description */}
      <Td maxW="300px">
        <Text fontSize="sm" color={subtextColor} noOfLines={1}>
          {tool.description || '—'}
        </Text>
      </Td>

      {/* Language */}
      <Td w="1px" whiteSpace="nowrap">
        <Badge colorScheme="blue" fontSize="xs" textTransform="none">
          Python
        </Badge>
      </Td>

      {/* Created At */}
      <Td w="1px" whiteSpace="nowrap" isNumeric>
        <Text fontSize="xs" color={subtextColor}>{formatTimestamp(tool.created_at)}</Text>
      </Td>

      {/* Updated At */}
      <Td w="1px" whiteSpace="nowrap" isNumeric>
        <Text fontSize="xs" color={subtextColor}>{formatTimestamp(tool.updated_at)}</Text>
      </Td>
    </Tr>
  );
};

const ToolsPage = observer(() => {
  const router = useRouter();
  const [sortField, setSortField] = useState<SortField>('created_at');
  const [sortDir, setSortDir] = useState<SortDir>('desc');
  const [pdMap, setPdMap] = useState<Record<string, Parameter[]>>({});
  const [search, setSearch] = useState('');
  const [selectMode, setSelectMode] = useState(false);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const cancelRef = useRef<any>(null);
  const { showAlert } = useAlert();

  const subtextColor = useColorModeValue('gray.500', 'gray.400');
  const tableBorder = useColorModeValue('gray.200', 'gray.700');

  useEffect(() => {
    if (!authStore.signedIn) return;
    router.prefetch('/tool-builder');
    toolsStore.setShowAlert(showAlert);
    toolsStore.loadTools();
    getParameterDefinitions().then((pds: ParameterDefinition[]) => {
      const map: Record<string, Parameter[]> = {};
      pds.forEach((pd) => { map[pd.pd_id] = pd.parameters; });
      setPdMap(map);
    }).catch(() => {});
  });

  const handleSort = (field: SortField) => {
    if (field === sortField) {
      setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortField(field);
      setSortDir(DEFAULT_DIR[field]);
    }
  };

  const handleAddToolClick = () => {
    router.push('/tool-builder');
  };

  const handleToolClick = (tool: Tool) => {
    toolBuilderStore.setTool({ ...tool });
    router.push(`/tool-builder/${tool.tool_id}`);
  };

  const toggleSelectMode = () => {
    setSelectMode((v) => !v);
    setSelectedIds(new Set());
  };

  const toggleRow = (id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) { next.delete(id); } else { next.add(id); }
      return next;
    });
  };

  const toggleAll = () => {
    if (selectedIds.size === sortedTools.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(sortedTools.map((t) => t.tool_id)));
    }
  };

  const handleDeleteConfirmed = async () => {
    setIsDeleting(true);
    try {
      await Promise.all([...selectedIds].map((id) => deleteTool(id)));
      await toolsStore.loadTools(true);
      setSelectedIds(new Set());
      setSelectMode(false);
      setIsConfirmOpen(false);
      showAlert({
        title: 'Deleted',
        message: `${selectedIds.size} tool${selectedIds.size !== 1 ? 's' : ''} deleted successfully.`,
      });
    } catch {
      showAlert({ title: 'Error', message: 'One or more deletions failed. Please try again.' });
    } finally {
      setIsDeleting(false);
    }
  };

  const getParams = (tool: Tool): Parameter[] =>
    (tool.pd_id ? pdMap[tool.pd_id] : undefined) ?? [];

  const filteredTools = toolsStore.tools
    ? toolsStore.tools.filter((t) =>
        t.name.toLowerCase().includes(search.toLowerCase())
      )
    : [];

  const sortedTools = filteredTools.length > 0 || search
    ? [...filteredTools].sort((a, b) => {
        let aVal: string | number = 0;
        let bVal: string | number = 0;

        if (sortField === 'function') {
          aVal = buildFunctionDeclaration(a, getParams(a)).toLowerCase();
          bVal = buildFunctionDeclaration(b, getParams(b)).toLowerCase();
        } else if (sortField === 'language') {
          aVal = 'python';
          bVal = 'python';
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

  const allSelected = sortedTools.length > 0 && selectedIds.size === sortedTools.length;
  const someSelected = selectedIds.size > 0 && !allSelected;
  const thProps = { sortField, sortDir, onSort: handleSort };

  return (
    <Box p={{ base: 4, md: 6 }}>
      <Flex align="center" mb={4} gap={2} wrap="wrap">
        <Heading as="h1" size="xl" flex="1">
          Tools
        </Heading>
        <Flex gap={2} align="center" flexShrink={0}>
          {selectMode && (
            <Button
              size="sm"
              colorScheme="red"
              variant="outline"
              leftIcon={<DeleteIcon />}
              isDisabled={selectedIds.size === 0}
              onClick={() => setIsConfirmOpen(true)}
            >
              Delete{selectedIds.size > 0 ? ` (${selectedIds.size})` : ''}
            </Button>
          )}
          <Button
            size="sm"
            variant={selectMode ? 'solid' : 'outline'}
            colorScheme={selectMode ? 'blue' : 'gray'}
            onClick={toggleSelectMode}
          >
            {selectMode ? 'Cancel' : 'Select'}
          </Button>
          <Button size="sm" colorScheme="brand" onClick={handleAddToolClick}>
            + Add Tool
          </Button>
        </Flex>
      </Flex>

      <InputGroup mb={4}>
        <InputLeftElement pointerEvents="none">
          <SearchIcon color="gray.400" />
        </InputLeftElement>
        <Input
          placeholder="Search tools..."
          size="md"
          borderRadius="md"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </InputGroup>

      {toolsStore.toolsLoading ? (
        <Flex justify="center" align="center" height="200px">
          <Spinner size="xl" />
        </Flex>
      ) : (
        <Flex direction="column" gap={4}>
          {sortedTools.length > 0 && (
            <TableContainer
              borderWidth="1px"
              borderColor={tableBorder}
              borderRadius="md"
              overflowX="auto"
            >
              <Table variant="simple" size="md">
                <Thead>
                  <Tr>
                    {selectMode && (
                      <Th w="1px">
                        <Checkbox
                          isChecked={allSelected}
                          isIndeterminate={someSelected}
                          onChange={toggleAll}
                          colorScheme="blue"
                        />
                      </Th>
                    )}
                    <SortableTh field="function" {...thProps}>Function</SortableTh>
                    <Th>Description</Th>
                    <SortableTh field="language" {...thProps}>Language</SortableTh>
                    <SortableTh field="created_at" {...thProps} isNumeric>Created</SortableTh>
                    <SortableTh field="updated_at" {...thProps} isNumeric>Updated</SortableTh>
                  </Tr>
                </Thead>
                <Tbody>
                  {sortedTools.map((tool) => (
                    <ToolRow
                      key={tool.tool_id}
                      tool={tool}
                      params={getParams(tool)}
                      onClick={() => handleToolClick(tool)}
                      selectMode={selectMode}
                      isSelected={selectedIds.has(tool.tool_id)}
                      onToggle={(e) => { e.stopPropagation(); toggleRow(tool.tool_id); }}
                    />
                  ))}
                </Tbody>
              </Table>
            </TableContainer>
          )}

          {sortedTools.length === 0 && (
            <Text color={subtextColor} fontSize="sm" mt={2} textAlign="center">
              {search ? `No tools matching "${search}"` : 'No tools yet. Create one to get started.'}
            </Text>
          )}
        </Flex>
      )}

      <AlertDialog
        isOpen={isConfirmOpen}
        leastDestructiveRef={cancelRef}
        onClose={() => setIsConfirmOpen(false)}
        isCentered
      >
        <AlertDialogOverlay />
        <AlertDialogContent>
          <AlertDialogHeader fontSize="lg" fontWeight="bold">
            Delete {selectedIds.size} Tool{selectedIds.size !== 1 ? 's' : ''}
          </AlertDialogHeader>
          <AlertDialogBody>
            This will permanently delete{' '}
            <Text as="span" fontWeight="semibold">
              {selectedIds.size} tool{selectedIds.size !== 1 ? 's' : ''}
            </Text>
            . This action cannot be undone.
          </AlertDialogBody>
          <AlertDialogFooter gap={3}>
            <Button ref={cancelRef} onClick={() => setIsConfirmOpen(false)} isDisabled={isDeleting}>
              Cancel
            </Button>
            <Button
              colorScheme="red"
              onClick={handleDeleteConfirmed}
              isLoading={isDeleting}
              loadingText="Deleting…"
            >
              Delete
            </Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </Box>
  );
});

export default ToolsPage;
