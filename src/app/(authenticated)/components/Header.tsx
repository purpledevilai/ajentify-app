import React from 'react';
import { Flex, Text, Spacer, Button, IconButton } from '@chakra-ui/react';
import { HamburgerIcon } from '@chakra-ui/icons';

interface HeaderProps {
    onMenuClick: () => void; // Function to toggle the sidebar
}

const Header = ({ onMenuClick }: HeaderProps) => {

    return (
        <Flex
            as="header"
            bg="blue.500"
            color="white"
            padding="4"
            alignItems="center"
            shadow="md"
            zIndex="10"
        >
            {/* Hamburger Menu (Visible on mobile) */}
            <IconButton
                aria-label="Open Menu"
                icon={<HamburgerIcon />}
                variant="ghost"
                color="white"
                _hover={{ bg: 'blue.600' }}
                display={{ base: 'block', lg: 'none' }} // Hide on large screens
                onClick={onMenuClick}
                mr={4}
            />

            {/* Logo */}
            <Text fontSize="lg" fontWeight="bold">
                Ajentify
            </Text>

            <Spacer />

            {/* Logout Button */}
            <Button colorScheme="red" >
                Logout
            </Button>
        </Flex>
    );
};

export default Header;
