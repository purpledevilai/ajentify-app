import React from 'react';
import { Box, VStack, Link, Text } from '@chakra-ui/react';
import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';

interface SidebarProps {
    isMobile: boolean; // If the sidebar is being rendered for mobile
    isOpen: boolean; // Whether the sidebar is open
    onClose?: () => void; // Function to close the sidebar
}

const Sidebar = ({ isMobile, isOpen, onClose }: SidebarProps) => {
    const router = useRouter();

    return (
        <motion.div
            initial={{ x: isMobile ? '-100%' : 0 }}
            animate={{ x: isOpen ? 0 : '-100%' }} // Animate in and out
            exit={{ x: '-100%' }} // Ensure it slides out on unmount
            transition={{ duration: 0.3 }} // Smooth animation
            style={{
                position: isMobile ? 'absolute' : 'relative',
                zIndex: isMobile ? 20 : 'auto',
                height: '100%',
                width: '250px',
            }}
        >
            <Box
                as="nav"
                bg="gray.100"
                _dark={{ bg: 'gray.800' }}
                height="100%"
                shadow="md"
                p={4}
            >
                <VStack align="stretch" spacing={4}>
                    <Link onClick={() => { router.push('/home'); if (onClose) onClose(); }}>
                        <Text fontSize="lg" fontWeight="bold">
                            Home
                        </Text>
                    </Link>
                    <Link onClick={() => { router.push('/create-agent'); if (onClose) onClose(); }}>
                        <Text fontSize="lg" fontWeight="bold">
                            Create Agent
                        </Text>
                    </Link>
                </VStack>
            </Box>
        </motion.div>
    );
};

export default Sidebar;
