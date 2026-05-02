'use client';

import React, { useEffect, useMemo, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { observer } from 'mobx-react-lite';
import {
    Badge,
    Box,
    Button,
    Code,
    Divider,
    Flex,
    Heading,
    HStack,
    IconButton,
    Input,
    Modal,
    ModalBody,
    ModalCloseButton,
    ModalContent,
    ModalFooter,
    ModalHeader,
    ModalOverlay,
    Skeleton,
    SkeletonText,
    Spinner,
    Text,
    Textarea,
    Tooltip,
    useColorMode,
    useColorModeValue,
    useDisclosure,
    FormControl,
    FormLabel,
} from '@chakra-ui/react';
import { AddIcon, ArrowBackIcon, CopyIcon, DeleteIcon, EditIcon } from '@chakra-ui/icons';
import { FiCode } from 'react-icons/fi';
import DeployFromJSONModal from '../components/DeployFromJSONModal';
import AddExistingResourceModal, { PickableResource } from '../components/AddExistingResourceModal';
import DeleteStageDialog from '../components/DeleteStageDialog';
import { DeleteStageMode } from '@/api/stage/deleteStage';
import { deployManifest } from '@/api/deploy/deployManifest';
import { refreshDashboardCaches } from '@/store/refreshDashboardCaches';
import { stagesStore } from '@/store/StagesStore';
import { authStore } from '@/store/AuthStore';
import { useAlert } from '@/app/components/AlertProvider';
import { Stage } from '@/types/stage';
import { Agent } from '@/types/agent';
import { Tool } from '@/types/tools';
import { StructuredResponseEndpoint } from '@/types/structuredresponseendpoint';
import { JsonDocument } from '@/types/jsondocument';
import { getStage } from '@/api/stage/getStage';
import { getStageManifest } from '@/api/stage/getStageManifest';
import { getAgents } from '@/api/agent/getAgents';
import { getTools } from '@/api/tool/getTools';
import { getSREs } from '@/api/structuredresponseendpoint/getSREs';
import { getJsonDocuments } from '@/api/jsondocument/getJsonDocuments';
import { updateAgent } from '@/api/agent/updateAgent';
import { updateTool } from '@/api/tool/updateTool';
import { updateSRE } from '@/api/structuredresponseendpoint/updateSRE';
import { updateJsonDocument } from '@/api/jsondocument/updateJsonDocument';
import { Manifest } from '@/types/manifest';

const STAGE_NAME_REGEX = /^[a-z][a-z0-9-]{0,62}$/;

const formatTimestamp = (ts: number | undefined): string => {
    if (!ts) return '—';
    return new Date(ts * 1000).toLocaleString();
};

interface StageResources {
    agents: Agent[];
    tools: Tool[];
    sres: StructuredResponseEndpoint[];
    documents: JsonDocument[];
}

const EMPTY_RESOURCES: StageResources = {
    agents: [],
    tools: [],
    sres: [],
    documents: [],
};

type AddKind = 'agents' | 'tools' | 'sres' | 'documents';

const KIND_LABELS: Record<AddKind, string> = {
    agents: 'agent',
    tools: 'tool',
    sres: 'SRE',
    documents: 'document',
};

const StageDetailPage = observer(() => {
    const params = useParams<{ stage_id: string }>();
    const stageId = params.stage_id;
    const router = useRouter();
    const { showAlert } = useAlert();
    const editModal = useDisclosure();
    const deployModal = useDisclosure();
    const cloneModal = useDisclosure();
    const [confirmDelete, setConfirmDelete] = useState(false);

    const [stage, setStage] = useState<Stage | null>(null);
    const [stageError, setStageError] = useState<string | null>(null);
    const [resources, setResources] = useState<StageResources>(EMPTY_RESOURCES);
    const [unattached, setUnattached] = useState<StageResources>(EMPTY_RESOURCES);
    const [resourcesLoading, setResourcesLoading] = useState(true);
    const [resourcesReloadKey, setResourcesReloadKey] = useState(0);
    const [deleting, setDeleting] = useState(false);
    const [redeployManifest, setRedeployManifest] = useState<Manifest | null>(null);
    const [openingDeploy, setOpeningDeploy] = useState(false);
    const [addKind, setAddKind] = useState<AddKind | null>(null);

    const subtextColor = useColorModeValue('gray.500', 'gray.400');
    const cardBg = useColorModeValue('white', 'gray.800');
    const cardBorder = useColorModeValue('gray.200', 'gray.700');

    useEffect(() => {
        if (!authStore.signedIn) return;
        stagesStore.setShowAlert(showAlert);

        let cancelled = false;
        (async () => {
            try {
                const fresh = await getStage(stageId);
                if (!cancelled) setStage(fresh);
            } catch (err) {
                if (!cancelled) setStageError((err as Error).message);
            }
        })();

        return () => {
            cancelled = true;
        };
    }, [stageId, showAlert]);

    useEffect(() => {
        if (!stage) return;
        let cancelled = false;
        setResourcesLoading(true);
        Promise.all([
            // Resources currently attached to this stage.
            getAgents({ stage: stage.name }).catch(() => [] as Agent[]),
            getTools(undefined, { stage: stage.name }).catch(() => [] as Tool[]),
            getSREs(undefined, { stage: stage.name }).catch(() => [] as StructuredResponseEndpoint[]),
            getJsonDocuments({ stage: stage.name }).catch(() => [] as JsonDocument[]),
            // Full org listings — used to compute the "unattached" pool for the
            // "+ Add existing" picker. We filter client-side instead of adding
            // a dedicated query param so this works against the existing API.
            getAgents().catch(() => [] as Agent[]),
            getTools().catch(() => [] as Tool[]),
            getSREs().catch(() => [] as StructuredResponseEndpoint[]),
            getJsonDocuments().catch(() => [] as JsonDocument[]),
        ]).then(([agents, tools, sres, docs, allAgents, allTools, allSres, allDocs]) => {
            if (cancelled) return;
            setResources({
                agents,
                tools,
                sres,
                documents: docs,
            });
            setUnattached({
                agents: allAgents.filter((a) => !a.stage_id),
                tools: allTools.filter((t) => !t.stage_id),
                sres: allSres.filter((s) => !s.stage_id),
                documents: allDocs.filter((d) => !d.stage_id),
            });
            setResourcesLoading(false);
        });
        return () => {
            cancelled = true;
        };
    }, [stage, resourcesReloadKey]);

    const totals = useMemo(() => {
        return {
            agents: resources.agents.length,
            tools: resources.tools.length,
            sres: resources.sres.length,
            documents: resources.documents.length,
            total:
                resources.agents.length +
                resources.tools.length +
                resources.sres.length +
                resources.documents.length,
        };
    }, [resources]);

    const handleCopyId = () => {
        if (!stage) return;
        navigator.clipboard.writeText(stage.stage_id);
        showAlert({ title: 'Copied', message: 'Stage ID copied to clipboard' });
    };

    const handleOpenDeploy = async () => {
        if (!stage) return;
        setOpeningDeploy(true);
        try {
            const manifest = await getStageManifest(stage.stage_id);
            const apiBase = process.env.NEXT_PUBLIC_API_BASE_URL ?? '';
            setRedeployManifest({
                $schema: `${apiBase}/docs/manifest-schema.json`,
                ...manifest,
            });
            deployModal.onOpen();
        } catch (err) {
            showAlert({ title: 'Could not load manifest', message: (err as Error).message });
        } finally {
            setOpeningDeploy(false);
        }
    };

    const handleAttachExisting = async (
        kind: AddKind,
        resourceId: string,
        logicalName: string,
    ) => {
        if (!stage) return;
        const stageId = stage.stage_id;
        switch (kind) {
            case 'agents':
                await updateAgent({
                    agent_id: resourceId,
                    stage_id: stageId,
                    logical_name: logicalName,
                });
                break;
            case 'tools':
                await updateTool({
                    tool_id: resourceId,
                    stage_id: stageId,
                    logical_name: logicalName,
                });
                break;
            case 'sres':
                await updateSRE({
                    sre_id: resourceId,
                    stage_id: stageId,
                    logical_name: logicalName,
                });
                break;
            case 'documents':
                await updateJsonDocument({
                    document_id: resourceId,
                    stage_id: stageId,
                    logical_name: logicalName,
                });
                break;
        }
    };

    const buildPickable = (kind: AddKind): PickableResource[] => {
        switch (kind) {
            case 'agents':
                return unattached.agents.map((a) => ({
                    id: a.agent_id,
                    name: a.agent_name,
                    description: a.agent_description ?? null,
                }));
            case 'tools':
                return unattached.tools.map((t) => ({
                    id: t.tool_id,
                    name: t.name,
                    description: t.description ?? null,
                }));
            case 'sres':
                return unattached.sres.map((s) => ({
                    id: s.sre_id,
                    name: s.name,
                    description: s.description ?? null,
                }));
            case 'documents':
                return unattached.documents.map((d) => ({
                    id: d.document_id,
                    name: d.name || 'Untitled',
                    description: null,
                }));
        }
    };

    const handleDeleteConfirmed = async (mode: DeleteStageMode) => {
        if (!stage) return;
        const target = stage;
        setDeleting(true);
        const ok = await stagesStore.deleteStage(target.stage_id, mode);
        setDeleting(false);
        setConfirmDelete(false);
        if (ok) {
            // Both modes touch resource caches; refresh them so the dashboard
            // tabs reflect the new state when the user navigates away.
            refreshDashboardCaches();
            showAlert({
                title: mode === 'destroy' ? 'Destroyed' : 'Detached',
                message:
                    mode === 'destroy'
                        ? `Stage "${target.name}" and all its resources were deleted.`
                        : `Stage "${target.name}" deleted; its resources were detached and remain in your org.`,
            });
            router.push('/stages');
        }
    };

    if (stageError) {
        return (
            <Box p={{ base: 4, md: 6 }}>
                <Button leftIcon={<ArrowBackIcon />} variant="ghost" onClick={() => router.push('/stages')}>
                    Stages
                </Button>
                <Box mt={6}>
                    <Heading size="md" mb={2}>Stage not found</Heading>
                    <Text color={subtextColor}>{stageError}</Text>
                </Box>
            </Box>
        );
    }

    return (
        <Box p={{ base: 4, md: 6 }}>
            <Button
                leftIcon={<ArrowBackIcon />}
                variant="ghost"
                size="sm"
                mb={4}
                onClick={() => router.push('/stages')}
            >
                All stages
            </Button>

            <Flex align="flex-start" gap={4} mb={2} wrap="wrap">
                <Box flex="1" minW="240px">
                    <Skeleton isLoaded={!!stage}>
                        <Heading as="h1" size="xl">
                            {stage?.name ?? 'Loading…'}
                        </Heading>
                    </Skeleton>
                    <SkeletonText isLoaded={!!stage} noOfLines={1} mt={2} skeletonHeight={3}>
                        <Text color={subtextColor} fontSize="sm">
                            {stage?.description || 'No description'}
                        </Text>
                    </SkeletonText>
                </Box>
                <HStack spacing={2}>
                    <Button
                        size="sm"
                        leftIcon={<EditIcon />}
                        variant="outline"
                        onClick={editModal.onOpen}
                        isDisabled={!stage}
                    >
                        Edit
                    </Button>
                    <Button
                        size="sm"
                        leftIcon={<CopyIcon />}
                        variant="outline"
                        onClick={cloneModal.onOpen}
                        isDisabled={!stage}
                    >
                        Clone to new stage
                    </Button>
                    <Button
                        size="sm"
                        leftIcon={<FiCode />}
                        colorScheme="brand"
                        onClick={handleOpenDeploy}
                        isLoading={openingDeploy}
                        isDisabled={!stage}
                    >
                        View JSON
                    </Button>
                    <IconButton
                        aria-label="Delete stage"
                        size="sm"
                        icon={<DeleteIcon />}
                        variant="outline"
                        colorScheme="red"
                        onClick={() => setConfirmDelete(true)}
                        isDisabled={!stage}
                    />
                </HStack>
            </Flex>

            <HStack spacing={3} mt={3} mb={6} wrap="wrap">
                <Tooltip label="Copy stage ID">
                    <Button
                        size="xs"
                        variant="ghost"
                        leftIcon={<CopyIcon />}
                        onClick={handleCopyId}
                        isDisabled={!stage}
                        fontFamily="mono"
                    >
                        {stage ? stage.stage_id : '—'}
                    </Button>
                </Tooltip>
                <Text fontSize="xs" color={subtextColor}>
                    Created {formatTimestamp(stage?.created_at)}
                </Text>
                <Text fontSize="xs" color={subtextColor}>
                    Updated {formatTimestamp(stage?.updated_at)}
                </Text>
                <Badge colorScheme="purple" variant="subtle">
                    {totals.total} resource{totals.total === 1 ? '' : 's'}
                </Badge>
            </HStack>

            <Divider mb={6} />

            <ResourceSection
                title="Agents"
                count={totals.agents}
                isLoading={resourcesLoading}
                emptyHint="Add an `agents` block to this stage's manifest."
                items={resources.agents.map((a) => ({
                    id: a.agent_id,
                    logical: a.logical_name ?? null,
                    name: a.agent_name,
                    description: a.agent_description,
                    onClick: () => router.push(`/agent-builder/${a.agent_id}`),
                }))}
                cardBg={cardBg}
                cardBorder={cardBorder}
                subtextColor={subtextColor}
                onAddExisting={() => setAddKind('agents')}
                addExistingLabel="agent"
                hasUnattached={unattached.agents.length > 0}
            />
            <ResourceSection
                title="Tools"
                count={totals.tools}
                isLoading={resourcesLoading}
                emptyHint="Add a `tools` block to this stage's manifest."
                items={resources.tools.map((t) => ({
                    id: t.tool_id,
                    logical: t.logical_name ?? null,
                    name: t.name,
                    description: t.description ?? null,
                    onClick: () => router.push(`/tool-builder/${t.tool_id}`),
                }))}
                cardBg={cardBg}
                cardBorder={cardBorder}
                subtextColor={subtextColor}
                onAddExisting={() => setAddKind('tools')}
                addExistingLabel="tool"
                hasUnattached={unattached.tools.length > 0}
            />
            <ResourceSection
                title="Structured Response Endpoints"
                count={totals.sres}
                isLoading={resourcesLoading}
                emptyHint="Add an `sres` block to this stage's manifest."
                items={resources.sres.map((s) => ({
                    id: s.sre_id,
                    logical: s.logical_name ?? null,
                    name: s.name,
                    description: s.description ?? null,
                    onClick: () => router.push(`/sre-builder/${s.sre_id}`),
                }))}
                cardBg={cardBg}
                cardBorder={cardBorder}
                subtextColor={subtextColor}
                onAddExisting={() => setAddKind('sres')}
                addExistingLabel="SRE"
                hasUnattached={unattached.sres.length > 0}
            />
            <ResourceSection
                title="Documents"
                count={totals.documents}
                isLoading={resourcesLoading}
                emptyHint="JSON documents referenced from this stage."
                items={resources.documents.map((d) => ({
                    id: d.document_id,
                    logical: d.logical_name ?? null,
                    name: d.name,
                    description: null,
                    onClick: () => router.push(`/json-document-builder/${d.document_id}`),
                }))}
                cardBg={cardBg}
                cardBorder={cardBorder}
                subtextColor={subtextColor}
                onAddExisting={() => setAddKind('documents')}
                addExistingLabel="document"
                hasUnattached={unattached.documents.length > 0}
            />

            <AddExistingResourceModal
                isOpen={addKind !== null}
                onClose={() => setAddKind(null)}
                kindLabel={addKind ? KIND_LABELS[addKind] : ''}
                stageName={stage?.name ?? ''}
                availableResources={addKind ? buildPickable(addKind) : []}
                onAttach={async (resourceId, logicalName) => {
                    if (!addKind) return;
                    await handleAttachExisting(addKind, resourceId, logicalName);
                }}
                onAttached={() => {
                    showAlert({
                        title: 'Attached',
                        message: `Resource added to ${stage?.name ?? 'stage'}.`,
                    });
                    setResourcesReloadKey((n) => n + 1);
                }}
            />

            <EditStageModal
                isOpen={editModal.isOpen}
                onClose={editModal.onClose}
                stage={stage}
                onUpdated={(updated) => setStage(updated)}
            />

            <DeployFromJSONModal
                isOpen={deployModal.isOpen}
                onClose={() => {
                    deployModal.onClose();
                    setRedeployManifest(null);
                }}
                initialManifest={redeployManifest}
                defaultStageName={stage?.name}
                onDeployed={async (response) => {
                    showAlert({
                        title: 'Deployed',
                        message: `${response.summary.create} created, ${response.summary.update} updated, ${response.summary.delete} deleted.`,
                    });
                    try {
                        const fresh = await getStage(stageId);
                        setStage(fresh);
                    } catch {
                        // ignore — refresh failure is non-fatal here
                    }
                    setResourcesReloadKey((n) => n + 1);
                    refreshDashboardCaches();
                }}
            />

            <CloneStageModal
                isOpen={cloneModal.isOpen}
                onClose={cloneModal.onClose}
                sourceStage={stage}
                onCloned={(newStageId) => {
                    cloneModal.onClose();
                    refreshDashboardCaches();
                    router.push(`/stages/${newStageId}`);
                }}
            />

            <DeleteStageDialog
                stage={confirmDelete ? stage : null}
                isDeleting={deleting}
                onCancel={() => {
                    if (!deleting) setConfirmDelete(false);
                }}
                onConfirm={handleDeleteConfirmed}
            />
        </Box>
    );
});

interface ResourceItem {
    id: string;
    logical: string | null;
    name: string;
    description: string | null;
    onClick?: () => void;
}

const ResourceSection = ({
    title,
    count,
    isLoading,
    emptyHint,
    items,
    cardBg,
    cardBorder,
    subtextColor,
    onAddExisting,
    addExistingLabel,
    hasUnattached,
}: {
    title: string;
    count: number;
    isLoading: boolean;
    emptyHint: string;
    items: ResourceItem[];
    cardBg: string;
    cardBorder: string;
    subtextColor: string;
    /** Opens the "+ Add existing" picker for this section. */
    onAddExisting?: () => void;
    /** Used in the picker button label, e.g. "+ Add existing tool". */
    addExistingLabel?: string;
    /** When false, the "+ Add" button is disabled with a hint tooltip. */
    hasUnattached?: boolean;
}) => {
    const { colorMode } = useColorMode();
    const hoverBg = colorMode === 'dark' ? 'gray.700' : 'gray.50';

    return (
        <Box mb={6}>
            <Flex align="center" gap={2} mb={3}>
                <Heading as="h2" size="md">{title}</Heading>
                <Badge colorScheme="purple" variant="subtle">{count}</Badge>
                <Box flex="1" />
                {onAddExisting && (
                    <Tooltip
                        label={
                            hasUnattached
                                ? `Attach an unattached ${addExistingLabel} to this stage`
                                : `No unattached ${addExistingLabel}s in this org`
                        }
                        placement="top"
                        hasArrow
                        openDelay={300}
                    >
                        <Button
                            size="xs"
                            variant="outline"
                            leftIcon={<AddIcon boxSize={2.5} />}
                            onClick={onAddExisting}
                            isDisabled={!hasUnattached}
                        >
                            Add existing {addExistingLabel}
                        </Button>
                    </Tooltip>
                )}
            </Flex>
            {isLoading ? (
                <Flex justify="center" align="center" py={6}>
                    <Spinner size="sm" />
                </Flex>
            ) : items.length === 0 ? (
                <Text fontSize="sm" color={subtextColor}>{emptyHint}</Text>
            ) : (
                <Flex direction="column" gap={2}>
                    {items.map((item) => (
                        <Box
                            key={item.id}
                            p={3}
                            borderWidth="1px"
                            borderColor={cardBorder}
                            borderRadius="md"
                            bg={cardBg}
                            cursor={item.onClick ? 'pointer' : 'default'}
                            _hover={item.onClick ? { bg: hoverBg } : undefined}
                            onClick={item.onClick}
                            transition="background 0.15s"
                        >
                            <Flex align="center" gap={3} wrap="wrap">
                                {item.logical && (
                                    <Code fontSize="xs" px={2} py={1} borderRadius="md">
                                        {item.logical}
                                    </Code>
                                )}
                                <Text fontWeight="semibold" noOfLines={1} flex="1">
                                    {item.name}
                                </Text>
                            </Flex>
                            {item.description && (
                                <Text fontSize="sm" color={subtextColor} mt={1} noOfLines={1}>
                                    {item.description}
                                </Text>
                            )}
                        </Box>
                    ))}
                </Flex>
            )}
        </Box>
    );
};

const EditStageModal = ({
    isOpen,
    onClose,
    stage,
    onUpdated,
}: {
    isOpen: boolean;
    onClose: () => void;
    stage: Stage | null;
    onUpdated: (stage: Stage) => void;
}) => {
    const [name, setName] = useState('');
    const [description, setDescription] = useState('');
    const [submitting, setSubmitting] = useState(false);
    const subtextColor = useColorModeValue('gray.500', 'gray.400');

    useEffect(() => {
        if (isOpen && stage) {
            setName(stage.name);
            setDescription(stage.description ?? '');
        }
    }, [isOpen, stage]);

    const validName = STAGE_NAME_REGEX.test(name);
    const dirty = stage ? name !== stage.name || description !== (stage.description ?? '') : false;
    const canSubmit = validName && dirty && !submitting;

    const handleSubmit = async () => {
        if (!stage || !canSubmit) return;
        setSubmitting(true);
        const updated = await stagesStore.updateStage(stage.stage_id, {
            name,
            description: description.trim() ? description.trim() : null,
        });
        setSubmitting(false);
        if (updated) {
            onUpdated(updated);
            onClose();
        }
    };

    return (
        <Modal isOpen={isOpen} onClose={submitting ? () => undefined : onClose} isCentered>
            <ModalOverlay />
            <ModalContent>
                <ModalHeader>Edit stage</ModalHeader>
                <ModalCloseButton isDisabled={submitting} />
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
                                rows={3}
                            />
                        </FormControl>
                    </Flex>
                </ModalBody>
                <ModalFooter gap={3}>
                    <Button variant="ghost" onClick={onClose} isDisabled={submitting}>Cancel</Button>
                    <Button
                        colorScheme="brand"
                        onClick={handleSubmit}
                        isDisabled={!canSubmit}
                        isLoading={submitting}
                        loadingText="Saving…"
                    >
                        Save
                    </Button>
                </ModalFooter>
            </ModalContent>
        </Modal>
    );
};

/**
 * Modal that asks for a new stage name and then deploys the source stage's
 * current manifest into it. Useful for the staging → production promotion
 * flow without leaving the dashboard.
 *
 * Implementation note: we don't pre-create the stage record because
 * `POST /deploy` already auto-creates the target stage if it doesn't exist
 * and rolls everything back atomically on failure.
 */
const CloneStageModal = ({
    isOpen,
    onClose,
    sourceStage,
    onCloned,
}: {
    isOpen: boolean;
    onClose: () => void;
    sourceStage: Stage | null;
    onCloned: (newStageId: string) => void;
}) => {
    const { showAlert } = useAlert();
    const [name, setName] = useState('');
    const [submitting, setSubmitting] = useState(false);
    const [touched, setTouched] = useState(false);
    const subtextColor = useColorModeValue('gray.500', 'gray.400');

    useEffect(() => {
        if (isOpen) {
            setName('');
            setTouched(false);
            setSubmitting(false);
        }
    }, [isOpen]);

    const validName = STAGE_NAME_REGEX.test(name);
    const sameAsSource = sourceStage && name === sourceStage.name;
    const error = !touched
        ? null
        : !name
            ? 'Name is required.'
            : !validName
                ? 'Use lowercase letters, digits, and dashes. Must start with a letter.'
                : sameAsSource
                    ? 'Pick a different name from the source stage.'
                    : null;
    const canSubmit = !!sourceStage && validName && !sameAsSource && !submitting;

    const handleClone = async () => {
        if (!sourceStage || !canSubmit) {
            setTouched(true);
            return;
        }
        setSubmitting(true);
        try {
            const manifest = await getStageManifest(sourceStage.stage_id);
            const result = await deployManifest(name, manifest);
            showAlert({
                title: 'Cloned',
                message: `Stage "${name}" created from "${sourceStage.name}": ${result.summary.create} created, ${result.summary.update} updated.`,
            });
            onCloned(result.stage_id);
        } catch (err) {
            showAlert({ title: 'Clone failed', message: (err as Error).message });
        } finally {
            setSubmitting(false);
        }
    };

    const handleClose = () => {
        if (submitting) return;
        onClose();
    };

    return (
        <Modal isOpen={isOpen} onClose={handleClose} isCentered>
            <ModalOverlay />
            <ModalContent>
                <ModalHeader>
                    Clone {sourceStage?.name ?? 'stage'} to a new stage
                </ModalHeader>
                <ModalCloseButton isDisabled={submitting} />
                <ModalBody>
                    <Text fontSize="sm" color={subtextColor} mb={4}>
                        Deploys the current manifest of{' '}
                        <Text as="span" fontWeight="semibold">
                            {sourceStage?.name}
                        </Text>{' '}
                        into a brand new stage. The source stage stays untouched —
                        useful for promoting <code>staging</code> to{' '}
                        <code>production</code>.
                    </Text>
                    <FormControl isRequired isInvalid={!!error}>
                        <FormLabel>New stage name</FormLabel>
                        <Input
                            value={name}
                            onChange={(e) => {
                                setName(e.target.value);
                                setTouched(true);
                            }}
                            onBlur={() => setTouched(true)}
                            placeholder="frontend-prod"
                            autoFocus
                            maxLength={63}
                            fontFamily="mono"
                        />
                        {error ? (
                            <Text fontSize="xs" color="red.400" mt={1}>
                                {error}
                            </Text>
                        ) : (
                            <Text fontSize="xs" color={subtextColor} mt={1}>
                                Lowercase letters, digits, and dashes. Must start
                                with a letter.
                            </Text>
                        )}
                    </FormControl>
                </ModalBody>
                <ModalFooter gap={3}>
                    <Button variant="ghost" onClick={handleClose} isDisabled={submitting}>
                        Cancel
                    </Button>
                    <Button
                        colorScheme="brand"
                        onClick={handleClone}
                        isLoading={submitting}
                        loadingText="Cloning…"
                        isDisabled={!canSubmit}
                    >
                        Clone & deploy
                    </Button>
                </ModalFooter>
            </ModalContent>
        </Modal>
    );
};

export default StageDetailPage;
