'use client';

import React, { useState, useEffect } from 'react';
import { observer } from 'mobx-react-lite';
import { Box, Flex, FormControl, FormLabel, Input, Button, Heading, Text, Stack } from '@chakra-ui/react';
import { authStore } from '@/store/AuthStore';
import { useRouter } from 'next/navigation';
import { reaction } from 'mobx';
import ForgotPasswordModal from './components/ForgotPasswordModal';

const SignInPage = observer(() => {
    const router = useRouter();
    const [isForgotPasswordOpen, setForgotPasswordOpen] = useState(false);

    useEffect(() => {
        const disposer = reaction(
            () => authStore.signedIn,
            (signedIn) => {
                if (signedIn) {
                    router.push('/agents');
                }
            }
        );

        return () => {
            disposer();
        };
    }, [router]);


    const handleSignIn = () => {
        authStore.submitSignIn()
    }
    
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
                            value={authStore.email}
                            onChange={(e) => authStore.setField('email', e.target.value)}
                            placeholder="Enter your email"
                        />
                    </FormControl>

                    {/* Password Input */}
                    <FormControl isRequired>
                        <FormLabel>Password</FormLabel>
                        <Input
                            type="password"
                            value={authStore.password}
                            onChange={(e) => authStore.setField('password', e.target.value)}
                            placeholder="Enter your password"
                        />
                    </FormControl>

                    {/* Forgot Password Link */}
                    <Text textAlign="left" >
                        <Button variant="link" size="sm" onClick={() => setForgotPasswordOpen(true)}>
                            Forgot Password
                        </Button>
                    </Text>

                    {/* Sign In Button */}
                    <Button
                        isLoading={authStore.signInLoading}
                        onClick={handleSignIn}
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
                {authStore.signInError && (
                    <Text color="red.500" mt={4} textAlign="center">
                        {authStore.signInError}
                    </Text>
                )}


                {/* Forgot Password Modal */}
                <ForgotPasswordModal
                    isOpen={isForgotPasswordOpen}
                    onClose={() => setForgotPasswordOpen(false)}
                />
            </Box>
        </Flex>
    );
});

export default SignInPage;
