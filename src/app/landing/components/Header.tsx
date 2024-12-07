'use client';

import { Box, Button, Flex, IconButton, Spacer, useColorMode } from '@chakra-ui/react';
import { SunIcon, MoonIcon } from '@chakra-ui/icons';

export default function Header() {
    const { colorMode, toggleColorMode } = useColorMode();

    return (
        <Box as="header" bg="gray.100" _dark={{ bg: "gray.900" }} px="6" py="4" boxShadow="sm">
            <Flex align="center">
                {/* Logo or Brand */}
                <Box fontSize="xl" fontWeight="bold">
                    Ajentify
                </Box>

                <Spacer />

                {/* Buttons */}
                <Flex align="center" gap="4">
                    {/* Light/Dark Mode Toggle */}
                    <IconButton
                        aria-label="Toggle color mode"
                        icon={colorMode === 'light' ? <MoonIcon /> : <SunIcon />}
                        onClick={toggleColorMode}
                        variant="ghost"
                    />

                    {/* Sign Up Button */}
                    <Button variant="solid">
                        Sign Up
                    </Button>

                    {/* Login Button */}
                    <Button  variant="outline">
                        Log In
                    </Button>
                </Flex>
            </Flex>
        </Box>
    );
}
