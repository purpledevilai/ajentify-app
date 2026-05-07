'use client';

import React, { useEffect, useState } from 'react';
import { observer } from 'mobx-react-lite';
import { Flex, Box, useBreakpointValue } from '@chakra-ui/react';
import Header from './components/Header';
import Sidebar from './components/Sidebar';
import { useRouter } from 'next/navigation';
import { authStore } from '@/store/AuthStore';
import { reaction } from 'mobx';
import AuthenticatedProviders from './providers';

const AuthenticatedLayoutBody = observer(({ children }: { children: React.ReactNode }) => {
    const router = useRouter();
    const [isSidebarOpen, setSidebarOpen] = useState(false);

    const routeBasedOnAuth = (isSignedIn: boolean) => {
        if (!isSignedIn) {
            router.push('/signin');
            return;
        }
        if (!authStore.user) {
            void authStore.loadUser();
        }
    }

    useEffect(() => {
        const disposer = reaction(
            () => authStore.signedIn,
            (isSignedIn) => {
                routeBasedOnAuth(isSignedIn);
            }
        );

        routeBasedOnAuth(authStore.signedIn);

        return () => {
            disposer();
        };
    });

    const isWideScreen = useBreakpointValue({ base: false, lg: true });
    useEffect(() => {
        if (isWideScreen) {
            setSidebarOpen(true);
        }
    }, [isWideScreen]);

    const toggleSidebar = () => setSidebarOpen((prev) => !prev);

    return (
        <Flex height="100vh" flexDirection="column">
            <Header onMenuClick={toggleSidebar} />

            <Flex flex="1" position="relative">
                <Sidebar
                    isMobile={!isWideScreen}
                    isOpen={isSidebarOpen}
                    onClose={() => {
                        if (!isWideScreen) {
                            setSidebarOpen(false);
                        }
                    }}
                />

                <Box
                    flex="1"
                    p={4}
                    overflowY="hidden"
                    bg="gray.50"
                    _dark={{ bg: 'gray.900' }}
                    onClick={() => {
                        if (!isWideScreen && isSidebarOpen) {
                            setSidebarOpen(false);
                        }
                    }}
                    style={{ cursor: isSidebarOpen && !isWideScreen ? 'pointer' : 'default' }}
                >
                    {children}
                </Box>
            </Flex>
        </Flex>
    );
});

export default function AuthenticatedLayout({ children }: { children: React.ReactNode }) {
    return (
        <AuthenticatedProviders>
            <AuthenticatedLayoutBody>{children}</AuthenticatedLayoutBody>
        </AuthenticatedProviders>
    );
}
