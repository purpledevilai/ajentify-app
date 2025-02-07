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
import { MdDashboard } from "react-icons/md";
import { BiDotsVerticalRounded } from 'react-icons/bi';
import { MdOutlineWebAsset } from "react-icons/md";
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
        { icon: MdDashboard, title: 'Dashboard', route: '/dashboard' },
        { icon: RiRobot3Fill, title: 'Agents', route: '/agents' },
        { icon: MdChatBubble, title: 'Chat', route: '/chat' },
        { icon: MdOutlineWebAsset, title: 'Chat Pages', route: '/chat-pages' },
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
            <Box
                as="nav"
                bgGradient="linear(to-b, #3F329F, #36167E)" // Matching gradient background
                height="100%"
                shadow="lg"
                p={4}
                display="flex"
                flexDirection="column"
            >
                {/* Organization Selector */}
                <Box mb={4}>
                    {authStore.userLoading ? (
                        <Flex justify="center" align="center" height="40px">
                            <Spinner size="sm" />
                        </Flex>
                    ) : (
                        <Menu isOpen={orgMenuOpen} onClose={() => setOrgMenuOpen(false)}>
                            <MenuButton
                                width="100%"
                                p={2}
                                _hover={{ bg: "whiteAlpha.400" }}
                                borderRadius="md"
                                bg="whiteAlpha.200"
                            >
                                <Flex justify="space-between" align="center">
                                    <Text fontWeight="bold" color="white">
                                        {authStore.user?.organizations[0]?.name || "No Organization"}
                                    </Text>
                                    {orgMenuOpen ? <ChevronUpIcon color="white" /> : <ChevronDownIcon color="white" />}
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

                <Divider borderColor="whiteAlpha.500" />

                {/* Tabs Section */}
                <VStack align="stretch" spacing={4} mt={4} flex="1" overflowY="auto">
                    {tabs.map((tab, index) => (
                        <Link
                            key={index}
                            onClick={() => {
                                router.push(tab.route);
                                if (onClose) onClose();
                            }}
                            p={3}
                            borderRadius="md"
                            display="flex"
                            alignItems="center"
                            gap={3}
                            bg={pathname === tab.route ? "whiteAlpha.400" : "transparent"}
                            _hover={{ bg: "whiteAlpha.300" }}
                        >
                            <tab.icon size={20} color="white" />
                            <Text fontWeight="bold" color="white">
                                {tab.title}
                            </Text>
                        </Link>
                    ))}
                </VStack>

                <Divider borderColor="whiteAlpha.500" />

                {/* User Cell */}
                <Box mt={4}>
                    {authStore.userLoading ? (
                        <Flex justify="center" align="center" height="40px">
                            <Spinner size="sm" />
                        </Flex>
                    ) : (
                        <Menu>
                            <MenuButton
                                width="100%"
                                p={2}
                                _hover={{ bg: "whiteAlpha.400" }}
                                borderRadius="md"
                                bg="whiteAlpha.200"
                            >
                                <Flex justify="space-between" align="center">
                                    <Avatar
                                        name={`${authStore.user?.first_name} ${authStore.user?.last_name}`}
                                        size="sm"
                                    />
                                    <Box flex="1" ml={2} textAlign="left">
                                        <Text fontWeight="bold" fontSize="sm" color="white" isTruncated>
                                            {`${authStore.user?.first_name} ${authStore.user?.last_name}`}
                                        </Text>
                                        <Text fontSize="small" color="gray.200" isTruncated>
                                            {authStore.user?.email}
                                        </Text>
                                    </Box>
                                    <BiDotsVerticalRounded color="white" />
                                </Flex>
                            </MenuButton>
                            <MenuList>
                                <MenuItem onClick={() => router.push("/profile")}>Profile</MenuItem>
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
