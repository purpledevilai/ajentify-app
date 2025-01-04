'use client';

import React, { useEffect, useState } from 'react';
import { observer } from 'mobx-react-lite';
import { Flex, Box } from '@chakra-ui/react';
import { useBreakpointValue } from '@chakra-ui/react';
import Header from './components/Header';
import Sidebar from './components/Sidebar';
import { useRouter } from 'next/navigation';
import { authStore } from '@/store/AuthStore';
import { reaction } from 'mobx';

const AuthenticatedLayout = observer(({ children }: { children: React.ReactNode }) => {
    const router = useRouter();
    const [isSidebarOpen, setSidebarOpen] = useState(false);

    useEffect(() => {
        const disposer = reaction(
          () => authStore.signedIn,
          (signedIn) => {
            if (!signedIn) {
              router.push('/signin');
            }
          }
        );
    
        return () => {
          disposer();
        };
      }, [router]);

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
                    onClose={() => {
                        if (!isWideScreen) {
                            setSidebarOpen(false); // Close sidebar on mobile
                        }
                    }}
                />

                {/* Main Content with click-to-close sidebar */}
                <Box
                    flex="1"
                    p={4}
                    overflowY="hidden"
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
});

export default AuthenticatedLayout;
