'use client';

import React from 'react';
import {
    Alert,
    AlertIcon,
    Box,
    Button,
    FormControl,
    FormHelperText,
    FormLabel,
    HStack,
    Input,
    Select,
    Text,
    useColorModeValue,
} from '@chakra-ui/react';
import { observer } from 'mobx-react-lite';
import { stagesStore } from '@/store/StagesStore';

/**
 * Same regex the backend's manifest schema uses for logical names
 * (`RequestHandlers/Deploy/ManifestSchema.py::LOGICAL_NAME_PATTERN`). We
 * mirror the rule client-side so users get inline feedback before they hit
 * the network.
 */
export const LOGICAL_NAME_PATTERN = /^[a-z][a-z0-9_]{0,62}$/;

/**
 * Convert a free-form display name into a logical-name candidate. Lowercases,
 * collapses runs of non `[a-z0-9_]` to single underscores, trims leading
 * digits/underscores, and truncates to the 63-char limit. Used as a "Suggest"
 * helper, not enforced.
 */
export function suggestLogicalName(displayName: string): string {
    const cleaned = displayName
        .toLowerCase()
        .replace(/[^a-z0-9_]+/g, '_')
        .replace(/^_+/, '')
        .replace(/^[0-9]+/, '')
        .replace(/_+$/, '')
        .slice(0, 63);
    return cleaned || 'resource';
}

export interface StageAssignmentValue {
    stage_id: string | null;
    logical_name: string | null;
}

interface StageAssignmentFieldProps {
    value: StageAssignmentValue;
    onChange: (next: StageAssignmentValue) => void;
    /** Display name of the underlying resource — used to power the "Suggest" button. */
    resourceDisplayName?: string;
    /** Disables both inputs (e.g. while saving). */
    isDisabled?: boolean;
    /** When true, the form is read-only — used inside list-row "current binding" displays. */
    isReadOnly?: boolean;
    /** Optional caption shown in the empty / unattached state. */
    detachedHint?: string;
    /** When provided, hides the stage dropdown and pins assignment to this stage. Used by the stage-detail "+ Add" picker. */
    lockedStageId?: string;
}

/**
 * Reusable form block for setting a resource's `(stage_id, logical_name)` binding.
 * Used by the four resource builder pages, the per-row "Assign to stage" modal
 * on each list page, and the stage-detail "+ Add existing" picker.
 *
 * UX rules enforced here (mirroring the backend validator):
 *   - The two fields are paired. If the user picks a stage, they must also
 *     enter a logical name. If they clear the stage to "(unassigned)", the
 *     logical name input is hidden so the resulting payload is unambiguously
 *     a detach.
 *   - Logical names are validated against {@link LOGICAL_NAME_PATTERN} as the
 *     user types; an inline message explains the rule.
 *   - The "Suggest" button derives a logical name from the resource's display
 *     name. Hidden when the user has already typed something.
 */
