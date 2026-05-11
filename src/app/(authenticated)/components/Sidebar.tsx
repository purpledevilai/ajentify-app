'use client';

import React, { useState } from 'react';
import {
    Box,
    Flex,
    VStack,
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
import { RiRobot3Fill, RiStackFill } from "react-icons/ri";
import { MdHistory } from "react-icons/md";
import { BiDotsVerticalRounded } from 'react-icons/bi';
import { FiTool, FiFileText, FiLink } from "react-icons/fi";
import { VscJson } from "react-icons/vsc";
import { ChevronDownIcon, ChevronUpIcon } from '@chakra-ui/icons';
import NextLink from 'next/link';
import { usePathname } from 'next/navigation';
import { useStores } from '@/store/StoreContext';
import { observer } from 'mobx-react-lite';

interface SidebarProps {
    isMobile: boolean;
    isOpen: boolean;
    onClose?: () => void;
}

const Sidebar = observer(({ isMobile, isOpen, onClose }: SidebarProps) => {
    const pathname = usePathname();
    const { auth } = useStores();
    const [orgMenuOpen, setOrgMenuOpen] = useState(false);
    const hoverColor = useColorModeValue('gray.200', 'gray.700');

    const tabs = [
        { icon: RiRobot3Fill, title: 'Agents', route: '/agents' },
        { icon: FiTool, title: 'Agent Tools', route: '/tools' },
        { icon: MdHistory, title: 'Contexts', route: '/contexts' },
        { icon: VscJson, title: 'Structured Responses', route: '/sres' },
        { icon: FiFileText, title: 'Documents', route: '/documents' },
        { icon: RiStackFill, title: 'Stages', route: '/stages' },
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
                    {auth.userLoading ? (
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
                                    <Text fontWeight="bold">{auth.user?.organizations[0]?.name || 'No Organization'}</Text>
                                    {orgMenuOpen ? <ChevronUpIcon /> : <ChevronDownIcon />}
                                </Flex>
                            </MenuButton>
                            <MenuList>
                                {auth.user?.organizations.map((org) => (
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
                        <NextLink
                            key={index}
                            href={tab.route}
                            onClick={() => { if (onClose) onClose(); }}
                        >
                            <Box
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
                            </Box>
                        </NextLink>
                    ))}
                </VStack>

                <Divider />

                {/* User Cell */}
                <Box mt={4}>
                    {auth.userLoading ? (
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
                                    <Avatar name={`${auth.user?.first_name} ${auth.user?.last_name}`} size="sm" />

                                    {/* User Details in the middle */}
                                    <Box flex="1" ml={2} textAlign="left">
                                        <Text fontWeight="bold" fontSize="sm" isTruncated>
                                            {`${auth.user?.first_name} ${auth.user?.last_name}`}
                                        </Text>
                                        <Text fontSize="small" color="gray.500" isTruncated>
                                            {auth.user?.email}
                                        </Text>
                                    </Box>

                                    {/* Vertical Dots Menu on the right */}
                                    <BiDotsVerticalRounded />
                                </Flex>
                            </MenuButton>

                            {/* Menu List */}
                            <MenuList>
                                <NextLink href="/profile"><MenuItem>Profile</MenuItem></NextLink>
                                <NextLink href="/usage"><MenuItem>Usage</MenuItem></NextLink>
                                <NextLink href="/api-keys"><MenuItem>API Keys</MenuItem></NextLink>
                                <MenuDivider />
                                <MenuItem onClick={() => void auth.signOut()}>Logout</MenuItem>
                            </MenuList>
                        </Menu>
                    )}
                </Box>
            </Box>
        </motion.div>
    );
});

export default Sidebar;
