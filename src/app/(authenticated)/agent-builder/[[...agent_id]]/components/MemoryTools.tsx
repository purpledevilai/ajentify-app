import React, { useEffect, useState } from "react";
import { agentBuilderStore } from "@/store/AgentBuilderStore";
import { Heading, Text, Button, Flex, Input, Select, FormControl, FormLabel, useToast } from "@chakra-ui/react";
import { CodeSnippet } from "@/app/components/CodeSnippet";
import { observer } from "mobx-react-lite";
import { getJsonDocuments } from "@/api/jsondocument/getJsonDocuments";
import { createJsonDocument } from "@/api/jsondocument/createJsonDocument";
import { JsonDocument } from "@/types/jsondocument";

export const MemoryTools = observer(() => {
    const [documents, setDocuments] = useState<JsonDocument[]>([]);
    const [selectedDocumentId, setSelectedDocumentId] = useState<string>("");
    const [newDocumentName, setNewDocumentName] = useState<string>("");
    const [isCreating, setIsCreating] = useState<boolean>(false);
    const [isLoading, setIsLoading] = useState<boolean>(true);
    const toast = useToast();

    const readMemoryTools = ["read_memory", "view_memory_shape"];
    const writeMemoryTools = ["append_memory", "delete_memory", "write_memory"];

    const hasReadMemory = readMemoryTools.some(tool =>
        agentBuilderStore.currentAgent.tools?.some(agentTool => agentTool === tool)
    );

    const hasWriteMemory = writeMemoryTools.some(tool =>
        agentBuilderStore.currentAgent.tools?.some(agentTool => agentTool === tool)
    );

    useEffect(() => {
        loadDocuments();
    }, []);

    const loadDocuments = async () => {
        try {
            setIsLoading(true);
            const docs = await getJsonDocuments();
            setDocuments(docs);
            if (docs.length > 0 && !selectedDocumentId) {
                setSelectedDocumentId(docs[0].document_id);
            }
        } catch (error) {
            console.log(error)
            toast({
                title: "Error",
                description: "Failed to load memory documents",
                status: "error",
                duration: 3000,
                isClosable: true,
            });
        } finally {
            setIsLoading(false);
        }
    };

    const createNewDocument = async () => {
        if (!newDocumentName.trim()) {
            toast({
                title: "Error",
                description: "Please enter a document name",
                status: "error",
                duration: 3000,
                isClosable: true,
            });
            return;
        }

        try {
            setIsCreating(true);
            const newDoc = await createJsonDocument({
                name: newDocumentName,
                data: {}
            });
            setDocuments([...documents, newDoc]);
            setSelectedDocumentId(newDoc.document_id);
            setNewDocumentName("");
            toast({
                title: "Success",
                description: "Memory document created successfully",
                status: "success",
                duration: 3000,
                isClosable: true,
            });
        } catch (error) {
            console.log(error)
            toast({
                title: "Error",
                description: "Failed to create memory document",
                status: "error",
                duration: 3000,
                isClosable: true,
            });
        } finally {
            setIsCreating(false);
        }
    };

    const toggleReadMemory = () => {
        if (hasReadMemory) {
            readMemoryTools.forEach(tool => {
                agentBuilderStore.removeTool({ tool_id: tool, org_id: "default", name: tool });
            });
        } else {
            readMemoryTools.forEach(tool => {
                agentBuilderStore.addTool({ tool_id: tool, org_id: "default", name: tool });
            });
        }
    };

    const toggleWriteMemory = () => {
        if (hasWriteMemory) {
            writeMemoryTools.forEach(tool => {
                agentBuilderStore.removeTool({ tool_id: tool, org_id: "default", name: tool });
            });
        } else {
            writeMemoryTools.forEach(tool => {
                agentBuilderStore.addTool({ tool_id: tool, org_id: "default", name: tool });
            });
        }
    };

    const selectedDocument = documents.find(doc => doc.document_id === selectedDocumentId);

    const getExamplePrompt = () => {
        if (!selectedDocument) return "";

        return `You have access to a persistent memory document with ID "${selectedDocument.document_id}" named "${selectedDocument.name}". Use this to remember information between conversations. ${hasReadMemory ? "You can read from this memory using read_memory and view_memory_shape tools. " : ""}${hasWriteMemory ? "You can write to this memory using append_memory, delete_memory, and write_memory tools." : ""}

When referencing the memory document, always use the ID: ${selectedDocument.document_id}`;
    };

    return (
        <Flex direction="column" gap={4} pb={4}>
            <Flex direction="row" justify="space-between" align="center">
                <Heading size="md">Memory Tools</Heading>
                <Flex gap={2}>
                    <Button
                        onClick={toggleReadMemory}
                        colorScheme={hasReadMemory ? "purple" : "gray"}
                        variant={hasReadMemory ? "solid" : "outline"}
                        size="sm"
                    >
                        {hasReadMemory ? "Remove" : "Add"} Read Memory
                    </Button>
                    <Button
                        onClick={toggleWriteMemory}
                        colorScheme={hasWriteMemory ? "purple" : "gray"}
                        variant={hasWriteMemory ? "solid" : "outline"}
                        size="sm"
                    >
                        {hasWriteMemory ? "Remove" : "Add"} Write Memory
                    </Button>
                </Flex>
            </Flex>

            <Text fontWeight="bold">Description</Text>
            <Text>
                Memory Tools allow your agent to persist information between conversations using JSON documents.
                The agent can read from and write to these documents to maintain context, remember user preferences,
                or store any data that should survive beyond a single chat session.
            </Text>

            <Text fontWeight="bold">Memory Document Setup</Text>

            {/* Document Selection */}
            {!isLoading && documents.length > 0 && (
                <FormControl>
                    <FormLabel>Select Memory Document</FormLabel>
                    <Select
                        value={selectedDocumentId || ""}
                        onChange={(e) => setSelectedDocumentId(e.target.value)}
                        placeholder="Choose a memory document"
                    >
                        {documents.map(doc => (
                            <option key={doc.document_id} value={doc.document_id}>
                                {doc.name} ({doc.document_id})
                            </option>
                        ))}
                    </Select>
                </FormControl>
            )}

            {/* Create New Document */}
            <FormControl>
                <FormLabel>Create New Memory Document</FormLabel>
                <Flex gap={2}>
                    <Input
                        placeholder="Enter document name"
                        value={newDocumentName || ""}
                        onChange={(e) => setNewDocumentName(e.target.value)}
                    />
                    <Button
                        onClick={createNewDocument}
                        isLoading={isCreating}
                        colorScheme="blue"
                    >
                        Create
                    </Button>
                </Flex>
            </FormControl>

            {/* Memory Tools Information */}
            {(hasReadMemory || hasWriteMemory) && (
                <>
                    <Text fontWeight="bold">Available Tools</Text>
                    {hasReadMemory && (
                        <Text>
                            <strong>Read Memory:</strong> read_memory, view_memory_shape
                        </Text>
                    )}
                    {hasWriteMemory && (
                        <Text>
                            <strong>Write Memory:</strong> append_memory,
                            delete_memory, write_memory
                        </Text>
                    )}
                </>
            )}

            {/* Example Prompt */}
            {selectedDocument && (hasReadMemory || hasWriteMemory) && (
                <>
                    <Text fontWeight="bold">Example Prompt Addition</Text>
                    <Text fontSize="sm">
                        Add this to your agent prompt to enable memory functionality:
                    </Text>
                    <CodeSnippet language="text" code={getExamplePrompt()} />
                </>
            )}

        </Flex>
    );
});