export const StageAssignmentField = observer((props: StageAssignmentFieldProps) => {
    const {
        value,
        onChange,
        resourceDisplayName,
        isDisabled = false,
        isReadOnly = false,
        detachedHint,
        lockedStageId,
    } = props;

    const subtextColor = useColorModeValue('gray.500', 'gray.400');

    React.useEffect(() => {
        void stagesStore.loadStages();
    }, []);

    React.useEffect(() => {
        if (lockedStageId && value.stage_id !== lockedStageId) {
            onChange({ ...value, stage_id: lockedStageId });
        }
        // We deliberately don't react to `value` changes here — only push the
        // lock when the lock itself changes or on first mount.
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [lockedStageId]);

    const stages = stagesStore.stages ?? [];
    const stagesLoading = stagesStore.stagesLoading;

    const stageId = value.stage_id;
    const logicalName = value.logical_name ?? '';

    const isAttached = !!stageId;
    const logicalNameValid = !logicalName || LOGICAL_NAME_PATTERN.test(logicalName);
    const showSuggest = isAttached && !logicalName && !!resourceDisplayName;

    const handleStageChange = (nextStageId: string) => {
        if (!nextStageId) {
            onChange({ stage_id: null, logical_name: null });
        } else {
            onChange({
                stage_id: nextStageId,
                logical_name: logicalName || null,
            });
        }
    };

    const handleLogicalChange = (next: string) => {
        onChange({
            stage_id: stageId,
            logical_name: next || null,
        });
    };

    const handleSuggest = () => {
        if (!resourceDisplayName) return;
        onChange({
            stage_id: stageId,
            logical_name: suggestLogicalName(resourceDisplayName),
        });
    };

    if (stagesLoading && stages.length === 0) {
        return (
            <Text fontSize="sm" color={subtextColor}>
                Loading stages…
            </Text>
        );
    }

    if (!stagesLoading && stages.length === 0) {
        return (
            <Alert status="info" borderRadius="md" fontSize="sm">
                <AlertIcon />
                Create a stage from the Stages page before attaching resources.
            </Alert>
        );
    }

    return (
        <Box>
            {!lockedStageId && (
                <FormControl isDisabled={isDisabled || isReadOnly}>
                    <FormLabel fontSize="sm">Stage</FormLabel>
                    <Select
                        size="sm"
                        value={stageId ?? ''}
                        onChange={(e) => handleStageChange(e.target.value)}
                        placeholder="(Unassigned — dashboard-only)"
                    >
                        {stages.map((s) => (
                            <option key={s.stage_id} value={s.stage_id}>
                                {s.name}
                            </option>
                        ))}
                    </Select>
                    <FormHelperText>
                        {isAttached
                            ? 'This resource will appear in the stage\'s manifest and is reconciled by /deploy.'
                            : (detachedHint ??
                                'Hand-built resources live outside any stage. Pick a stage to make this resource AjDK-managed.')}
                    </FormHelperText>
                </FormControl>
            )}

            {isAttached && (
                <FormControl
                    isDisabled={isDisabled || isReadOnly}
                    isInvalid={!!logicalName && !logicalNameValid}
                    mt={lockedStageId ? 0 : 4}
                >
                    <FormLabel fontSize="sm">Logical name</FormLabel>
                    <HStack align="start">
                        <Input
                            size="sm"
                            value={logicalName}
                            onChange={(e) => handleLogicalChange(e.target.value)}
                            placeholder="e.g. navigate_to_page"
                            fontFamily="mono"
                        />
                        {showSuggest && (
                            <Button
                                size="sm"
                                variant="ghost"
                                onClick={handleSuggest}
                                isDisabled={isDisabled || isReadOnly}
                            >
                                Suggest
                            </Button>
                        )}
                    </HStack>
                    <FormHelperText>
                        {logicalName && !logicalNameValid
                            ? 'Must start with a lowercase letter; only lowercase letters, digits, and underscores.'
                            : 'Stable identifier within the stage; immutable once another resource references it.'}
                    </FormHelperText>
                </FormControl>
            )}
        </Box>
    );
});

export default StageAssignmentField;

/**
 * Validate a candidate `(stage_id, logical_name)` pair *before* sending to the
 * backend. Returns null on valid; a user-facing error string otherwise.
 *
 * The backend will independently re-validate; this just keeps the form's
 * "Save" button honest so we don't round-trip on obvious mistakes.
 */
export function validateStageAssignment(value: StageAssignmentValue): string | null {
    const { stage_id, logical_name } = value;
    if (!stage_id && !logical_name) return null;
    if (!stage_id || !logical_name) {
        return 'Pick a stage and provide a logical name (or clear both to leave unassigned).';
    }
    if (!LOGICAL_NAME_PATTERN.test(logical_name)) {
        return 'Logical name must match ^[a-z][a-z0-9_]{0,62}$';
    }
    return null;
}
