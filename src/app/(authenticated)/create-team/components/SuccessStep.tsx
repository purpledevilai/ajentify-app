import React from 'react';
import { Stack, Heading, Button } from '@chakra-ui/react';

export const SuccessStep = () => {
    return (
        <Stack
            spacing={4}
            overflow="auto" // Ensure the content scrolls if it overflows vertically
            width="100%" // Ensure Stack doesn't overflow horizontally
            maxWidth="600px" // Prevent horizontal overflow on mobile
            px={4} // Add horizontal padding for better mobile spacing
        >
            <Heading as="h1">
                Team Created!
            </Heading>
            <Button colorScheme="brand" onClick={() => window.location.href = '/agents'}>Go to Agents</Button>
        </Stack>
    );
};

