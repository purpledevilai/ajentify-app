'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { observer } from 'mobx-react-lite';
import { useStores } from '@/store/StoreContext';
import { Stage } from '@/types/stage';
import {
    Box,
    Button,
    Flex,
    Heading,
    IconButton,
    Input,
    InputGroup,
    InputLeftElement,
    Modal,
    ModalBody,
    ModalCloseButton,
    ModalContent,
    ModalFooter,
    ModalHeader,
    ModalOverlay,
    Spinner,
    Table,
    TableContainer,
    Tbody,
    Td,
    Text,
    Textarea,
    Th,
    Thead,
    Tr,
    useColorModeValue,
    useDisclosure,
    FormControl,
    FormLabel,
    Tooltip,
    useToast,
} from '@chakra-ui/react';
import { CopyIcon, DeleteIcon, SearchIcon } from '@chakra-ui/icons';
import { InlineError } from '@/app/components/InlineError';
import { DeleteStageMode } from '@/api/stage/deleteStage';
import DeployFromJSONModal from './components/DeployFromJSONModal';
import DeleteStageDialog from './components/DeleteStageDialog';

const STAGE_NAME_REGEX = /^[a-z][a-z0-9-]{0,62}$/;

const formatTimestamp = (ts: number | undefined): string => {
    if (!ts) return '—';
    return new Date(ts * 1000).toLocaleDateString(undefined, {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
    });
};

const truncateId = (id: string): string => (id.length > 8 ? `${id.substring(0, 8)}…` : id);

const StageRow = observer(({
    stage,
    onClick,
    onDelete,
}: {
    stage: Stage;
    onClick: () => void;
    onDelete: () => void;
}) => {
    const [idHovered, setIdHovered] = useState(false);
    const [isNavigating, setIsNavigating] = useState(false);
    const toast = useToast();
    const hoverBg = useColorModeValue('gray.50', 'gray.700');
    const subtextColor = useColorModeValue('gray.500', 'gray.400');

    const handleCopyId = (e: React.MouseEvent) => {
        e.stopPropagation();
        navigator.clipboard.writeText(stage.stage_id);
        toast({ title: 'Copied', description: 'Stage ID copied to clipboard', status: 'success', duration: 2000 });
    };

    return (
        <Tr
            cursor={isNavigating ? 'progress' : 'pointer'}
            _hover={{ bg: hoverBg }}
            onClick={() => { setIsNavigating(true); onClick(); }}
            opacity={isNavigating ? 0.6 : 1}
            transition="background 0.15s, opacity 0.15s"
        >
            <Td fontWeight="semibold" maxW="240px">
                <Flex align="center" gap={2}>
                    <Text noOfLines={1}>{stage.name}</Text>
                    {isNavigating && <Spinner size="xs" flexShrink={0} />}
                </Flex>
            </Td>
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
                            aria-label="Copy stage ID"
                            icon={<CopyIcon />}
                            size="xs"
                            variant="ghost"
                            onClick={handleCopyId}
                        />
                    ) : (
                        <Text fontSize="xs" fontFamily="mono" color={subtextColor} userSelect="none">
                            {truncateId(stage.stage_id)}
                        </Text>
                    )}
                </Flex>
            </Td>
            <Td maxW="360px">
                <Text fontSize="sm" color={subtextColor} noOfLines={1}>
                    {stage.description || '—'}
                </Text>
            </Td>
            <Td w="1px" whiteSpace="nowrap" isNumeric>
                <Text fontSize="xs" color={subtextColor}>{formatTimestamp(stage.created_at)}</Text>
            </Td>
            <Td w="1px" whiteSpace="nowrap" isNumeric>
                <Text fontSize="xs" color={subtextColor}>{formatTimestamp(stage.updated_at)}</Text>
            </Td>
            <Td w="1px" onClick={(e) => e.stopPropagation()}>
                <IconButton
                    aria-label="Delete stage"
                    icon={<DeleteIcon />}
                    size="xs"
                    variant="ghost"
                    colorScheme="red"
                    onClick={onDelete}
                />
            </Td>
        </Tr>
    );
});

