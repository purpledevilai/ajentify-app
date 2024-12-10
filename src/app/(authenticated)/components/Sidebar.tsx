'use client';

import React, { useEffect, useState } from 'react';
import {
    Box,
    Flex,
    VStack,
    Link,
    Text,
    Divider,
    Avatar,
    Menu,
    MenuButton,
    MenuList,
    MenuItem,
    MenuDivider,
    useColorModeValue,
    Spinner,
} from '@chakra-ui/react';
import { motion } from 'framer-motion';
import { AiFillHome } from 'react-icons/ai'; // Home icon
import { BiDotsVerticalRounded } from 'react-icons/bi'; // More vertical icon
import { ChevronDownIcon, ChevronUpIcon } from '@chakra-ui/icons';
import { useRouter } from 'next/navigation';
import { usePathname } from 'next/navigation';
import { authStore } from '@/store/AuthStore';
import { observer } from 'mobx-react-lite';

interface SidebarProps {
    isMobile: boolean;
    isOpen: boolean;
    onClose?: () => void;
}

const Sidebar = observer(({ isMobile, isOpen, onClose }: SidebarProps) => {
    const router = useRouter();
    const pathname = usePathname();
    const [orgMenuOpen, setOrgMenuOpen] = useState(false);

    // Tabs for the navigation
    const tabs = [
        { icon: AiFillHome, title: 'Home', route: '/home' },
        { icon: ChevronUpIcon, title: 'Create Agent', route: '/create-agent' }, // Placeholder icon for example
    ];

    useEffect(() => {
        authStore.loadUser();
    }, []);

    const user = authStore.user;
    const userLoading = authStore.userLoading;

    return (
        <motion.div
            initial={{ x: isMobile ? '-100%' : 0 }}
            animate={{ x: isOpen ? 0 : '-100%' }}
            exit={{ x: '-100%' }}
            transition={{ duration: 0.3 }}
            style={{
                position: isMobile ? 'absolute' : 'relative',
                zIndex: isMobile ? 20 : 'auto',
                height: '100%',
                width: '250px',
            }}
        >
            <Box as="nav" bg="gray.100" _dark={{ bg: 'gray.800' }} height="100%" shadow="md" p={4} display="flex" flexDirection="column">
                {/* Organization Selector */}
                <Box mb={4}>
                    {userLoading ? (
                        <Flex justify="center" align="center" height="40px">
                            <Spinner size="sm" />
                        </Flex>
                    ) : (
                        <Menu isOpen={orgMenuOpen} onClose={() => setOrgMenuOpen(false)}>
                            <MenuButton
                                width="100%" // Ensures the button spans the full width
                                p={2}
                                _hover={{ bg: useColorModeValue('gray.200', 'gray.700') }}
                                borderRadius="md"
                                onClick={() => setOrgMenuOpen(!orgMenuOpen)}
                            >
                                {/* Use Flex for space-between alignment */}
                                <Flex justify="space-between" align="center">
                                    <Text fontWeight="bold">{user?.organizations[0]?.name || 'No Organization'}</Text>
                                    {orgMenuOpen ? <ChevronUpIcon /> : <ChevronDownIcon />}
                                </Flex>
                            </MenuButton>
                            <MenuList>
                                {user?.organizations.map((org) => (
                                    <MenuItem key={org.id} onClick={() => console.log(`Switch to ${org.name}`)}>
                                        {org.name}
                                    </MenuItem>
                                ))}
                            </MenuList>
                        </Menu>
                    )}
                </Box>

                <Divider />

                {/* Tabs Section */}
                <VStack
                    align="stretch"
                    spacing={4}
                    mt={4}
                    flex="1" // This makes the tabs section fill the remaining space
                    overflowY="auto" // Adds scrolling if the content exceeds the height
                >
                    {tabs.map((tab, index) => (
                        <Link
                            key={index}
                            onClick={() => {
                                router.push(tab.route);
                                if (onClose) onClose();
                            }}
                            p={2}
                            borderRadius="md"
                            display="flex"
                            alignItems="center"
                            gap={2}
                            bg={pathname === tab.route ? 'blue.100' : 'transparent'}
                            _hover={{ bg: 'gray.200' }}
                            _dark={{
                                bg: pathname === tab.route ? 'blue.700' : 'transparent',
                                _hover: { bg: 'gray.700' },
                            }}
                        >
                            <tab.icon />
                            <Text fontWeight="bold">{tab.title}</Text>
                        </Link>
                    ))}
                </VStack>

                <Divider />

                {/* User Cell */}
                <Box mt={4}>
                    {userLoading ? (
                        <Flex justify="center" align="center" height="40px">
                            <Spinner size="sm" />
                        </Flex>
                    ) : (
                        <Menu>
                            <MenuButton
                                width="100%" // Ensure the entire user cell spans the sidebar width
                                p={2}
                                _hover={{ bg: useColorModeValue('gray.200', 'gray.700') }}
                                borderRadius="md"
                            >
                                {/* Use Flex for row alignment */}
                                <Flex justify="space-between" align="center">
                                    {/* Avatar on the left */}
                                    <Avatar name={`${user?.first_name} ${user?.last_name}`} size="sm" />

                                    {/* User Details in the middle */}
                                    <Box flex="1" ml={2} textAlign="left">
                                        <Text fontWeight="bold" fontSize="sm" isTruncated>
                                            {`${user?.first_name} ${user?.last_name}`}
                                        </Text>
                                        <Text fontSize="small" color="gray.500" isTruncated>
                                            {user?.email}
                                        </Text>
                                    </Box>

                                    {/* Vertical Dots Menu on the right */}
                                    <BiDotsVerticalRounded />
                                </Flex>
                            </MenuButton>

                            {/* Menu List */}
                            <MenuList>
                                <MenuItem onClick={() => router.push('/profile')}>Profile</MenuItem>
                                <MenuDivider />
                                <MenuItem onClick={() => authStore.signOut()}>Logout</MenuItem>
                            </MenuList>
                        </Menu>
                    )}
                </Box>
            </Box>
        </motion.div>
    );
});

export default Sidebar;
