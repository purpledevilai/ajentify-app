'use client';

import {
    Box,
    Button,
    Container,
    Flex,
    IconButton,
    Spacer,
    useColorMode,
    useColorModeValue,
} from '@chakra-ui/react';
import { SunIcon, MoonIcon } from '@chakra-ui/icons';
import Link from 'next/link';

export default function Header() {
    const { colorMode, toggleColorMode } = useColorMode();

    const bg = useColorModeValue('whiteAlpha.800', 'blackAlpha.700');
    const borderColor = useColorModeValue('gray.200', 'gray.800');
    const docsColor = useColorModeValue('brand.600', 'brand.300');
    const docsHoverBg = useColorModeValue('brand.50', 'whiteAlpha.100');

    return (
        <Box
            as="header"
            position="sticky"
            top="0"
            zIndex="sticky"
            bg={bg}
            backdropFilter="saturate(180%) blur(8px)"
            borderBottom="1px solid"
            borderColor={borderColor}
            px={{ base: 4, md: 6 }}
            py="3"
        >
            <Container maxW="6xl" px="0">
                <Flex align="center">
                    <Box fontSize="lg" fontWeight="extrabold" letterSpacing="-0.01em">
                        Ajentify
                    </Box>
                    <Spacer />
                    <Flex align="center" gap={{ base: 2, md: 3 }}>
                        <Button
                            as="a"
                            href="https://api.ajentify.com/docs"
                            target="_blank"
                            rel="noopener noreferrer"
                            variant="ghost"
                            color={docsColor}
                            fontWeight="semibold"
                            _hover={{ bg: docsHoverBg }}
                        >
                            Docs
                        </Button>
                        <IconButton
                            aria-label="Toggle color mode"
                            icon={colorMode === 'light' ? <MoonIcon /> : <SunIcon />}
                            onClick={toggleColorMode}
                            variant="ghost"
                            size="sm"
                        />
                        <Link href="/signin" passHref>
                            <Button variant="ghost" display={{ base: 'none', sm: 'inline-flex' }}>
                                Log in
                            </Button>
                        </Link>
                        <Link href="/signup" passHref>
                            <Button variant="solid">Sign up</Button>
                        </Link>
                    </Flex>
                </Flex>
            </Container>
        </Box>
    );
}