const StagesPage = observer(() => {
    const router = useRouter();
    const toast = useToast();
    const { stages: stagesStore, auth: authStore, refreshDashboardCaches } = useStores();
    const [search, setSearch] = useState('');
    const createModal = useDisclosure();
    const deployModal = useDisclosure();
    const [pendingDelete, setPendingDelete] = useState<Stage | null>(null);
    const [isDeleting, setIsDeleting] = useState(false);

    const subtextColor = useColorModeValue('gray.500', 'gray.400');
    const tableBorder = useColorModeValue('gray.200', 'gray.700');

    useEffect(() => {
        if (!authStore.signedIn) return;
        stagesStore.loadStages();
    });

    const filtered = (stagesStore.stages ?? []).filter((s) =>
        s.name.toLowerCase().includes(search.toLowerCase())
    );

    const handleStageClick = (stage: Stage) => {
        router.push(`/stages/${stage.stage_id}`);
    };

    const handleDeleteConfirmed = async (mode: DeleteStageMode) => {
        if (!pendingDelete) return;
        const target = pendingDelete;
        setIsDeleting(true);
        const ok = await stagesStore.deleteStage(target.stage_id, mode);
        setIsDeleting(false);
        if (ok) {
            // Either mode mutates Agents/Tools/SREs/Documents — refresh every
            // list cache so the dashboard tabs reflect reality immediately.
            refreshDashboardCaches();
            toast({
                title: mode === 'destroy' ? 'Destroyed' : 'Detached',
                description: mode === 'destroy'
                    ? `Stage "${target.name}" and all its resources were deleted.`
                    : `Stage "${target.name}" deleted; its resources were detached and remain in your org.`,
                status: 'success',
                duration: 4000,
                isClosable: true,
            });
        }
        setPendingDelete(null);
    };

    return (
        <Box p={{ base: 4, md: 6 }}>
            <Flex align="center" mb={2} gap={2} wrap="wrap">
                <Heading as="h1" size="xl" flex="1">Stages</Heading>
                <Flex gap={2} align="center" flexShrink={0}>
                    <Button size="sm" variant="outline" onClick={deployModal.onOpen}>
                        Deploy from JSON
                    </Button>
                    <Button size="sm" colorScheme="brand" onClick={createModal.onOpen}>
                        + New Stage
                    </Button>
                </Flex>
            </Flex>

            <Text color={subtextColor} fontSize="sm" mb={4}>
                Stages scope deploy-managed resources (Agents, Tools, SREs, …) authored via{' '}
                <code>ajentify.json</code>. Resources outside any stage continue to be managed
                directly through the UI.
            </Text>

            <InputGroup mb={4}>
                <InputLeftElement pointerEvents="none">
                    <SearchIcon color="gray.400" />
                </InputLeftElement>
                <Input
                    placeholder="Search stages..."
                    size="md"
                    borderRadius="md"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                />
            </InputGroup>

            {stagesStore.stagesLoading && !stagesStore.stages && (
                <Flex justify="center" align="center" height="200px">
                    <Spinner size="xl" />
                </Flex>
            )}
            {stagesStore.stagesError && (
                <InlineError message={stagesStore.stagesError} onRetry={() => stagesStore.loadStages(true)} />
            )}
            {!stagesStore.stagesLoading && !stagesStore.stagesError && (
                <Flex direction="column" gap={4}>
                    {filtered.length > 0 && (
                        <TableContainer
                            borderWidth="1px"
                            borderColor={tableBorder}
                            borderRadius="md"
                            overflowX="auto"
                        >
                            <Table variant="simple" size="md">
                                <Thead>
                                    <Tr>
                                        <Th>Name</Th>
                                        <Th>ID</Th>
                                        <Th>Description</Th>
                                        <Th isNumeric>Created</Th>
                                        <Th isNumeric>Updated</Th>
                                        <Th />
                                    </Tr>
                                </Thead>
                                <Tbody>
                                    {filtered.map((stage) => (
                                        <StageRow
                                            key={stage.stage_id}
                                            stage={stage}
                                            onClick={() => handleStageClick(stage)}
                                            onDelete={() => setPendingDelete(stage)}
                                        />
                                    ))}
                                </Tbody>
                            </Table>
                        </TableContainer>
                    )}

                    {filtered.length === 0 && (
                        <Text color={subtextColor} fontSize="sm" mt={2} textAlign="center">
                            {search
                                ? `No stages matching "${search}"`
                                : 'No stages yet. Create one or run `ajdk deploy` against an `ajentify.json`.'}
                        </Text>
                    )}
                </Flex>
            )}

            <CreateStageModal
                isOpen={createModal.isOpen}
                onClose={createModal.onClose}
                onCreated={(stage) => router.push(`/stages/${stage.stage_id}`)}
            />

            <DeployFromJSONModal
                isOpen={deployModal.isOpen}
                onClose={deployModal.onClose}
                onDeployed={(response) => {
                    // Reconciliation can have touched any of the resource
                    // caches — refresh them all so the dashboard tabs
                    // reflect the new state without a hard reload.
                    refreshDashboardCaches();
                    toast({
                        title: 'Deployed',
                        description: `Stage "${response.stage_name}": ${response.summary.create} created, ${response.summary.update} updated, ${response.summary.delete} deleted.`,
                        status: 'success',
                        duration: 5000,
                        isClosable: true,
                    });
                }}
            />

            <DeleteStageDialog
                stage={pendingDelete}
                isDeleting={isDeleting}
                onCancel={() => {
                    if (!isDeleting) setPendingDelete(null);
                }}
                onConfirm={handleDeleteConfirmed}
            />
        </Box>
    );
});

