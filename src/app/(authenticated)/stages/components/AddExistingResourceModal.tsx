'use client';

import React from 'react';
import {
    Alert,
    AlertIcon,
    Box,
    Button,
    Code,
    Flex,
    FormControl,
    FormHelperText,
    FormLabel,
    HStack,
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
    Text,
    useColorModeValue,
} from '@chakra-ui/react';
import { ArrowBackIcon, SearchIcon } from '@chakra-ui/icons';
import {
    LOGICAL_NAME_PATTERN,
    suggestLogicalName,
} from './StageAssignmentField';

/**
 * Picker entry for the "+ Add existing" flow on the stage detail page.
 * Consumers shape the available unattached resources of a single kind into
 * this minimal struct.
 */
export interface PickableResource {
    id: string;
    name: string;
    description?: string | null;
}

interface AddExistingResourceModalProps {
    isOpen: boolean;
    onClose: () => void;
    /** Display name for the section ("agent", "tool", "SRE", "document"). */
    kindLabel: string;
    /** Display name of the target stage — shown in the title and helper text. */
    stageName: string;
    /**
     * The set of dashboard-built resources of this kind that have no current
     * stage binding. The caller is responsible for filtering — we render this
     * list as-is.
     */
    availableResources: PickableResource[];
    /**
     * Persist the binding. Throw on failure — the modal will surface the
     * message in an inline alert.
     */
    onAttach: (resourceId: string, logicalName: string) => Promise<void>;
    /** Called after a successful attach so the parent can refresh its data. */
    onAttached?: () => void;
}

/**
 * Two-step modal used by the stage detail page to attach an *existing*
 * (currently unattached) resource to the current stage:
 *   1. Pick a resource from a searchable list.
 *   2. Choose a logical name (suggested from the resource's display name).
 *
 * Builder pages and list rows use {@link AssignToStageModal} instead because
 * they already have a known target resource.
 */
