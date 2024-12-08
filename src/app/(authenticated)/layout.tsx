'use client';

import React, { useEffect, useState } from 'react';
import { Flex, Box } from '@chakra-ui/react';
import { useBreakpointValue } from '@chakra-ui/react';
import Header from './components/Header';
import Sidebar from './components/Sidebar';

export default function AuthenticatedLayout({ children }: { children: React.ReactNode }) {
    const [isSidebarOpen, setSidebarOpen] = useState(false);

    // Determine if the sidebar should always be visible based on screen size
    const isWideScreen = useBreakpointValue({ base: false, lg: true });
    useEffect(() => {
        if (isWideScreen) {
            setSidebarOpen(true); // Open sidebar on wide screens
        }
    }, [isWideScreen]);

    // Toggle the sidebar state
    const toggleSidebar = () => setSidebarOpen((prev) => !prev);

    return (
        <Flex height="100vh" flexDirection="column">
            {/* Header */}
            <Header onMenuClick={toggleSidebar} />

            <Flex flex="1" position="relative">
                {/* Sidebar */}
                <Sidebar
                    isMobile={!isWideScreen}
                    isOpen={isSidebarOpen}
                    onClose={() => setSidebarOpen(false)}
                />

                {/* Main Content with click-to-close sidebar */}
                <Box
                    flex="1"
                    p={4}
                    overflowY="auto"
                    bg="gray.50"
                    _dark={{ bg: 'gray.900' }}
                    onClick={() => {
                        if (!isWideScreen && isSidebarOpen) {
                            setSidebarOpen(false); // Close sidebar on content click for mobile
                        }
                    }}
                    style={{ cursor: isSidebarOpen && !isWideScreen ? 'pointer' : 'default' }} // Indicate clickable area
                >
                    {children}
                </Box>
            </Flex>
        </Flex>
    );
}
