'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { observer } from 'mobx-react-lite';
import { jsonDocumentsStore } from '@/store/JsonDocumentsStore';
import { jsonDocumentBuilderStore } from '@/store/JsonDocumentBuilderStore';
import { JsonDocument } from '@/types/jsondocument';
import { deleteJsonDocument } from '@/api/jsondocument/deleteJsonDocument';
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

type SortField = 'name' | 'fields' | 'created_at' | 'updated_at';
type SortDir = 'asc' | 'desc';

const DEFAULT_DIR: Record<SortField, SortDir> = {
  name: 'asc',
  fields: 'desc',
  created_at: 'desc',
  updated_at: 'desc',
};

const truncateId = (id: string): string =>
  id.length > 8 ? `${id.substring(0, 8)}…` : id;

const getFieldCount = (doc: JsonDocument): number =>
  doc.data && typeof doc.data === 'object' ? Object.keys(doc.data).length : 0;

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

const DocumentRow = ({
  doc,
  onClick,
  selectMode,
  isSelected,
  onToggle,
}: {
  doc: JsonDocument;
  onClick: () => void;
  selectMode: boolean;
  isSelected: boolean;
  onToggle: (e: React.MouseEvent) => void;
}) => {
  const [idHovered, setIdHovered] = useState(false);
  const [isNavigating, setIsNavigating] = useState(false);
  const { showAlert } = useAlert();

  const hoverBg = useColorModeValue('gray.50', 'gray.700');
  const selectedBg = useColorModeValue('blue.50', 'blue.900');
  const subtextColor = useColorModeValue('gray.500', 'gray.400');

  const fieldCount = getFieldCount(doc);

  const handleCopyId = (e: React.MouseEvent) => {
    e.stopPropagation();
    navigator.clipboard.writeText(doc.document_id);
    showAlert({ title: 'Copied', message: 'Document ID copied to clipboard' });
  };

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

      {/* Name */}
      <Td fontWeight="semibold" maxW="320px">
        <Flex align="center" gap={2}>
          <Text noOfLines={1}>{doc.name || 'Untitled'}</Text>
          {isNavigating && <Spinner size="xs" flexShrink={0} />}
        </Flex>
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
              aria-label="Copy document ID"
              icon={<CopyIcon />}
              size="xs"
              variant="ghost"
              onClick={handleCopyId}
            />
          ) : (
            <Text fontSize="xs" fontFamily="mono" color={subtextColor} userSelect="none">
              {truncateId(doc.document_id)}
            </Text>
          )}
        </Flex>
      </Td>

      {/* Fields */}
      <Td w="1px" whiteSpace="nowrap" isNumeric>
        <Badge colorScheme="purple" fontSize="xs" variant="subtle">
          {fieldCount} field{fieldCount !== 1 ? 's' : ''}
        </Badge>
      </Td>

      {/* Created At */}
      <Td w="1px" whiteSpace="nowrap" isNumeric>
        <Text fontSize="xs" color={subtextColor}>{formatTimestamp(doc.created_at)}</Text>
      </Td>

      {/* Updated At */}
      <Td w="1px" whiteSpace="nowrap" isNumeric>
        <Text fontSize="xs" color={subtextColor}>{formatTimestamp(doc.updated_at)}</Text>
      </Td>
    </Tr>
  );
};

