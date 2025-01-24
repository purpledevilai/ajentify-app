import React from 'react';
import { observer } from 'mobx-react-lite';
import { Stack, Spinner, Heading } from '@chakra-ui/react';


export const CreatingTeamLoadingStep = observer(() => {
    
    return (
        <Stack
            spacing={4}
            overflow="auto" // Ensure the content scrolls if it overflows vertically
            width="100%" // Ensure Stack doesn't overflow horizontally
            maxWidth="600px" // Prevent horizontal overflow on mobile
            px={4} // Add horizontal padding for better mobile spacing
        >
            <Heading as="h1">
                Creating Team...
            </Heading>
            <Spinner size="xl" />
        </Stack>
    );
});