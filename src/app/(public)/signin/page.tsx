'use client';

import React, { useState, useEffect } from 'react';
import { observer } from 'mobx-react-lite';
import {
    Box,
    Flex,
    FormControl,
    FormLabel,
    Input,
    Button,
    Heading,
    Text,
    Stack,
} from '@chakra-ui/react';
import { authStore } from '@/store/AuthStore';
import { useRouter } from 'next/navigation';
import { reaction } from 'mobx';
import ForgotPasswordModal from './components/ForgotPasswordModal';
import Header from '../landing/components/Header';

const SignInPage = observer(() => {
    const router = useRouter();
    const [isForgotPasswordOpen, setForgotPasswordOpen] = useState(false);

    const routeBasedOnAuth = (signedIn: boolean) => {
        if (signedIn) {
            router.push('/agents');
        }
    };

    useEffect(() => {
        const disposer = reaction(
            () => authStore.signedIn,
            (signedIn) => {
                routeBasedOnAuth(signedIn);
            }
        );

        routeBasedOnAuth(authStore.signedIn);

        return () => {
            disposer();
        };
    });

    const handleSignIn = () => {
        authStore.submitSignIn();
    };

    return (
        <Flex
            h="100vh"
            w="100vw"
            bg="#080429"
            color="#ffffff"
            fontFamily="Montserrat"
            align="center"
            justify="center"
            backgroundImage="/Img/cyberbg.jpg"
            backgroundSize="cover"
            backgroundRepeat="no-repeat"
            backgroundPosition="center"
            flexDirection="column"
        >
            <Header/>
            <Box
                backgroundImage="/Img/logofont.png"
                h="150px"
                w="320px"
                backgroundSize="cover"
                backgroundRepeat="no-repeat"
                backgroundPosition="center"

            ></Box>
            <Box
                bg="rgba(255, 255, 255, 0.1)"
                backdropFilter="blur(8px)"
                borderRadius="lg"
                boxShadow="xl"
                p={10}
                width="100%"
                maxWidth="400px"
            >
                <Heading as="h1" size="md" textAlign="center" mb={6} color="#ffffff">
                    Welcome Back
                </Heading>

                <Stack spacing={4}>
                    {/* Email Input */}
                    <FormControl isRequired>
                        <FormLabel color="#ffffff">Email</FormLabel>
                        <Input
                            type="email"
                            value={authStore.email}
                            onChange={(e) => authStore.setField('email', e.target.value)}
                            placeholder="Enter your email"
                            bg="whiteAlpha.300"
                            border="1px solid white"
                            color="#ffffff"
                            _placeholder={{ color: 'gray.300' }}
                            _focus={{ borderColor: 'blue.500' }}
                        />
                    </FormControl>

                    {/* Password Input */}
                    <FormControl isRequired>
                        <FormLabel color="#ffffff">Password</FormLabel>
                        <Input
                            type="password"
                            value={authStore.password}
                            onChange={(e) => authStore.setField('password', e.target.value)}
                            placeholder="Enter your password"
                            bg="whiteAlpha.300"
                            border="1px solid white"
                            color="#ffffff"
                            _placeholder={{ color: 'gray.300' }}
                            _focus={{ borderColor: 'blue.500' }}
                        />
                    </FormControl>

                    {/* Forgot Password Link */}
                    <Text textAlign="left" color="#ffffff">
                        <Button variant="link" size="sm" onClick={() => setForgotPasswordOpen(true)} color="blue.300">
                            Forgot Password
                        </Button>
                    </Text>

                    {/* Sign In Button */}
                    <Button
                        isLoading={authStore.signInLoading}
                        onClick={handleSignIn}
                        bg="blue.500"
                        color="#ffffff"
                        _hover={{ bg: 'blue.600' }}
                        borderRadius="full"
                    >
                        Log In
                    </Button>

                    {/* Sign Up Link */}
                    <Text textAlign="center" fontSize="sm" color="#ffffff">
                        Don’t have an account?{' '}
                        <Button
                            variant="link"
                            onClick={() => router.push('/signup')}
                            color="blue.300"
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