const DocumentsPage = observer(() => {
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
    router.prefetch('/json-document-builder');
    jsonDocumentsStore.setShowAlert(showAlert);
    jsonDocumentsStore.loadDocuments();
  }, []);

  const handleSort = (field: SortField) => {
    if (field === sortField) {
      setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortField(field);
      setSortDir(DEFAULT_DIR[field]);
    }
  };

  const handleAddDocumentClick = () => {
    jsonDocumentBuilderStore.reset();
    jsonDocumentBuilderStore.setIsNewDocument(true);
    router.push('/json-document-builder');
  };

  const handleDocumentClick = (doc: JsonDocument) => {
    jsonDocumentBuilderStore.setDocument({ ...doc });
    router.push(`/json-document-builder/${doc.document_id}`);
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
    if (selectedIds.size === sortedDocuments.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(sortedDocuments.map((d) => d.document_id)));
    }
  };

  const handleDeleteConfirmed = async () => {
    setIsDeleting(true);
    try {
      await Promise.all([...selectedIds].map((id) => deleteJsonDocument(id)));
      await jsonDocumentsStore.loadDocuments(true);
      setSelectedIds(new Set());
      setSelectMode(false);
      setIsConfirmOpen(false);
      showAlert({
        title: 'Deleted',
        message: `${selectedIds.size} document${selectedIds.size !== 1 ? 's' : ''} deleted successfully.`,
      });
    } catch {
      showAlert({ title: 'Error', message: 'One or more deletions failed. Please try again.' });
    } finally {
      setIsDeleting(false);
    }
  };

  const filteredDocuments = jsonDocumentsStore.documents
    ? jsonDocumentsStore.documents.filter((d) =>
        (d.name ?? '').toLowerCase().includes(search.toLowerCase())
      )
    : [];

  const sortedDocuments = filteredDocuments.length > 0 || search
    ? [...filteredDocuments].sort((a, b) => {
        let aVal: string | number = 0;
        let bVal: string | number = 0;

        if (sortField === 'name') {
          aVal = (a.name ?? '').toLowerCase();
          bVal = (b.name ?? '').toLowerCase();
        } else if (sortField === 'fields') {
          aVal = getFieldCount(a);
          bVal = getFieldCount(b);
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

  const allSelected = sortedDocuments.length > 0 && selectedIds.size === sortedDocuments.length;
  const someSelected = selectedIds.size > 0 && !allSelected;
  const thProps = { sortField, sortDir, onSort: handleSort };

  return (
    <Box p={{ base: 4, md: 6 }}>
      <Flex align="center" mb={4} gap={2} wrap="wrap">
        <Heading as="h1" size="xl" flex="1">
          Documents
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
          <Button size="sm" colorScheme="brand" onClick={handleAddDocumentClick}>
            + Add Document
          </Button>
        </Flex>
      </Flex>

      <InputGroup mb={4}>
        <InputLeftElement pointerEvents="none">
          <SearchIcon color="gray.400" />
        </InputLeftElement>
        <Input
          placeholder="Search documents..."
          size="md"
          borderRadius="md"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </InputGroup>

      {jsonDocumentsStore.documentsLoading ? (
        <Flex justify="center" align="center" height="200px">
          <Spinner size="xl" />
        </Flex>
      ) : (
        <Flex direction="column" gap={4}>
          {sortedDocuments.length > 0 && (
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
                    <SortableTh field="name" {...thProps}>Name</SortableTh>
                    <Th>ID</Th>
                    <SortableTh field="fields" {...thProps} isNumeric>Fields</SortableTh>
                    <SortableTh field="created_at" {...thProps} isNumeric>Created</SortableTh>
                    <SortableTh field="updated_at" {...thProps} isNumeric>Updated</SortableTh>
                  </Tr>
                </Thead>
                <Tbody>
                  {sortedDocuments.map((doc) => (
                    <DocumentRow
                      key={doc.document_id}
                      doc={doc}
                      onClick={() => handleDocumentClick(doc)}
                      selectMode={selectMode}
                      isSelected={selectedIds.has(doc.document_id)}
                      onToggle={(e) => { e.stopPropagation(); toggleRow(doc.document_id); }}
                    />
                  ))}
                </Tbody>
              </Table>
            </TableContainer>
          )}

          {sortedDocuments.length === 0 && (
            <Text color={subtextColor} fontSize="sm" mt={2} textAlign="center">
              {search ? `No documents matching "${search}"` : 'No documents yet. Create one to get started.'}
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
            Delete {selectedIds.size} Document{selectedIds.size !== 1 ? 's' : ''}
          </AlertDialogHeader>
          <AlertDialogBody>
            This will permanently delete{' '}
            <Text as="span" fontWeight="semibold">
              {selectedIds.size} document{selectedIds.size !== 1 ? 's' : ''}
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

export default DocumentsPage;
