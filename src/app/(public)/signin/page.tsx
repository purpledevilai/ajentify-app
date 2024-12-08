'use client';

import React, { useEffect } from 'react';
import { observer } from 'mobx-react-lite';
import { Box, Flex, FormControl, FormLabel, Input, Button, Heading, Text, Stack } from '@chakra-ui/react';
import { signInStore } from '@/store/SignInStore';
import { useRouter } from 'next/navigation';

const SignInPage = observer(() => {
    const router = useRouter();

    useEffect(() => {
        if (signInStore.succesfullySignedIn) {
            router.push('/');
        }
    }, [signInStore.succesfullySignedIn]);

    return (
        <Flex align="center" justify="center" height="100vh" bg="gray.50" _dark={{ bg: 'gray.900' }}>
            <Box
                bg="white"
                _dark={{ bg: 'gray.800' }}
                p={8}
                borderRadius="md"
                boxShadow="lg"
                width="full"
                maxWidth="sm"
            >
                <Heading as="h1" size="lg" textAlign="center" mb={6}>
                    Ajentify
                </Heading>

                <Stack spacing={4}>
                    {/* Email Input */}
                    <FormControl isRequired>
                        <FormLabel>Email</FormLabel>
                        <Input
                            type="email"
                            value={signInStore.email}
                            onChange={(e) => signInStore.setField('email', e.target.value)}
                            placeholder="Enter your email"
                        />
                    </FormControl>

                    {/* Password Input */}
                    <FormControl isRequired>
                        <FormLabel>Password</FormLabel>
                        <Input
                            type="password"
                            value={signInStore.password}
                            onChange={(e) => signInStore.setField('password', e.target.value)}
                            placeholder="Enter your password"
                        />
                    </FormControl>

                    {/* Sign In Button */}
                    <Button
                        
                        isLoading={signInStore.signInLoading}
                        onClick={() => signInStore.submitSignIn()}
                    >
                        Log In
                    </Button>

                    {/* Sign Up Link */}
                    <Text textAlign="center" fontSize="sm">
                        Don’t have an account?{' '}
                        <Button
                            variant="link"
                            
                            onClick={() => router.push('/signup')}
                        >
                            Sign Up
                        </Button>
                    </Text>
                </Stack>

                {/* Error Message */}
                {signInStore.errorMessage && (
                    <Text color="red.500" mt={4} textAlign="center">
                        {signInStore.errorMessage}
                    </Text>
                )}
            </Box>
        </Flex>
    );
});

export default SignInPage;
