'use client';

import React, { useState } from 'react';
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
import { RiRobot3Fill } from "react-icons/ri";
import { MdChatBubble } from "react-icons/md";
import { BiDotsVerticalRounded } from 'react-icons/bi';
import { MdOutlineWebAsset } from "react-icons/md";
import { FiTool, FiFileText, FiLink } from "react-icons/fi";
import { VscJson } from "react-icons/vsc";
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
    const hoverColor = useColorModeValue('gray.200', 'gray.700');

    // Tabs for the navigation
    const tabs = [
        { icon: RiRobot3Fill, title: 'Agents', route: '/agents' },
        { icon: FiTool, title: 'Agent Tools', route: '/tools' },
        { icon: FiFileText, title: 'Documents', route: '/documents' },
        { icon: VscJson, title: 'Structured Responses', route: '/sres' },
        { icon: MdChatBubble, title: 'Chat', route: '/chat' },
        { icon: MdOutlineWebAsset, title: 'Chat Pages', route: '/chat-pages' },
        { icon: FiLink, title: 'Integrations', route: '/integrations' },
    ];

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
                    {authStore.userLoading ? (
                        <Flex justify="center" align="center" height="40px">
                            <Spinner size="sm" />
                        </Flex>
                    ) : (
                        <Menu isOpen={orgMenuOpen} onClose={() => setOrgMenuOpen(false)}>
                            <MenuButton
                                width="100%" // Ensures the button spans the full width
                                p={2}
                                _hover={{ bg: hoverColor }}
                                borderRadius="md"
                                onClick={() => setOrgMenuOpen(!orgMenuOpen)}
                            >
                                {/* Use Flex for space-between alignment */}
                                <Flex justify="space-between" align="center">
                                    <Text fontWeight="bold">{authStore.user?.organizations[0]?.name || 'No Organization'}</Text>
                                    {orgMenuOpen ? <ChevronUpIcon /> : <ChevronDownIcon />}
                                </Flex>
                            </MenuButton>
                            <MenuList>
                                {authStore.user?.organizations.map((org) => (
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
                    flex="1"
                    overflowY="auto"
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
                            bg={pathname === tab.route ? 'brand.100' : 'transparent'}
                            _hover={{ bg: 'gray.200' }}
                            _dark={{
                                bg: pathname === tab.route ? 'brand.700' : 'transparent',
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
                    {authStore.userLoading ? (
                        <Flex justify="center" align="center" height="40px">
                            <Spinner size="sm" />
                        </Flex>
                    ) : (
                        <Menu>
                            <MenuButton
                                width="100%" // Ensure the entire user cell spans the sidebar width
                                p={2}
                                _hover={{ bg: hoverColor }}
                                borderRadius="md"
                            >
                                {/* Use Flex for row alignment */}
                                <Flex justify="space-between" align="center">
                                    {/* Avatar on the left */}
                                    <Avatar name={`${authStore.user?.first_name} ${authStore.user?.last_name}`} size="sm" />

                                    {/* User Details in the middle */}
                                    <Box flex="1" ml={2} textAlign="left">
                                        <Text fontWeight="bold" fontSize="sm" isTruncated>
                                            {`${authStore.user?.first_name} ${authStore.user?.last_name}`}
                                        </Text>
                                        <Text fontSize="small" color="gray.500" isTruncated>
                                            {authStore.user?.email}
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
