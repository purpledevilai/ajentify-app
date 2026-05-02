'use client';

import React from 'react';
import {
    Alert,
    AlertIcon,
    Button,
    HStack,
    Modal,
    ModalBody,
    ModalCloseButton,
    ModalContent,
    ModalFooter,
    ModalHeader,
    ModalOverlay,
    Text,
    VStack,
} from '@chakra-ui/react';
import {
    StageAssignmentField,
    StageAssignmentValue,
    validateStageAssignment,
} from './StageAssignmentField';

interface AssignToStageModalProps {
    isOpen: boolean;
    onClose: () => void;
    /** Display name of the resource being attached — shown in the modal title and used to seed the "Suggest" button. */
    resourceDisplayName: string;
    /** Short label like "agent" / "tool" / "SRE" / "document" — used in the title and copy. */
    resourceKind: string;
    /** Current binding. Pass `{ stage_id: null, logical_name: null }` if unattached. */
    initialValue: StageAssignmentValue;
    /** Persist the binding. Throw on failure — the modal will surface the message. */
    onSave: (next: StageAssignmentValue) => Promise<void>;
    /** Called after a successful save; lets the caller refresh its list / detail view. */
    onSaved?: (next: StageAssignmentValue) => void;
    /**
     * When provided, locks the stage and only exposes the logical-name input.
     * Used by the stage-detail "+ Add existing" picker so users can't
     * accidentally bind to the wrong stage from inside that flow.
     */
    lockedStageId?: string;
}

/**
 * Generic modal that wraps {@link StageAssignmentField} for the four resource
 * kinds. Owns local form state, validation, and the in-flight save spinner so
 * each call site only has to provide a save function.
 */
export const AssignToStageModal: React.FC<AssignToStageModalProps> = ({
    isOpen,
    onClose,
    resourceDisplayName,
    resourceKind,
    initialValue,
    onSave,
    onSaved,
    lockedStageId,
}) => {
    const [value, setValue] = React.useState<StageAssignmentValue>(initialValue);
    const [saving, setSaving] = React.useState(false);
    const [error, setError] = React.useState<string | null>(null);

    React.useEffect(() => {
        if (isOpen) {
            setValue(initialValue);
            setError(null);
            setSaving(false);
        }
    }, [isOpen, initialValue]);

    const validationError = validateStageAssignment(value);

    const dirty =
        value.stage_id !== initialValue.stage_id ||
        value.logical_name !== initialValue.logical_name;

    const handleSave = async () => {
        if (validationError) return;
        setSaving(true);
        setError(null);
        try {
            await onSave(value);
            onSaved?.(value);
            onClose();
        } catch (e) {
            setError((e as Error).message ?? 'Failed to save assignment');
        } finally {
            setSaving(false);
        }
    };

    const handleDetach = async () => {
        setSaving(true);
        setError(null);
        try {
            const detached: StageAssignmentValue = { stage_id: null, logical_name: null };
            await onSave(detached);
            onSaved?.(detached);
            onClose();
        } catch (e) {
            setError((e as Error).message ?? 'Failed to detach');
        } finally {
            setSaving(false);
        }
    };

    const isAttached = !!initialValue.stage_id;

    return (
        <Modal isOpen={isOpen} onClose={onClose} size="lg" isCentered>
            <ModalOverlay />
            <ModalContent>
                <ModalHeader>
                    {isAttached ? 'Edit stage assignment' : 'Attach to stage'}
                    <Text fontSize="sm" fontWeight="normal" color="gray.500" mt={1}>
                        {resourceKind}: {resourceDisplayName}
                    </Text>
                </ModalHeader>
                <ModalCloseButton />
                <ModalBody>
                    <VStack align="stretch" spacing={4}>
                        <StageAssignmentField
                            value={value}
                            onChange={setValue}
                            resourceDisplayName={resourceDisplayName}
                            isDisabled={saving}
                            lockedStageId={lockedStageId}
                        />
                        {error && (
                            <Alert status="error" borderRadius="md" fontSize="sm">
                                <AlertIcon />
                                {error}
                            </Alert>
                        )}
                    </VStack>
                </ModalBody>
                <ModalFooter>
                    <HStack justify="space-between" width="100%">
                        <HStack>
                            {isAttached && !lockedStageId && (
                                <Button
                                    variant="ghost"
                                    colorScheme="red"
                                    onClick={handleDetach}
                                    isDisabled={saving}
                                >
                                    Detach
                                </Button>
                            )}
                        </HStack>
                        <HStack>
                            <Button variant="ghost" onClick={onClose} isDisabled={saving}>
                                Cancel
                            </Button>
                            <Button
                                colorScheme="purple"
                                onClick={handleSave}
                                isLoading={saving}
                                isDisabled={!dirty || !!validationError}
                            >
                                Save
                            </Button>
                        </HStack>
                    </HStack>
                </ModalFooter>
            </ModalContent>
        </Modal>
    );
};

export default AssignToStageModal;
