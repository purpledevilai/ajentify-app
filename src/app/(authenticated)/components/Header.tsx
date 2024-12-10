'use client';

import React from 'react';
import { Flex, Text, Spacer, IconButton, useColorMode } from '@chakra-ui/react';
import { HamburgerIcon, SunIcon, MoonIcon } from '@chakra-ui/icons';

interface HeaderProps {
  onMenuClick: () => void; // Function to toggle the sidebar
}

const Header = ({ onMenuClick }: HeaderProps) => {
  const { colorMode, toggleColorMode } = useColorMode();

  return (
    <Flex
      as="header"
      bg="gray.100"
      _dark={{ bg: 'gray.700' }}
      px="6"
      py="4"
      alignItems="center"
      shadow="sm"
      zIndex="10"
    >
      {/* Hamburger Menu (Visible on mobile) */}
      <IconButton
        aria-label="Open Menu"
        icon={<HamburgerIcon />}
        variant="ghost"
        color="inherit"
        _hover={{ bg: 'gray.200', _dark: { bg: 'gray.700' } }}
        display={{ base: 'block', lg: 'none' }} // Hide on large screens
        onClick={onMenuClick}
        mr={4}
      />

      {/* Logo */}
      <Text fontSize="xl" fontWeight="bold">
        Ajentify
      </Text>

      <Spacer />

      {/* Light/Dark Mode Toggle */}
      <IconButton
        aria-label="Toggle color mode"
        icon={colorMode === 'light' ? <MoonIcon /> : <SunIcon />}
        onClick={toggleColorMode}
        variant="ghost"
        _hover={{ bg: 'gray.200', _dark: { bg: 'gray.700' } }}
      />
    </Flex>
  );
};

export default Header;
