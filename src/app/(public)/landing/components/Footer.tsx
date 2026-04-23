'use client';

import {
    Box,
    Container,
    Flex,
    HStack,
    Link as ChakraLink,
    Stack,
    Text,
    useColorModeValue,
} from '@chakra-ui/react';
import Link from 'next/link';

const FOOTER_LINKS = {
    product: [
        { label: 'Docs', href: 'https://api.ajentify.com/docs', external: true },
        { label: 'Sign up', href: '/signup', external: false },
        { label: 'Log in', href: '/signin', external: false },
    ],
    follow: [
        { label: 'YouTube', href: 'https://www.youtube.com/@Ajentify', external: true },
    ],
};

export default function Footer() {
    const borderColor = useColorModeValue('gray.200', 'gray.800');
    const labelColor = useColorModeValue('gray.500', 'gray.500');
    const linkColor = useColorModeValue('gray.700', 'gray.300');
    const linkHoverColor = useColorModeValue('brand.600', 'brand.300');
    const footerBg = useColorModeValue('white', 'gray.950');

    const renderLink = (link: { label: string; href: string; external: boolean }) => {
        const common = {
            color: linkColor,
            fontSize: 'sm',
            _hover: { color: linkHoverColor, textDecoration: 'none' },
        };
        if (link.external) {
            return (
                <ChakraLink
                    key={link.label}
                    href={link.href}
                    isExternal
                    {...common}
                >
                    {link.label}
                </ChakraLink>
            );
        }
        return (
            <Link key={link.label} href={link.href} passHref legacyBehavior>
                <ChakraLink {...common}>{link.label}</ChakraLink>
            </Link>
        );
    };

    return (
        <Box
            as="footer"
            bg={footerBg}
            borderTop="1px solid"
            borderColor={borderColor}
            py={{ base: 10, md: 12 }}
            px="6"
        >
            <Container maxW="6xl">
                <Flex
                    direction={{ base: 'column', md: 'row' }}
                    justify="space-between"
                    gap={{ base: 10, md: 8 }}
                >
                    <Stack spacing="3" maxW="sm">
                        <Text fontSize="lg" fontWeight="extrabold" letterSpacing="-0.01em">
                            Ajentify
                        </Text>
                        <Text fontSize="sm" color={labelColor} lineHeight="1.6">
                            Agents, memory, tools, and chat — as infrastructure, over plain HTTP.
                        </Text>
                    </Stack>

                    <Flex
                        direction={{ base: 'column', sm: 'row' }}
                        gap={{ base: 8, md: 16 }}
                    >
                        <Stack spacing="3" minW="32">
                            <Text
                                fontSize="xs"
                                fontWeight="semibold"
                                color={labelColor}
                                textTransform="uppercase"
                                letterSpacing="wider"
                            >
                                Product
                            </Text>
                            {FOOTER_LINKS.product.map(renderLink)}
                        </Stack>
                        <Stack spacing="3" minW="32">
                            <Text
                                fontSize="xs"
                                fontWeight="semibold"
                                color={labelColor}
                                textTransform="uppercase"
                                letterSpacing="wider"
                            >
                                Follow
                            </Text>
                            {FOOTER_LINKS.follow.map(renderLink)}
                        </Stack>
                    </Flex>
                </Flex>

                <HStack
                    justify="space-between"
                    mt={{ base: 10, md: 12 }}
                    pt="6"
                    borderTop="1px solid"
                    borderColor={borderColor}
                    flexWrap="wrap"
                >
                    <Text fontSize="xs" color={labelColor}>
                        © {new Date().getFullYear()} Ajentify
                    </Text>
                </HStack>
            </Container>
        </Box>
    );
}
