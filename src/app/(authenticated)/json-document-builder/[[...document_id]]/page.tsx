'use client';

import React, { useEffect } from 'react';
import { observer } from 'mobx-react-lite';
import { useRouter } from 'next/navigation';
import { jsonDocumentBuilderStore } from '@/store/JsonDocumentBuilderStore';
import { jsonDocumentsStore } from '@/store/JsonDocumentsStore';
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
} from '@chakra-ui/react';
import { ArrowBackIcon } from '@chakra-ui/icons';
import MonacoEditor from '@monaco-editor/react';
import { useAlert } from '@/app/components/AlertProvider';

type Params = Promise<{ document_id: string[] }>;

interface PageProps {
    params: Params;
}

const JsonDocumentBuilderPage = observer(({ params }: PageProps) => {
    const router = useRouter();
    const { showAlert } = useAlert();

    useEffect(() => {
        jsonDocumentBuilderStore.setShowAlert(showAlert);
        loadDocumentId();
        return () => {
            jsonDocumentBuilderStore.reset();
        }
    }, []);

    const loadDocumentId = async () => {
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
            showAlert({
                title: 'Error',
                message: 'Could not find document',
            })
            router.push('/documents');
        }
    }

    const onSaveDocument = async () => {
        await jsonDocumentBuilderStore.onSaveDocumentClick();
        jsonDocumentsStore.loadDocuments(true);
        window.history.back();
    }

    const onDeleteDocumentClick = async () => {
        showAlert({
            title: 'Delete Document',
            message: 'Are you sure you want to delete this document?',
            actions: [
                { label: 'Cancel', onClick: () => { } },
                {
                    label: 'Delete',
                    onClick: async () => {
                        await jsonDocumentBuilderStore.deleteDocument();
                        jsonDocumentsStore.loadDocuments(true);
                        window.history.back();
                    }
                }
            ]
        })
    }

    return (
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
                        onClick={onDeleteDocumentClick}
                        variant="outline"
                        size="lg"
                        isLoading={jsonDocumentBuilderStore.deleting}
                    >Delete Document</Button>
                )}
            </Flex>
        </Flex>
    );
});

export default JsonDocumentBuilderPage;
