'use client';

import React, { useCallback, useEffect, useRef, useState } from 'react';
import { observer } from 'mobx-react-lite';
import { useRouter } from 'next/navigation';
import { useJsonDocumentBuilder } from '@/store/useJsonDocumentBuilder';
import { JsonDocumentBuilderStoreContext } from '../JsonDocumentBuilderContext';
import { useStores } from '@/store/StoreContext';
import {
    Flex,
    FormControl,
    FormLabel,
    Heading,
    IconButton,
    Input,
    Button,
    Tooltip,
    Text,
    useColorMode,
    AlertDialog,
    AlertDialogBody,
    AlertDialogContent,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogOverlay,
    useDisclosure,
} from '@chakra-ui/react';
import { ArrowBackIcon } from '@chakra-ui/icons';
import MonacoEditor from '@monaco-editor/react';
import StageAssignmentField from '@/app/(authenticated)/stages/components/StageAssignmentField';
import { InlineError } from '@/app/components/InlineError';

type Params = Promise<{ document_id: string[] }>;

interface PageProps {
    params: Params;
}

const JsonDocumentBuilderPage = observer(({ params }: PageProps) => {
    const jsonDocumentBuilderStore = useJsonDocumentBuilder();
    const router = useRouter();
    const { jsonDocuments: jsonDocumentsStore } = useStores();
    const { isOpen: isDeleteOpen, onOpen: onDeleteOpen, onClose: onDeleteClose } = useDisclosure();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const cancelRef = useRef<any>(null);
    const [isDeleting, setIsDeleting] = useState(false);

    const loadDocumentId = useCallback(async () => {
        const paramArray = (await params).document_id ?? undefined;
        const id = paramArray ? paramArray[0] : undefined;
        if (!id) {
            jsonDocumentBuilderStore.setIsNewDocument(true);
            return;
        }
        await jsonDocumentsStore.loadDocuments();
        const doc = jsonDocumentsStore.documents?.find(d => d.document_id === id);
        if (doc) {
            jsonDocumentBuilderStore.setDocument(doc);
        } else {
            router.push('/documents');
        }
    }, [params, jsonDocumentsStore, router, jsonDocumentBuilderStore]);

    useEffect(() => {
        void loadDocumentId();
        return () => {
            jsonDocumentBuilderStore.reset();
        };
    }, [loadDocumentId, jsonDocumentBuilderStore]);

    const onSaveDocument = async () => {
        await jsonDocumentBuilderStore.onSaveDocumentClick();
        jsonDocumentsStore.loadDocuments(true);
        window.history.back();
    }

    const handleConfirmDelete = async () => {
        setIsDeleting(true);
        await jsonDocumentBuilderStore.deleteDocument();
        setIsDeleting(false);
        onDeleteClose();
        jsonDocumentsStore.loadDocuments(true);
        window.history.back();
    }

    return (
        <JsonDocumentBuilderStoreContext.Provider value={jsonDocumentBuilderStore}>
            <Flex p={4} direction="column" alignItems="center" h="100%" w="100%">
            <Flex direction="row" w="100%" mb={4} gap={4} align="center">
                <IconButton
                    aria-label="Back"
                    icon={<ArrowBackIcon />}
                    variant="ghost"
                    color="inherit"
                    _hover={{ bg: 'gray.200', _dark: { bg: 'gray.700' } }}
                    onClick={() => window.history.back()}
                />
                <Heading flex="1">Document Builder</Heading>
            </Flex>
            <Flex direction="column" w="100%" gap={6}>
                <FormControl>
                    <FormLabel>Name</FormLabel>
                    <Input
                        value={jsonDocumentBuilderStore.document.name}
                        onChange={(e) => jsonDocumentBuilderStore.setName(e.target.value)}
                    />
                </FormControl>

                {/* Stage assignment — only relevant once the document exists.
                    Attaching a document to a stage adds it to the stage's
                    exported manifest. */}
                {jsonDocumentBuilderStore.document.document_id && (
                    <Flex direction="column" borderWidth="1px" borderRadius="md" p={4} gap={2}>
                        <Heading size="sm">Stage assignment</Heading>
                        <StageAssignmentField
                            value={{
                                stage_id: jsonDocumentBuilderStore.document.stage_id ?? null,
                                logical_name: jsonDocumentBuilderStore.document.logical_name ?? null,
                            }}
                            onChange={(next) =>
                                jsonDocumentBuilderStore.setStageAssignment(
                                    next.stage_id,
                                    next.logical_name,
                                )
                            }
                            resourceDisplayName={jsonDocumentBuilderStore.document.name}
                        />
                    </Flex>
                )}

                <FormControl>
                    <FormLabel>Data</FormLabel>
                    <MonacoEditor
                        height="60vh"
                        defaultLanguage="json"
                        value={jsonDocumentBuilderStore.dataString}
                        onChange={(value) => jsonDocumentBuilderStore.setDataString(value ?? '')}
                        theme={useColorMode().colorMode === 'dark' ? 'vs-dark' : 'vs'}
                        options={{
                            minimap: { enabled: false },
                            fontSize: 16,
                            lineNumbersMinChars: 1,
                            scrollBeyondLastLine: false,
                            scrollbar: {
                                alwaysConsumeMouseWheel: false
                            },
                        }}
                    />
                    {jsonDocumentBuilderStore.dataError && (
                        <Text color="red.500" mt={2}>{jsonDocumentBuilderStore.dataError}</Text>
                    )}
                </FormControl>
                {jsonDocumentBuilderStore.createDocumentError && (
                    <InlineError message={jsonDocumentBuilderStore.createDocumentError} />
                )}
                {jsonDocumentBuilderStore.updateDocumentError && (
                    <InlineError message={jsonDocumentBuilderStore.updateDocumentError} />
                )}
                {jsonDocumentBuilderStore.deleteDocumentError && (
                    <InlineError message={jsonDocumentBuilderStore.deleteDocumentError} />
                )}
                <Tooltip
                    isDisabled={!(!jsonDocumentBuilderStore.document.name || jsonDocumentBuilderStore.dataError)}
                    label="You must enter a name and valid JSON to save"
                    fontSize="md"
                >
                    <Button
                        onClick={onSaveDocument}
                        colorScheme="purple"
                        size="lg"
                        disabled={!jsonDocumentBuilderStore.document.name || !!jsonDocumentBuilderStore.dataError}
                        isLoading={jsonDocumentBuilderStore.saving}
                    >Save</Button>
                </Tooltip>
                {jsonDocumentBuilderStore.document.document_id && (
                    <Button
                        onClick={onDeleteOpen}
                        variant="outline"
                        size="lg"
                        isLoading={jsonDocumentBuilderStore.deleting}
                    >Delete Document</Button>
                )}
            </Flex>

            <AlertDialog isOpen={isDeleteOpen} leastDestructiveRef={cancelRef} onClose={onDeleteClose} isCentered>
                <AlertDialogOverlay />
                <AlertDialogContent>
                    <AlertDialogHeader fontSize="lg" fontWeight="bold">Delete Document</AlertDialogHeader>
                    <AlertDialogBody>Are you sure you want to delete this document?</AlertDialogBody>
                    <AlertDialogFooter gap={3}>
                        <Button ref={cancelRef} onClick={onDeleteClose} isDisabled={isDeleting}>Cancel</Button>
                        <Button colorScheme="red" onClick={handleConfirmDelete} isLoading={isDeleting} loadingText="Deleting…">Delete</Button>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
            </Flex>
        </JsonDocumentBuilderStoreContext.Provider>
    );
});

export default JsonDocumentBuilderPage;