const CreateStageModal = ({
    isOpen,
    onClose,
    onCreated,
}: {
    isOpen: boolean;
    onClose: () => void;
    onCreated: (stage: Stage) => void;
}) => {
    const { stages: stagesStore } = useStores();
    const [name, setName] = useState('');
    const [description, setDescription] = useState('');
    const [submitting, setSubmitting] = useState(false);
    const subtextColor = useColorModeValue('gray.500', 'gray.400');

    const validName = STAGE_NAME_REGEX.test(name);
    const canSubmit = validName && !submitting;

    const handleClose = () => {
        if (submitting) return;
        setName('');
        setDescription('');
        onClose();
    };

    const handleSubmit = async () => {
        if (!canSubmit) return;
        setSubmitting(true);
        const stage = await stagesStore.createStage({
            name,
            description: description.trim() ? description.trim() : null,
        });
        setSubmitting(false);
        if (stage) {
            setName('');
            setDescription('');
            onClose();
            onCreated(stage);
        }
    };

    return (
        <Modal isOpen={isOpen} onClose={handleClose} isCentered>
            <ModalOverlay />
            <ModalContent>
                <ModalHeader>New stage</ModalHeader>
                <ModalCloseButton />
                <ModalBody>
                    <Flex direction="column" gap={4}>
                        <FormControl isRequired isInvalid={name.length > 0 && !validName}>
                            <FormLabel>Name</FormLabel>
                            <Input
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                placeholder="frontend-staging"
                                autoFocus
                            />
                            <Text fontSize="xs" color={subtextColor} mt={1}>
                                Lowercase letters, digits, and dashes. Must start with a letter.
                            </Text>
                        </FormControl>
                        <FormControl>
                            <FormLabel>Description</FormLabel>
                            <Textarea
                                value={description}
                                onChange={(e) => setDescription(e.target.value)}
                                placeholder="Optional"
                                rows={3}
                            />
                        </FormControl>
                    </Flex>
                </ModalBody>
                <ModalFooter gap={3}>
                    <Button variant="ghost" onClick={handleClose} isDisabled={submitting}>
                        Cancel
                    </Button>
                    <Tooltip
                        isDisabled={validName}
                        label="Enter a valid stage name to continue"
                        fontSize="sm"
                    >
                        <Button
                            colorScheme="brand"
                            onClick={handleSubmit}
                            isDisabled={!canSubmit}
                            isLoading={submitting}
                            loadingText="Creating…"
                        >
                            Create
                        </Button>
                    </Tooltip>
                </ModalFooter>
            </ModalContent>
        </Modal>
    );
};

export default StagesPage;
