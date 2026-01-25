import React, { useState } from "react";
import { agentBuilderStore } from "@/store/AgentBuilderStore";
import { Heading, Text, Button, Flex, Select, FormControl, FormLabel, Box } from "@chakra-ui/react";
import { CodeSnippet } from "@/app/components/CodeSnippet";
import { observer } from "mobx-react-lite";

// Common IANA timezone options organized by region
const TIMEZONE_OPTIONS = [
    { label: "UTC", value: "UTC" },
    // Americas
    { label: "US Eastern (New York)", value: "America/New_York" },
    { label: "US Central (Chicago)", value: "America/Chicago" },
    { label: "US Mountain (Denver)", value: "America/Denver" },
    { label: "US Pacific (Los Angeles)", value: "America/Los_Angeles" },
    { label: "US Alaska", value: "America/Anchorage" },
    { label: "US Hawaii", value: "Pacific/Honolulu" },
    { label: "Canada Toronto", value: "America/Toronto" },
    { label: "Canada Vancouver", value: "America/Vancouver" },
    { label: "Mexico City", value: "America/Mexico_City" },
    { label: "São Paulo", value: "America/Sao_Paulo" },
    { label: "Buenos Aires", value: "America/Argentina/Buenos_Aires" },
    // Europe
    { label: "UK (London)", value: "Europe/London" },
    { label: "Central Europe (Paris)", value: "Europe/Paris" },
    { label: "Central Europe (Berlin)", value: "Europe/Berlin" },
    { label: "Eastern Europe (Moscow)", value: "Europe/Moscow" },
    { label: "Amsterdam", value: "Europe/Amsterdam" },
    { label: "Rome", value: "Europe/Rome" },
    { label: "Madrid", value: "Europe/Madrid" },
    // Asia
    { label: "Japan (Tokyo)", value: "Asia/Tokyo" },
    { label: "China (Shanghai)", value: "Asia/Shanghai" },
    { label: "Hong Kong", value: "Asia/Hong_Kong" },
    { label: "Singapore", value: "Asia/Singapore" },
    { label: "India (Kolkata)", value: "Asia/Kolkata" },
    { label: "UAE (Dubai)", value: "Asia/Dubai" },
    { label: "Korea (Seoul)", value: "Asia/Seoul" },
    { label: "Thailand (Bangkok)", value: "Asia/Bangkok" },
    // Oceania
    { label: "Australia Eastern (Sydney)", value: "Australia/Sydney" },
    { label: "Australia Central (Adelaide)", value: "Australia/Adelaide" },
    { label: "Australia Western (Perth)", value: "Australia/Perth" },
    { label: "New Zealand (Auckland)", value: "Pacific/Auckland" },
];

export const UtilityTools = observer(() => {
    const [selectedTimezone, setSelectedTimezone] = useState<string>("America/New_York");

    // Tool IDs
    const getTimeTools = ["get_time"];
    const thinkTools = ["think"];

    // Check if tools are enabled
    const hasGetTime = getTimeTools.some(tool =>
        agentBuilderStore.currentAgent.tools?.some(agentTool => agentTool === tool)
    );

    const hasThink = thinkTools.some(tool =>
        agentBuilderStore.currentAgent.tools?.some(agentTool => agentTool === tool)
    );

    const hasAnyUtilityTools = hasGetTime || hasThink;

    // Toggle functions
    const toggleToolGroup = (tools: string[], isEnabled: boolean) => {
        if (isEnabled) {
            tools.forEach(tool => {
                agentBuilderStore.removeTool({ tool_id: tool, org_id: "default", name: tool });
            });
        } else {
            tools.forEach(tool => {
                agentBuilderStore.addTool({ tool_id: tool, org_id: "default", name: tool });
            });
        }
    };

    const toggleGetTime = () => toggleToolGroup(getTimeTools, hasGetTime);
    const toggleThink = () => toggleToolGroup(thinkTools, hasThink);

    const getExamplePrompt = () => {
        const parts: string[] = [];

        if (hasGetTime) {
            parts.push(`You have access to the get_time tool which retrieves the current date and time. The user is in the ${selectedTimezone} timezone. When checking the time for the user, always use timezone="${selectedTimezone}".`);
        }

        if (hasThink) {
            parts.push(`You have access to the think tool for organizing your reasoning. Use it to break down complex tasks, analyze information, plan action sequences, or work through problems step by step before taking action.`);
        }

        return parts.join("\n\n");
    };

    return (
        <Flex direction="column" gap={4} pb={4}>
            <Flex direction="row" justify="space-between" align="center" flexWrap="wrap" gap={2}>
                <Heading size="md">Utility Tools</Heading>
            </Flex>

            {/* Tool Toggle Buttons */}
            <Flex gap={2} flexWrap="wrap">
                <Button
                    onClick={toggleGetTime}
                    colorScheme={hasGetTime ? "purple" : "gray"}
                    variant={hasGetTime ? "solid" : "outline"}
                    size="sm"
                >
                    {hasGetTime ? "Remove" : "Add"} Get Time
                </Button>
                <Button
                    onClick={toggleThink}
                    colorScheme={hasThink ? "purple" : "gray"}
                    variant={hasThink ? "solid" : "outline"}
                    size="sm"
                >
                    {hasThink ? "Remove" : "Add"} Think
                </Button>
            </Flex>

            <Text fontWeight="bold">Description</Text>
            <Text>
                Utility tools provide general-purpose functionality useful across many agent use cases.
                These tools don&apos;t require any external integrations or API credentials.
            </Text>

            {/* Tool Descriptions */}
            {hasAnyUtilityTools && (
                <>
                    <Text fontWeight="bold">Available Tools</Text>
                    {hasGetTime && (
                        <Box>
                            <Text>
                                <strong>get_time:</strong> Retrieve the current date and time (UTC or specific timezone).
                                Returns formatted date, time, and day of week.
                            </Text>
                        </Box>
                    )}
                    {hasThink && (
                        <Box>
                            <Text>
                                <strong>think:</strong> Organize and articulate reasoning before taking action.
                                Use for breaking down complex tasks, planning steps, or analyzing information.
                            </Text>
                        </Box>
                    )}
                </>
            )}

            {/* Timezone Selection for get_time */}
            {hasGetTime && (
                <FormControl>
                    <FormLabel>User Timezone (for prompt)</FormLabel>
                    <Select
                        value={selectedTimezone}
                        onChange={(e) => setSelectedTimezone(e.target.value)}
                    >
                        {TIMEZONE_OPTIONS.map((tz) => (
                            <option key={tz.value} value={tz.value}>
                                {tz.label} ({tz.value})
                            </option>
                        ))}
                    </Select>
                </FormControl>
            )}

            {/* Example Prompt */}
            {hasAnyUtilityTools && (
                <>
                    <Text fontWeight="bold">Example Prompt Addition</Text>
                    <Text fontSize="sm">
                        Add this to your agent prompt to help the agent use the utility tools effectively:
                    </Text>
                    <CodeSnippet language="text" code={getExamplePrompt()} />
                </>
            )}
        </Flex>
    );
});

