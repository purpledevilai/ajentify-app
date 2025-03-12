'use client';

import React, { useEffect } from "react";
import {
    Flex, FormControl, Heading, IconButton, Input, Button, Tooltip,
    useColorMode
} from "@chakra-ui/react";
import { ArrowBackIcon } from "@chakra-ui/icons";
import { FormLabelToolTip } from "@/app/components/FormLableToolTip";
import { useAlert } from "@/app/components/AlertProvider";
import { observer } from "mobx-react-lite";
import { toolBuilderStore } from "@/store/ToolBuilderStore";
import { toolsStore } from "@/store/ToolsStore";
import { ParameterView } from "./components/Parameter";
import MonacoEditor, { Monaco } from "@monaco-editor/react";
import type monaco from 'monaco-editor';
import { TestInputView } from "./components/TestInput";
import { TestInput } from "@/types/tools";
import { Parameter } from "@/types/parameterdefinition";

type Params = Promise<{ tool_id: string[] }>;

interface ToolBuilderPageProps {
    params: Params;
}

const ToolBuilderPage = observer(({ params }: ToolBuilderPageProps) => {

    const { showAlert } = useAlert();

    useEffect(() => {
        setShowAlertOnStore();
        loadToolId(); // Load tool id from URL

        return () => {
            toolBuilderStore.reset();
        }
    }, []);

    const setShowAlertOnStore = () => {
        toolBuilderStore.setShowAlert(showAlert);
    }

    const loadToolId = async () => {
        const paramArray = (await params).tool_id ?? undefined;
        const tool_id = paramArray ? paramArray[0] : undefined;
        if (tool_id) {
            if (toolBuilderStore.tool['tool_id'] !== tool_id) {
                toolBuilderStore.setToolWithId(tool_id);
            }
        }
    }

    const onSaveTool = async () => {
        await toolBuilderStore.saveTool();
        toolsStore.loadTools(true);
        // Navigate back
        window.history.back();
    }

    const onDeleteToolClick = async () => {
        showAlert({
            title: "Delete Tool",
            message: "Are you sure you want to delete this tool?",
            actions: [
                { label: "Cancel", onClick: () => { } },
                {
                    label: "Delete", onClick: async () => {
                        await toolBuilderStore.deleteTool();
                        toolsStore.loadTools(true);
                        // Navigate back
                        window.history.back();
                    }
                }
            ]
        })
    }

    // Lock the first line using decorations
    const handleEditorDidMount = (editor: monaco.editor.IStandaloneCodeEditor, monaco: Monaco) => {

        // Set decorations to make first line read-only
        editor.createDecorationsCollection([
            {
                range: new monaco.Range(1, 1, 1, toolBuilderStore.functionDeclaration.length + 1),
                options: {
                    inlineClassName: "readonly-line", // Optional for styling
                },
            },
        ]);

        // Prevent cursor from entering the first line
        editor.onDidChangeCursorPosition((event: { position: { lineNumber: number; }; }) => {
            if (event.position.lineNumber === 1) {
                editor.setPosition({ lineNumber: 2, column: 1 });
            }
        });
    };

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    function handleEditorChange(value: string | undefined, event: monaco.editor.IModelContentChangedEvent) {
        toolBuilderStore.setCode(value ?? '');
    }


    return (
        <Flex p={4} direction="column" alignItems="center" h="100%" w="100%">
            {/* Header Section */}
            <Flex direction="row" w="100%" mb={8} gap={4} align="center">
                <IconButton
                    aria-label="Back"
                    icon={<ArrowBackIcon />}
                    variant="ghost"
                    color="inherit"
                    _hover={{ bg: 'gray.200', _dark: { bg: 'gray.700' } }}
                    onClick={() => window.history.back()}
                />
                <Heading flex="1">Tool Builder</Heading>
            </Flex>

            {/* Tool Form */}
            <Flex direction="column" w="100%" h="100%" maxW={800} gap={8}>
                {/* Tool Name */}
                <FormControl>
                    <FormLabelToolTip
                        label="Tool Name"
                        tooltip="What you would like to call this tool"
                    />
                    <Input
                        mt={2}
                        placeholder="Get Weather"
                        value={toolBuilderStore.tool['name']}
                        onChange={(e) => toolBuilderStore.setName(e.target.value)}
                    />
                </FormControl>

                {/* Agent Description */}
                <FormControl>
                    <FormLabelToolTip
                        label="Tool Description"
                        tooltip="Describe what this tool does. This is used in the prompt to the model."
                    />
                    <Input
                        mt={2}
                        placeholder="Get the current weather in a location"
                        value={toolBuilderStore.tool.description}
                        onChange={(e) => toolBuilderStore.setDescription(e.target.value)}
                    />
                </FormControl>

                {/* Parameters */}
                <Flex direction="column" w="100%" gap={6}>
                    <Heading size="md">Parameters</Heading>
                    {toolBuilderStore.parameters.map((param: Parameter, index: number) => (
                        <div key={index}>
                            <ParameterView indexArray={[index]} param={param} />
                        </div>
                    ))}
                </Flex>

                {/* Add Parameter Button */}
                <Button
                    onClick={() => toolBuilderStore.addParameter([])}
                    colorScheme="purple"
                    size="lg"
                    variant={'outline'}
                >Add Parameter</Button>

                {/* Code editor */}
                <Heading size="md">Code</Heading>
                <MonacoEditor
                    height="70vh"
                    defaultLanguage="python"
                    value={toolBuilderStore.tool.code}
                    onChange={handleEditorChange}
                    onMount={handleEditorDidMount}
                    theme={useColorMode().colorMode === 'dark' ? 'vs-dark' : 'vs'}
                    options={{
                        minimap: { enabled: false },
                        fontSize: 16,
                        lineNumbersMinChars: 1,
                        wordWrap: "on",
                        scrollBeyondLastLine: false,
                        scrollbar: {
                            alwaysConsumeMouseWheel: false
                        },
                    }}
                />

                {/* Test Input */}
                <Flex direction="column" w="100%" gap={6}>
                    <Heading size="md">Test parameters</Heading>
                    {toolBuilderStore.testInputs.map((testInput: TestInput, index: number) => (
                        <div key={index}>
                            <TestInputView indexArray={[index]} testInput={testInput} />
                        </div>
                    ))}
                </Flex>

                {/* Test Input Button */}
                <Button
                    onClick={() => toolBuilderStore.executeTestInput()}
                    colorScheme="purple"
                    size="lg"
                    variant={'outline'}
                    isLoading={toolBuilderStore.toolExecuting}
                >Test</Button>

                {/* Save Button */}
                <Tooltip
                    isDisabled={!(!toolBuilderStore.tool.name || !toolBuilderStore.tool.description)}
                    label="You must enter a name and description to save"
                    fontSize="md"
                >
                    <Button
                        onClick={onSaveTool}
                        colorScheme="purple"
                        size="lg"
                        disabled={!toolBuilderStore.tool.name || !toolBuilderStore.tool.description}
                        isLoading={toolBuilderStore.toolSaving || toolsStore.toolsLoading}
                    >Save</Button>
                </Tooltip>

                {/* Delete Button */}
                {false && (
                    <Button
                        onClick={onDeleteToolClick}
                        variant="outline"
                        size="lg"
                        isLoading={toolBuilderStore.toolDeleting}
                    >Delete Tool</Button>
                )}
            </Flex>

        </Flex>
    );
});

export default ToolBuilderPage;