export const AddExistingResourceModal: React.FC<AddExistingResourceModalProps> = ({
    isOpen,
    onClose,
    kindLabel,
    stageName,
    availableResources,
    onAttach,
    onAttached,
}) => {
    const [search, setSearch] = React.useState('');
    const [picked, setPicked] = React.useState<PickableResource | null>(null);
    const [logicalName, setLogicalName] = React.useState('');
    const [saving, setSaving] = React.useState(false);
    const [error, setError] = React.useState<string | null>(null);

    const subtextColor = useColorModeValue('gray.500', 'gray.400');
    const cardBorder = useColorModeValue('gray.200', 'gray.700');
    const hoverBg = useColorModeValue('gray.50', 'gray.700');

    React.useEffect(() => {
        if (isOpen) {
            setSearch('');
            setPicked(null);
            setLogicalName('');
            setError(null);
            setSaving(false);
        }
    }, [isOpen]);

    const filtered = React.useMemo(() => {
        const q = search.trim().toLowerCase();
        if (!q) return availableResources;
        return availableResources.filter(
            (r) =>
                r.name.toLowerCase().includes(q) ||
                (r.description ?? '').toLowerCase().includes(q),
        );
    }, [availableResources, search]);

    const logicalNameValid = LOGICAL_NAME_PATTERN.test(logicalName);

    const handlePick = (resource: PickableResource) => {
        setPicked(resource);
        setLogicalName(suggestLogicalName(resource.name));
        setError(null);
    };

    const handleBack = () => {
        setPicked(null);
        setLogicalName('');
        setError(null);
    };

    const handleSave = async () => {
        if (!picked || !logicalNameValid) return;
        setSaving(true);
        setError(null);
        try {
            await onAttach(picked.id, logicalName);
            onAttached?.();
            onClose();
        } catch (e) {
            setError((e as Error).message ?? 'Failed to attach');
        } finally {
            setSaving(false);
        }
    };

    return (
        <Modal isOpen={isOpen} onClose={saving ? () => undefined : onClose} size="lg" isCentered>
            <ModalOverlay />
            <ModalContent>
                <ModalHeader>
                    <HStack spacing={2}>
                        {picked && (
                            <IconButton
                                aria-label="Back to picker"
                                icon={<ArrowBackIcon />}
                                size="sm"
                                variant="ghost"
                                onClick={handleBack}
                                isDisabled={saving}
                            />
                        )}
                        <Box>
                            <Text>
                                Add existing {kindLabel} to{' '}
                                <Text as="span" fontFamily="mono">
                                    {stageName}
                                </Text>
                            </Text>
                            {!picked && (
                                <Text fontSize="sm" fontWeight="normal" color={subtextColor} mt={1}>
                                    Pick an unattached {kindLabel} to bring under this stage.
                                </Text>
                            )}
                            {picked && (
                                <Text fontSize="sm" fontWeight="normal" color={subtextColor} mt={1}>
                                    Choose a logical name for this {kindLabel}.
                                </Text>
                            )}
                        </Box>
                    </HStack>
                </ModalHeader>
                <ModalCloseButton isDisabled={saving} />
                <ModalBody>
                    {!picked && (
                        <Flex direction="column" gap={3}>
                            <InputGroup size="sm">
                                <InputLeftElement pointerEvents="none">
                                    <SearchIcon color="gray.400" />
                                </InputLeftElement>
                                <Input
                                    placeholder={`Search unattached ${kindLabel}s…`}
                                    value={search}
                                    onChange={(e) => setSearch(e.target.value)}
                                    autoFocus
                                />
                            </InputGroup>

                            {availableResources.length === 0 ? (
                                <Alert status="info" borderRadius="md" fontSize="sm">
                                    <AlertIcon />
                                    No unattached {kindLabel}s in this organization. Create one
                                    from the dashboard or via /deploy.
                                </Alert>
                            ) : filtered.length === 0 ? (
                                <Text fontSize="sm" color={subtextColor} textAlign="center" py={4}>
                                    No matches for &quot;{search}&quot;.
                                </Text>
                            ) : (
                                <Box maxH="320px" overflowY="auto">
                                    <Flex direction="column" gap={2}>
                                        {filtered.map((r) => (
                                            <Box
                                                key={r.id}
                                                p={3}
                                                borderWidth="1px"
                                                borderColor={cardBorder}
                                                borderRadius="md"
                                                cursor="pointer"
                                                _hover={{ bg: hoverBg }}
                                                transition="background 0.15s"
                                                onClick={() => handlePick(r)}
                                            >
                                                <Text fontWeight="semibold" noOfLines={1}>
                                                    {r.name}
                                                </Text>
                                                {r.description && (
                                                    <Text
                                                        fontSize="sm"
                                                        color={subtextColor}
                                                        noOfLines={1}
                                                        mt={1}
                                                    >
                                                        {r.description}
                                                    </Text>
                                                )}
                                            </Box>
                                        ))}
                                    </Flex>
                                </Box>
                            )}
                        </Flex>
                    )}

                    {picked && (
                        <Flex direction="column" gap={4}>
                            <Box
                                p={3}
                                borderWidth="1px"
                                borderColor={cardBorder}
                                borderRadius="md"
                            >
                                <Text fontSize="xs" color={subtextColor} mb={1}>
                                    Selected {kindLabel}
                                </Text>
                                <Text fontWeight="semibold">{picked.name}</Text>
                                {picked.description && (
                                    <Text fontSize="sm" color={subtextColor} mt={1} noOfLines={2}>
                                        {picked.description}
                                    </Text>
                                )}
                            </Box>

                            <FormControl
                                isInvalid={!!logicalName && !logicalNameValid}
                                isDisabled={saving}
                            >
                                <FormLabel fontSize="sm">Logical name</FormLabel>
                                <Input
                                    size="sm"
                                    value={logicalName}
                                    onChange={(e) => setLogicalName(e.target.value)}
                                    placeholder="e.g. navigate_to_page"
                                    fontFamily="mono"
                                    autoFocus
                                />
                                <FormHelperText>
                                    {logicalName && !logicalNameValid ? (
                                        'Must start with a lowercase letter; only lowercase letters, digits, and underscores.'
                                    ) : (
                                        <>
                                            Will be reachable as{' '}
                                            <Code fontSize="xs">
                                                ({stageName}, {logicalName || 'logical_name'})
                                            </Code>
                                            .
                                        </>
                                    )}
                                </FormHelperText>
                            </FormControl>

                            {error && (
                                <Alert status="error" borderRadius="md" fontSize="sm">
                                    <AlertIcon />
                                    {error}
                                </Alert>
                            )}
                        </Flex>
                    )}
                </ModalBody>
                <ModalFooter gap={3}>
                    <Button variant="ghost" onClick={onClose} isDisabled={saving}>
                        Cancel
                    </Button>
                    {picked && (
                        <Button
                            colorScheme="brand"
                            onClick={handleSave}
                            isLoading={saving}
                            isDisabled={!logicalNameValid}
                            loadingText="Attaching…"
                        >
                            Attach
                        </Button>
                    )}
                </ModalFooter>
            </ModalContent>
        </Modal>
    );
};

export default AddExistingResourceModal;
