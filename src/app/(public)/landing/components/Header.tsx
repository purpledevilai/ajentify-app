'use client';

import { Box, Button, Flex, IconButton, Spacer, useColorMode } from '@chakra-ui/react';
import { SunIcon, MoonIcon } from '@chakra-ui/icons';
import Link from 'next/link';

export default function Header() {
    const { colorMode, toggleColorMode } = useColorMode();

    return (
        <Box as="header" bg="gray.100" _dark={{ bg: "gray.900" }} px="6" py="4" boxShadow="sm">
            <Flex align="center">
                <Box fontSize="xl" fontWeight="bold">
                    Ajentify
                </Box>
                <Spacer />
                <Flex align="center" gap="4">
                    <IconButton
                        aria-label="Toggle color mode"
                        icon={colorMode === 'light' ? <MoonIcon /> : <SunIcon />} 
                        onClick={toggleColorMode}
                        variant="ghost"
                    />
                    <Link href="/signup" passHref>
                        <Button variant="solid">Sign Up</Button>
                    </Link>
                    <Link href="/signin" passHref>
                        <Button variant="outline">Log In</Button>
                    </Link>
                </Flex>
            </Flex>
        </Box>
    );
}