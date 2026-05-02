'use client';

import React, { useEffect, useRef, useState } from 'react';
import {
    AlertDialog,
    AlertDialogBody,
    AlertDialogContent,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogOverlay,
    Box,
    Button,
    Flex,
    Radio,
    RadioGroup,
    Text,
    useColorModeValue,
} from '@chakra-ui/react';
import { DeleteStageMode } from '@/api/stage/deleteStage';
import { Stage } from '@/types/stage';

interface DeleteStageDialogProps {
    /** Stage to delete; null hides the dialog. The caller controls open/close. */
    stage: Stage | null;
    isDeleting: boolean;
    onCancel: () => void;
    /** Called with the user's chosen mode when they confirm. */
    onConfirm: (mode: DeleteStageMode) => void;
}

/**
 * Confirmation dialog for `DELETE /stage/{id}`. The backend forces the caller
 * to pick between two destructive paths, so this UI shows them side-by-side
 * with an explanation, defaulting to the safer one (`detach`) and only firing
 * on a deliberate click of the red "Delete" button.
 *
 * Used by both the stages list page (row delete) and the stage detail page.
 */
export const DeleteStageDialog: React.FC<DeleteStageDialogProps> = ({
    stage,
    isDeleting,
    onCancel,
    onConfirm,
}) => {
    const cancelRef = useRef<HTMLButtonElement>(null);
    const [mode, setMode] = useState<DeleteStageMode>('detach');
    const subtextColor = useColorModeValue('gray.600', 'gray.300');
    const optionBg = useColorModeValue('gray.50', 'gray.700');
    const optionBorder = useColorModeValue('gray.200', 'gray.600');
    const dangerBg = useColorModeValue('red.50', 'red.900');
    const dangerBorder = useColorModeValue('red.200', 'red.700');

    // Always re-arm to the safer default when the dialog re-opens.
    useEffect(() => {
        if (stage) setMode('detach');
    }, [stage]);

    return (
        <AlertDialog
            isOpen={stage !== null}
            leastDestructiveRef={cancelRef as React.RefObject<HTMLButtonElement>}
            onClose={onCancel}
            isCentered
            size="lg"
        >
            <AlertDialogOverlay />
            <AlertDialogContent>
                <AlertDialogHeader fontSize="lg" fontWeight="bold">
                    Delete stage{' '}
                    <Text as="span" fontWeight="extrabold">
                        {stage?.name}
                    </Text>
                </AlertDialogHeader>
                <AlertDialogBody>
                    <Text mb={4} color={subtextColor} fontSize="sm">
                        Pick what should happen to the resources owned by this
                        stage. This action can&apos;t be undone.
                    </Text>
                    <RadioGroup
                        value={mode}
                        onChange={(v) => setMode(v as DeleteStageMode)}
                    >
                        <Flex direction="column" gap={3}>
                            <Box
                                p={3}
                                borderWidth="1px"
                                borderRadius="md"
                                bg={mode === 'detach' ? optionBg : 'transparent'}
                                borderColor={
                                    mode === 'detach' ? optionBorder : 'transparent'
                                }
                                cursor="pointer"
                                onClick={() => setMode('detach')}
                            >
                                <Radio value="detach" colorScheme="brand">
                                    <Text fontWeight="semibold">
                                        Detach resources, then delete stage
                                    </Text>
                                </Radio>
                                <Text fontSize="xs" color={subtextColor} mt={1} ml={6}>
                                    Agents, tools, SREs, JSON documents, and their
                                    parameter definitions stay in your org but lose
                                    their stage binding. They show up under the
                                    regular dashboard pages and can be re-attached to
                                    another stage later.
                                </Text>
                            </Box>

                            <Box
                                p={3}
                                borderWidth="1px"
                                borderRadius="md"
                                bg={mode === 'destroy' ? dangerBg : 'transparent'}
                                borderColor={
                                    mode === 'destroy' ? dangerBorder : 'transparent'
                                }
                                cursor="pointer"
                                onClick={() => setMode('destroy')}
                            >
                                <Radio value="destroy" colorScheme="red">
                                    <Text fontWeight="semibold" color="red.500">
                                        Destroy stage and all resources in it
                                    </Text>
                                </Radio>
                                <Text fontSize="xs" color={subtextColor} mt={1} ml={6}>
                                    Permanently deletes every agent, tool, SRE, JSON
                                    document, and parameter definition that belongs
                                    to this stage. Use when you&apos;re tearing the
                                    stage down for good.
                                </Text>
                            </Box>
                        </Flex>
                    </RadioGroup>
                </AlertDialogBody>
                <AlertDialogFooter gap={3}>
                    <Button
                        ref={cancelRef}
                        onClick={onCancel}
                        isDisabled={isDeleting}
                    >
                        Cancel
                    </Button>
                    <Button
                        colorScheme="red"
                        onClick={() => onConfirm(mode)}
                        isLoading={isDeleting}
                        loadingText={mode === 'destroy' ? 'Destroying…' : 'Detaching…'}
                    >
                        {mode === 'destroy' ? 'Destroy stage' : 'Detach & delete'}
                    </Button>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    );
};

export default DeleteStageDialog;
