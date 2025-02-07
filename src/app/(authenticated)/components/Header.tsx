'use client';

import React from 'react';
import { Flex, Text, Spacer, IconButton, useColorMode, Box } from '@chakra-ui/react';
import { HamburgerIcon, SunIcon, MoonIcon } from '@chakra-ui/icons';

interface HeaderProps {
  onMenuClick: () => void; // Function to toggle the sidebar
}

const Header = ({ onMenuClick }: HeaderProps) => {
  const { colorMode, toggleColorMode } = useColorMode();

  return (
    <Flex
      as="header"
      bg="#fff"
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
      <Box display={'flex'} flexDirection={'row'}>
      <Box backgroundImage='/Img/ajentifylogoicon.png' h='35px' w='35px' backgroundSize='cover' backgroundRepeat='no-repeat' backgroundPosition='center' ></Box>
      <Text fontSize="xl" fontWeight="bold" color='gray.800' ml={5}>
        Ajentify
      </Text></Box>

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
