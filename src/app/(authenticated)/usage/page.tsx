'use client';

import React, { useEffect, useState, useCallback } from 'react';
import { observer } from 'mobx-react-lite';
import {
    Box,
    Flex,
    Heading,
    Text,
    Select,
    Button,
    Spinner,
    Table,
    Thead,
    Tbody,
    Tr,
    Th,
    Td,
    Tooltip,
    useColorModeValue,
} from '@chakra-ui/react';
import { authStore } from '@/store/AuthStore';
import { getUsage, UsageResponse } from '@/api/usage/getUsage';

const MONTHS = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December',
];

function getMonthDateRange(year: number, month: number) {
    const start = new Date(year, month, 1);
    const end = new Date(year, month + 1, 0);
    const fmt = (d: Date) =>
        `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
    return { start_date: fmt(start), end_date: fmt(end) };
}

function formatNumber(n: number): string {
    return n.toLocaleString();
}

const UsagePage = observer(() => {
    const now = new Date();
    const [selectedMonth, setSelectedMonth] = useState(now.getMonth());
    const [selectedYear, setSelectedYear] = useState(now.getFullYear());
    const [usage, setUsage] = useState<UsageResponse | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const barBg = useColorModeValue('brand.500', 'brand.300');
    const barHoverBg = useColorModeValue('brand.600', 'brand.400');
    const cardBg = useColorModeValue('white', 'gray.800');
    const subtleBg = useColorModeValue('gray.50', 'gray.700');

    const fetchUsage = useCallback(async (year: number, month: number) => {
        if (!authStore.signedIn) return;
        setLoading(true);
        setError(null);
        try {
            const { start_date, end_date } = getMonthDateRange(year, month);
            const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
            const data = await getUsage({ start_date, end_date, timezone });
            setUsage(data);
        } catch (err) {
            setError((err as Error).message);
            setUsage(null);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchUsage(selectedYear, selectedMonth);
    }, [selectedYear, selectedMonth, fetchUsage]);

    const handleCurrentMonth = () => {
        const today = new Date();
        setSelectedMonth(today.getMonth());
        setSelectedYear(today.getFullYear());
    };

    const isCurrentMonth =
        selectedMonth === now.getMonth() && selectedYear === now.getFullYear();

    const maxTokens = usage
        ? Math.max(...usage.daily_usage.map((d) => d.total_tokens), 1)
        : 1;

    const yearOptions: number[] = [];
    for (let y = now.getFullYear(); y >= now.getFullYear() - 3; y--) {
        yearOptions.push(y);
    }

    return (
        <Box p={6} maxW="1100px" mx="auto" overflowY="auto" h="100%">
            <Heading as="h1" size="xl" mb={6}>
                Usage
            </Heading>

            {/* Controls */}
            <Flex gap={3} mb={6} align="center" wrap="wrap">
                <Select
                    w="180px"
                    value={selectedMonth}
                    onChange={(e) => setSelectedMonth(Number(e.target.value))}
                >
                    {MONTHS.map((m, i) => (
                        <option key={i} value={i}>
                            {m}
                        </option>
                    ))}
                </Select>

                <Select
                    w="120px"
                    value={selectedYear}
                    onChange={(e) => setSelectedYear(Number(e.target.value))}
                >
                    {yearOptions.map((y) => (
                        <option key={y} value={y}>
                            {y}
                        </option>
                    ))}
                </Select>

                <Button
                    variant="outline"
                    colorScheme="brand"
                    onClick={handleCurrentMonth}
                    isDisabled={isCurrentMonth}
                    size="md"
                >
                    Current Month
                </Button>
            </Flex>

            {/* Loading / Error */}
            {loading && (
                <Flex justify="center" py={12}>
                    <Spinner size="lg" />
                </Flex>
            )}

            {error && (
                <Box
                    p={4}
                    mb={6}
                    bg="red.50"
                    _dark={{ bg: 'red.900' }}
                    borderRadius="md"
                >
                    <Text color="red.500">{error}</Text>
                </Box>
            )}

            {!loading && usage && (
                <>
                    {/* Total Cost */}
                    <Box
                        bg={cardBg}
                        p={5}
                        borderRadius="lg"
                        shadow="sm"
                        mb={6}
                    >
                        <Text fontSize="sm" color="gray.500" mb={1}>
                            Total Cost &mdash; {MONTHS[selectedMonth]} {selectedYear}
                        </Text>
                        <Text fontSize="3xl" fontWeight="bold">
                            {usage.total_cost}
                        </Text>
                    </Box>

                    {/* Daily Usage Bar Chart */}
                    <Box
                        bg={cardBg}
                        p={5}
                        borderRadius="lg"
                        shadow="sm"
                        mb={6}
                    >
                        <Text fontWeight="semibold" mb={4}>
                            Daily Token Usage
                        </Text>
                        <Box overflowX="auto">
                            <Flex
                                align="flex-end"
                                gap="2px"
                                h="220px"
                                minW={`${usage.daily_usage.length * 22}px`}
                            >
                                {usage.daily_usage.map((day) => {
                                    const heightPct =
                                        maxTokens > 0
                                            ? (day.total_tokens / maxTokens) * 100
                                            : 0;
                                    const date = new Date(day.date + 'T00:00:00');
                                    const dayLabel = date.getDate();

                                    return (
                                        <Tooltip
                                            key={day.date}
                                            label={`${day.date}: ${formatNumber(day.total_tokens)} tokens`}
                                            placement="top"
                                            hasArrow
                                        >
                                            <Flex
                                                direction="column"
                                                align="center"
                                                flex="1"
                                                minW="18px"
                                                h="100%"
                                                justify="flex-end"
                                            >
                                                <Box
                                                    bg={barBg}
                                                    w="100%"
                                                    borderRadius="sm"
                                                    h={`${Math.max(heightPct, day.total_tokens > 0 ? 2 : 0)}%`}
                                                    transition="height 0.3s ease"
                                                    _hover={{ bg: barHoverBg }}
                                                    cursor="pointer"
                                                />
                                                <Text
                                                    fontSize="2xs"
                                                    color="gray.500"
                                                    mt={1}
                                                    userSelect="none"
                                                >
                                                    {dayLabel}
                                                </Text>
                                            </Flex>
                                        </Tooltip>
                                    );
                                })}
                            </Flex>
                        </Box>
                    </Box>

                    {/* Model Cost Breakdown */}
                    <Box
                        bg={cardBg}
                        p={5}
                        borderRadius="lg"
                        shadow="sm"
                        mb={6}
                    >
                        <Text fontWeight="semibold" mb={4}>
                            Cost by Model
                        </Text>
                        {usage.model_costs.length === 0 ? (
                            <Text color="gray.500">No model usage for this period.</Text>
                        ) : (
                            <Box overflowX="auto">
                                <Table variant="simple" size="sm">
                                    <Thead>
                                        <Tr>
                                            <Th>Model</Th>
                                            <Th isNumeric>Input Tokens</Th>
                                            <Th isNumeric>Output Tokens</Th>
                                            <Th isNumeric>Cost</Th>
                                        </Tr>
                                    </Thead>
                                    <Tbody>
                                        {usage.model_costs.map((mc) => (
                                            <Tr key={mc.model} _hover={{ bg: subtleBg }}>
                                                <Td fontFamily="mono" fontSize="sm">
                                                    {mc.model}
                                                </Td>
                                                <Td isNumeric>{formatNumber(mc.input_tokens)}</Td>
                                                <Td isNumeric>{formatNumber(mc.output_tokens)}</Td>
                                                <Td isNumeric fontWeight="semibold">
                                                    {mc.cost}
                                                </Td>
                                            </Tr>
                                        ))}
                                    </Tbody>
                                </Table>
                            </Box>
                        )}
                    </Box>
                </>
            )}

            {!loading && !usage && !error && (
                <Flex justify="center" py={12}>
                    <Text color="gray.500">Select a month to view usage data.</Text>
                </Flex>
            )}
        </Box>
    );
});

export default UsagePage;
