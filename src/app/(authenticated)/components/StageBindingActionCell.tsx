'use client';

import React from 'react';
import { createPortal } from 'react-dom';
import {
    IconButton,
    Td,
    Tooltip,
    useColorModeValue,
    useDisclosure,
} from '@chakra-ui/react';
import { EditIcon, LinkIcon } from '@chakra-ui/icons';
import AssignToStageModal from '@/app/(authenticated)/stages/components/AssignToStageModal';
import { StageAssignmentValue } from '@/app/(authenticated)/stages/components/StageAssignmentField';

interface StageBindingActionCellProps {
    value: StageAssignmentValue;
    /** Display name shown in the modal title and used to seed the "Suggest" button. */
    resourceDisplayName: string;
    /** Short label shown in the modal subtitle (e.g. "tool", "agent"). */
    resourceKind: string;
    /** Persist the new binding. The modal surfaces any thrown error. */
    onSave: (next: StageAssignmentValue) => Promise<void>;
    /** Called after a successful save so the parent list can refresh. */
    onSaved?: (next: StageAssignmentValue) => void;
}

/**
 * Per-row action cell that lets a user attach / detach / re-bind a resource's
 * stage assignment without leaving the list page. Renders a single compact
 * icon button — `LinkIcon` when unattached, `EditIcon` when attached — which
 * opens {@link AssignToStageModal}.
 *
 * Used by the four resource list pages (agents, tools, sres, documents) and
 * the stage detail page's "Add existing" picker. The component contains its
 * own modal disclosure state so each row is self-managed.
 *
 * The wrapping `<Td>` lives here so the call site only has to add a matching
 * `<Th>` (or empty cell) to the table header.
 */
export const StageBindingActionCell: React.FC<StageBindingActionCellProps> = ({
    value,
    resourceDisplayName,
    resourceKind,
    onSave,
    onSaved,
}) => {
    const { isOpen, onOpen, onClose } = useDisclosure();
    const subtextColor = useColorModeValue('gray.500', 'gray.400');
    // We portal the modal to <body> ourselves rather than relying on
    // Chakra's <Portal> wrapper. Chakra's DefaultPortal briefly renders a
    // `<span ref />` placeholder before its portal target mounts, which
    // would land inside the parent `<tr>` and trip React's HTML-nesting
    // hydration warning ("<span> cannot be a child of <tr>"). Going
    // straight to document.body sidesteps that intermediate node.
    const [browserMounted, setBrowserMounted] = React.useState(false);
    React.useEffect(() => {
        setBrowserMounted(true);
    }, []);

    const isAttached = !!value.stage_id;

    return (
        <>
            <Td w="1px" onClick={(e) => e.stopPropagation()}>
                <Tooltip
                    label={isAttached ? 'Edit stage binding' : 'Attach to a stage'}
                    placement="top"
                    hasArrow
                    openDelay={300}
                >
                    <IconButton
                        aria-label={
                            isAttached
                                ? `Edit stage binding for ${resourceDisplayName}`
                                : `Attach ${resourceDisplayName} to a stage`
                        }
                        icon={isAttached ? <EditIcon /> : <LinkIcon />}
                        size="xs"
                        variant="ghost"
                        color={subtextColor}
                        onClick={onOpen}
                    />
                </Tooltip>
            </Td>

            {browserMounted &&
                createPortal(
                    <AssignToStageModal
                        isOpen={isOpen}
                        onClose={onClose}
                        resourceDisplayName={resourceDisplayName}
                        resourceKind={resourceKind}
                        initialValue={value}
                        onSave={onSave}
                        onSaved={onSaved}
                    />,
                    document.body,
                )}
        </>
    );
};

export default StageBindingActionCell;
