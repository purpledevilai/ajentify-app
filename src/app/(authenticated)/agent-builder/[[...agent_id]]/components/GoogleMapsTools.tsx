import React from "react";
import { agentBuilderStore } from "@/store/AgentBuilderStore";
import { Heading, Text, Button, Flex, Box } from "@chakra-ui/react";
import { CodeSnippet } from "@/app/components/CodeSnippet";
import { observer } from "mobx-react-lite";

export const GoogleMapsTools = observer(() => {
    // Tool groupings
    const searchTools = ["search_places", "get_place_details"];
    const routeTools = ["compute_routes"];

    // Check if tool groups are enabled
    const hasSearch = searchTools.some(tool =>
        agentBuilderStore.currentAgent.tools?.some(agentTool => agentTool === tool)
    );

    const hasRoutes = routeTools.some(tool =>
        agentBuilderStore.currentAgent.tools?.some(agentTool => agentTool === tool)
    );

    const hasAnyMapsTools = hasSearch || hasRoutes;

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

    const toggleSearch = () => toggleToolGroup(searchTools, hasSearch);
    const toggleRoutes = () => toggleToolGroup(routeTools, hasRoutes);

    const getExamplePrompt = () => {
        const parts: string[] = [];

        if (hasSearch) {
            parts.push(`You have access to Google Maps place search tools. You can search for places using natural language queries (restaurants, coffee shops, attractions, etc.), get detailed information about specific places including ratings, reviews, hours, and contact info.`);
        }

        if (hasRoutes) {
            parts.push(`You can compute routes between locations with travel time estimates. Support driving, walking, cycling, and public transit. When calculating routes for US locations, use IMPERIAL units (miles); for other countries use METRIC (kilometers).`);
        }

        return parts.join("\n\n");
    };

    return (
        <Flex direction="column" gap={4} pb={4}>
            <Flex direction="row" justify="space-between" align="center" flexWrap="wrap" gap={2}>
                <Heading size="md">Google Maps Tools</Heading>
            </Flex>

            {/* Tool Toggle Buttons */}
            <Flex gap={2} flexWrap="wrap">
                <Button
                    onClick={toggleSearch}
                    colorScheme={hasSearch ? "purple" : "gray"}
                    variant={hasSearch ? "solid" : "outline"}
                    size="sm"
                >
                    {hasSearch ? "Remove" : "Add"} Place Search
                </Button>
                <Button
                    onClick={toggleRoutes}
                    colorScheme={hasRoutes ? "purple" : "gray"}
                    variant={hasRoutes ? "solid" : "outline"}
                    size="sm"
                >
                    {hasRoutes ? "Remove" : "Add"} Routes
                </Button>
            </Flex>

            <Text fontWeight="bold">Description</Text>
            <Text>
                Google Maps tools allow your agent to search for places, get location details, 
                and compute routes between locations. Perfect for trip planning, finding restaurants, 
                getting travel time estimates, and discovering points of interest.
            </Text>

            {/* Tool Descriptions */}
            {hasAnyMapsTools && (
                <>
                    <Text fontWeight="bold">Available Tools</Text>
                    {hasSearch && (
                        <Box>
                            <Text>
                                <strong>search_places:</strong> Search for places using natural language queries 
                                (e.g., &quot;Italian restaurants in Austin&quot;, &quot;coffee shops near me&quot;). 
                                Returns name, address, rating, price level, and hours.
                            </Text>
                            <Text mt={1}>
                                <strong>get_place_details:</strong> Get comprehensive details about a specific place 
                                including reviews, full hours, phone, website, and more.
                            </Text>
                        </Box>
                    )}
                    {hasRoutes && (
                        <Box>
                            <Text>
                                <strong>compute_routes:</strong> Calculate routes between locations with distance 
                                and travel time. Supports driving, walking, cycling, and transit. 
                                Can include waypoints and optimize stop order.
                            </Text>
                        </Box>
                    )}
                </>
            )}

            {/* Example Prompt */}
            {hasAnyMapsTools && (
                <>
                    <Text fontWeight="bold">Example Prompt Addition</Text>
                    <Text fontSize="sm">
                        Add this to your agent prompt to help the agent use Google Maps tools effectively:
                    </Text>
                    <CodeSnippet language="text" code={getExamplePrompt()} />
                </>
            )}
        </Flex>
    );
});

