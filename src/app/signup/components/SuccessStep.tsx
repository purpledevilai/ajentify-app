'use client';

import React from 'react';
import { Stack, Button, Heading, Text } from '@chakra-ui/react';
import { useRouter } from 'next/navigation';

const SuccessStep = () => {
    const router = useRouter();

    return (
        <Stack spacing={4} textAlign="center">
            <Heading as="h1" size="lg">
                Account Created Successfully!
            </Heading>
            <Text>Welcome to Ajentify! You’re all set to get started.</Text>
            <Button bg="green.500" _hover={{bg: "green.300"}} onClick={() => router.push('/')}>
                Go to Home
            </Button>
        </Stack>
    );
};

export default SuccessStep;
