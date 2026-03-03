'use client';

import React, { useEffect, useState } from "react";
import {
    Flex, Text, Spinner, Badge, useColorModeValue,
    Box, Collapse,
} from "@chakra-ui/react";
import { ChevronDownIcon } from "@chakra-ui/icons";
import { observer } from "mobx-react-lite";
import { modelsStore } from "@/store/ModelsStore";
import { formatContextWindow } from "@/types/model";

interface ModelSelectorProps {
    value: string | null | undefined;
    onChange: (modelId: string | null) => void;
}

export const ModelSelector = observer(({ value, onChange }: ModelSelectorProps) => {
    const [isOpen, setIsOpen] = useState(false);

    const selectedBg = useColorModeValue("purple.50", "purple.900");
    const selectedBorder = useColorModeValue("purple.500", "purple.300");
    const hoverBg = useColorModeValue("gray.50", "gray.700");
    const cardBg = useColorModeValue("white", "gray.800");
    const cardBorder = useColorModeValue("gray.200", "gray.600");
    const subtextColor = useColorModeValue("gray.500", "gray.400");

    useEffect(() => {
        modelsStore.loadModels();
    }, []);

    if (modelsStore.isLoading) {
        return (
            <Flex align="center" gap={2} mt={2}>
                <Spinner size="sm" />
                <Text fontSize="sm" color="gray.500">Loading models...</Text>
            </Flex>
        );
    }

    const selectedModel = value ? modelsStore.getModelByName(value) : null;
    const selectedLabel = selectedModel ? selectedModel.model : "Default (gpt-4.1)";
    const selectedProviderColor = selectedModel
        ? (selectedModel.model_provider === "anthropic" ? "orange" : "teal")
        : "gray";

    const isSelected = (modelId: string | null) => {
        if (modelId === null) return !value;
        return value === modelId;
    };

    const handleSelect = (modelId: string | null) => {
        onChange(modelId);
        setIsOpen(false);
    };

    return (
        <Flex direction="column" mt={2}>
            {/* Collapsed header showing current selection */}
            <Box
                as="button"
                type="button"
                w="100%"
                p={3}
                borderWidth="2px"
                borderRadius="md"
                borderColor={selectedBorder}
                bg={selectedBg}
                _hover={{ opacity: 0.9 }}
                onClick={() => setIsOpen(!isOpen)}
                textAlign="left"
                transition="all 0.15s"
            >
                <Flex justify="space-between" align="center">
                    <Flex align="center" gap={2}>
                        <Text fontWeight="semibold" fontSize="sm">{selectedLabel}</Text>
                        {selectedModel && (
                            <Badge colorScheme={selectedProviderColor} fontSize="xs" textTransform="capitalize">
                                {selectedModel.model_provider}
                            </Badge>
                        )}
                    </Flex>
                    <ChevronDownIcon
                        boxSize={5}
                        transition="transform 0.2s"
                        transform={isOpen ? "rotate(180deg)" : "rotate(0deg)"}
                    />
                </Flex>
            </Box>

            {/* Expandable model list */}
            <Collapse in={isOpen} animateOpacity>
                <Flex direction="column" gap={2} mt={2}>
                    {/* Default option */}
                    <Box
                        as="button"
                        type="button"
                        w="100%"
                        p={3}
                        borderWidth="2px"
                        borderRadius="md"
                        borderColor={isSelected(null) ? selectedBorder : cardBorder}
                        bg={isSelected(null) ? selectedBg : cardBg}
                        _hover={{ bg: isSelected(null) ? selectedBg : hoverBg }}
                        onClick={() => handleSelect(null)}
                        textAlign="left"
                        transition="all 0.15s"
                    >
                        <Flex direction="column">
                            <Flex align="center" gap={2}>
                                <Text fontWeight="semibold" fontSize="sm">Default</Text>
                                <Badge colorScheme="gray" fontSize="xs">gpt-4.1</Badge>
                            </Flex>
                            <Text fontSize="xs" color={subtextColor} mt={0.5}>
                                Uses the platform default model
                            </Text>
                        </Flex>
                    </Box>

                    {/* Model options */}
                    {modelsStore.models.map((model) => {
                        const providerColor = model.model_provider === "anthropic" ? "orange" : "teal";

                        return (
                            <Box
                                key={model.model}
                                as="button"
                                type="button"
                                w="100%"
                                p={3}
                                borderWidth="2px"
                                borderRadius="md"
                                borderColor={isSelected(model.model) ? selectedBorder : cardBorder}
                                bg={isSelected(model.model) ? selectedBg : cardBg}
                                _hover={{ bg: isSelected(model.model) ? selectedBg : hoverBg }}
                                onClick={() => handleSelect(model.model)}
                                textAlign="left"
                                transition="all 0.15s"
                            >
                                <Flex direction="column" flex="1">
                                    <Flex align="center" gap={2} flexWrap="wrap">
                                        <Text fontWeight="semibold" fontSize="sm">{model.model}</Text>
                                        <Badge colorScheme={providerColor} fontSize="xs" textTransform="capitalize">
                                            {model.model_provider}
                                        </Badge>
                                    </Flex>
                                    <Flex gap={4} mt={1.5} flexWrap="wrap">
                                        <Flex direction="column">
                                            <Text fontSize="xs" color={subtextColor}>Input</Text>
                                            <Text fontSize="xs" fontWeight="medium">${model.input_token_cost.toFixed(2)}/M tokens</Text>
                                        </Flex>
                                        <Flex direction="column">
                                            <Text fontSize="xs" color={subtextColor}>Output</Text>
                                            <Text fontSize="xs" fontWeight="medium">${model.output_token_cost.toFixed(2)}/M tokens</Text>
                                        </Flex>
                                        {model.context_window_size > 0 && (
                                            <Flex direction="column">
                                                <Text fontSize="xs" color={subtextColor}>Context</Text>
                                                <Text fontSize="xs" fontWeight="medium">{formatContextWindow(model.context_window_size)} tokens</Text>
                                            </Flex>
                                        )}
                                    </Flex>
                                </Flex>
                            </Box>
                        );
                    })}
                </Flex>
            </Collapse>
        </Flex>
    );
});
