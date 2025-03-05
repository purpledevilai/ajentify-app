'use client';

import React, { useEffect, useRef } from "react";
import { useNavigationGuard } from "next-navigation-guard";
import {
    Flex, Text, FormControl, Heading, IconButton, Input, Switch, Textarea, Button, Tooltip,
    useDisclosure, Modal, ModalBody, ModalCloseButton, ModalContent, ModalHeader, ModalOverlay,
    useColorMode,
    useClipboard,
    FormLabel,
    Select,
    Divider
} from "@chakra-ui/react";
import { ArrowBackIcon, CheckIcon, CopyIcon } from "@chakra-ui/icons";
import ChatBox, { defaultChatBoxStyle, defaultDarkChatBoxStyle } from "@/app/components/chatbox/ChatBox";
import { FormLabelToolTip } from "@/app/components/FormLableToolTip";
import { agentBuilderStore } from "@/store/AgentBuilderStore";
import { agentsStore } from "@/store/AgentsStore";
import { ContentOrSpinner } from "@/app/components/ContentOrSpinner";
import { useAlert } from "@/app/components/AlertProvider";
import { ChatEvent } from "@/types/chatresponse";
import { observer } from "mobx-react-lite";
import { AgentToolInstance } from "@/types/agent";
import { toolBuilderStore } from "@/store/ToolBuilderStore";
import { toolsStore } from "@/store/ToolsStore";
import { Parameter } from "./components/Parameter";

type Params = Promise<{ tool_id: string[] }>;

interface ToolBuilderPageProps {
    params: Params;
}

const ToolBuilderPage = observer(({ params }: ToolBuilderPageProps) => {

    // Nav Guard to detect page navigation - Really dump NextJS limitiation
    const navGuard = useNavigationGuard({});
    const isShowingNavAlert = useRef(false);

    const { showAlert } = useAlert();

    useEffect(() => {
        setShowAlertOnStore();
        loadToolId();

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

    // Detect page navigation
    useEffect(() => {
        if (navGuard.active && !isShowingNavAlert.current) {
            isShowingNavAlert.current = true;
            const stayOnPage = () => {
                isShowingNavAlert.current = false;
                navGuard.reject();
            }
            if (false) {
                // Unsaved changes alert
                showAlert({
                    title: "Unsaved Changes",
                    message: "You have unsaved changes. Are you sure you want to leave?",
                    actions: [
                        { label: "Cancel", onClick: stayOnPage },
                        { label: "Leave", onClick: () => navGuard.accept() }
                    ]
                })
            } else {
                navGuard.accept();
            }
        }
    }, [navGuard, showAlert]);


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
                <Flex direction="column" w="100%" gap={12}>
                    <Heading size="md">Parameters</Heading>
                    {toolBuilderStore.tool.parameters.map((param: any, index: number) => (
                        <div key={index}>
                            <Parameter indexArray={[index]} param={param} />
                        </div>
                    ))}
                </Flex>

                {/* Add Parameter Button */}
                <Button
                    onClick={() => toolBuilderStore.addParameter([])}
                    colorScheme="purple"
                    size="lg"
                >Add Parameter</Button>

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
