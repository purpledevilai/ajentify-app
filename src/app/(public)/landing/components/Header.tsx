'use client';

import {
  Box,
  Button,
  Flex,
  Spacer,
  Text,
  Link as ChakraLink,
  useColorMode,
  IconButton,
} from '@chakra-ui/react';
import { MoonIcon, SunIcon } from '@chakra-ui/icons';
import Link from 'next/link';

export default function Header() {
  const { colorMode, toggleColorMode } = useColorMode();

  return (
    <Box
      as="header"
     
      px="6"
      py="4"
      boxShadow="sm"
      position="fixed"
      width="100%"
      top="0"
      zIndex="1000"
    >
      <Flex align="center" justify="space-between">
        
        {/* Navigation Links */}
        <Flex
          display={{ base: 'none', md: 'flex' }}
          gap="30px"
          justifyContent="center"
          alignItems="center"
          textAlign="center"
        >
          <ChakraLink as={Link} href="/" color={colorMode === 'light' ? 'black' : 'white'} _hover={{ textDecoration: 'underline' }}>
            Home
          </ChakraLink>
          <ChakraLink as={Link} href="/research" color={colorMode === 'light' ? 'black' : 'white'} _hover={{ textDecoration: 'underline' }}>
            Research
          </ChakraLink>
          <ChakraLink as={Link} href="/services" color={colorMode === 'light' ? 'black' : 'white'} _hover={{ textDecoration: 'underline' }}>
            Our Services
          </ChakraLink>
          <ChakraLink as={Link} href="/contact" color={colorMode === 'light' ? 'black' : 'white'} _hover={{ textDecoration: 'underline' }}>
            Contact Us
          </ChakraLink>
        </Flex>

        <Spacer />

        {/* Action Buttons */}
        <Flex align="center" gap="4">
          {/* Light/Dark Mode Toggle */}
          <IconButton
            aria-label="Toggle color mode"
            icon={colorMode === 'light' ? <MoonIcon /> : <SunIcon />}
            onClick={toggleColorMode}
            variant="ghost"
          />

          {/* Login Button */}
          <Link href="/signin" passHref>
            <Button
              borderRadius="30px"
              bg="#1252B8"
              color="white"
              size="sm"
              fontSize="14px"
              variant="solid"
              h="35px"
              w="100px"
              _hover={{ bg: '#0f47a1' }}
            >
              Log In
            </Button>
          </Link>
        </Flex>
      </Flex>
    </Box>
  );
}
