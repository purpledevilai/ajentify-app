'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { observer } from 'mobx-react-lite';
import { structuredResponseEndpointsStore } from '@/store/StructuredResponseEndpointStore';
import { sreBuilderStore } from '@/store/StructuredResponseEndpointBuilderStore';
import { modelsStore } from '@/store/ModelsStore';
import { StructuredResponseEndpoint } from '@/types/structuredresponseendpoint';
import { deleteSRE } from '@/api/structuredresponseendpoint/deleteSRE';
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
  Checkbox,
  AlertDialog,
  AlertDialogBody,
  AlertDialogContent,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogOverlay,
} from '@chakra-ui/react';
import { CopyIcon, ChevronUpIcon, ChevronDownIcon, SearchIcon, DeleteIcon } from '@chakra-ui/icons';
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
  ({
    sre,
    onClick,
    selectMode,
    isSelected,
    onToggle,
  }: {
    sre: StructuredResponseEndpoint;
    onClick: () => void;
    selectMode: boolean;
    isSelected: boolean;
    onToggle: (e: React.MouseEvent) => void;
  }) => {
    const [idHovered, setIdHovered] = useState(false);
    const { showAlert } = useAlert();

    const hoverBg = useColorModeValue('gray.50', 'gray.700');
    const selectedBg = useColorModeValue('blue.50', 'blue.900');
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
        bg={isSelected ? selectedBg : undefined}
        _hover={{ bg: isSelected ? selectedBg : hoverBg }}
        onClick={selectMode ? onToggle : onClick}
        transition="background 0.15s"
      >
        {/* Checkbox — select mode only */}
        {selectMode && (
          <Td w="1px" onClick={(e) => e.stopPropagation()}>
            <Checkbox
              isChecked={isSelected}
              onChange={(e) => {
                const syntheticEvent = e as unknown as React.MouseEvent;
                onToggle(syntheticEvent);
              }}
              colorScheme="blue"
            />
          </Td>
        )}

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
    if (selectedIds.size === sortedSREs.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(sortedSREs.map((s) => s.sre_id)));
    }
  };

  const handleDeleteConfirmed = async () => {
    setIsDeleting(true);
    try {
      await Promise.all([...selectedIds].map((id) => deleteSRE(id)));
      await structuredResponseEndpointsStore.loadSREs(true);
      setSelectedIds(new Set());
      setSelectMode(false);
      setIsConfirmOpen(false);
      showAlert({
        title: 'Deleted',
        message: `${selectedIds.size} SRE${selectedIds.size !== 1 ? 's' : ''} deleted successfully.`,
      });
    } catch {
      showAlert({ title: 'Error', message: 'One or more deletions failed. Please try again.' });
    } finally {
      setIsDeleting(false);
    }
  };

  const filteredSREs = structuredResponseEndpointsStore.sres
    ? structuredResponseEndpointsStore.sres.filter((s) =>
        s.name.toLowerCase().includes(search.toLowerCase())
      )
    : [];

  const sortedSREs =
    filteredSREs.length > 0 || search
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

  const allSelected = sortedSREs.length > 0 && selectedIds.size === sortedSREs.length;
  const someSelected = selectedIds.size > 0 && !allSelected;
  const thProps = { sortField, sortDir, onSort: handleSort };

  return (
    <Box p={{ base: 4, md: 6 }}>
      {/* Header */}
      <Flex align="center" mb={4} gap={2} wrap="wrap">
        <Heading as="h1" size="xl" flex="1">
          Structured Response Endpoints
        </Heading>
        <Flex gap={2} align="center" flexShrink={0}>
          {/* Bulk action buttons — always visible in select mode, hidden otherwise */}
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
          <Button size="sm" colorScheme="brand" onClick={handleAddSREClick}>
            + Add SRE
          </Button>
        </Flex>
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
                      selectMode={selectMode}
                      isSelected={selectedIds.has(sre.sre_id)}
                      onToggle={(e) => {
                        e.stopPropagation();
                        toggleRow(sre.sre_id);
                      }}
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

      {/* Delete confirmation dialog */}
      <AlertDialog
        isOpen={isConfirmOpen}
        leastDestructiveRef={cancelRef}
        onClose={() => setIsConfirmOpen(false)}
        isCentered
      >
        <AlertDialogOverlay />
        <AlertDialogContent>
          <AlertDialogHeader fontSize="lg" fontWeight="bold">
            Delete {selectedIds.size} SRE{selectedIds.size !== 1 ? 's' : ''}
          </AlertDialogHeader>
          <AlertDialogBody>
            This will permanently delete{' '}
            <Text as="span" fontWeight="semibold">
              {selectedIds.size} structured response endpoint{selectedIds.size !== 1 ? 's' : ''}
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

export default SREsPage;
