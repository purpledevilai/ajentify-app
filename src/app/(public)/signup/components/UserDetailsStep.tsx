'use client';

import React from 'react';
import { Stack, FormControl, FormLabel, Input, Button, Heading } from '@chakra-ui/react';
import { observer } from 'mobx-react-lite';
import { signUpStore } from '@/store/SignUpStore';

const UserDetailsStep = observer(() => {
    const inputStyles = {
        bg: "whiteAlpha.300",
        border: "1px solid white",
        color: "#ffffff",
        _placeholder: { color: 'gray.300' },
        _focus: { borderColor: 'blue.500' },
    };

    return (
        <Stack
            spacing={4}
            width="100%" // Fill parent's width
            justifyContent="center" // Center content vertically
            alignItems="center" // Center content horizontally
            px={4} // Optional padding for responsive design
        >
            <Heading as="h1" size="md" textAlign="center" color="white">
                Sign Up
            </Heading>
            <FormControl isRequired>
                <FormLabel color="white">First Name</FormLabel>
                <Input
                    value={signUpStore.firstName}
                    placeholder="Thomas"
                    onChange={(e) => signUpStore.setField('firstName', e.target.value)}
                    {...inputStyles}
                />
            </FormControl>
            <FormControl isRequired>
                <FormLabel color="white">Last Name</FormLabel>
                <Input
                    value={signUpStore.lastName}
                    placeholder="Anderson"
                    onChange={(e) => signUpStore.setField('lastName', e.target.value)}
                    {...inputStyles}
                />
            </FormControl>
            <FormControl isRequired>
                <FormLabel color="white">Email</FormLabel>
                <Input
                    type="email"
                    value={signUpStore.email}
                    placeholder="neo@matrix.ai"
                    onChange={(e) => signUpStore.setField('email', e.target.value)}
                    {...inputStyles}
                />
            </FormControl>
            <FormControl isRequired>
                <FormLabel color="white">Password</FormLabel>
                <Input
                    type="password"
                    value={signUpStore.password}
                    placeholder="Enter your password"
                    onChange={(e) => signUpStore.setField('password', e.target.value)}
                    {...inputStyles}
                />
            </FormControl>
            <FormControl isRequired>
                <FormLabel color="white">Confirm Password</FormLabel>
                <Input
                    type="password"
                    value={signUpStore.confirmPassword}
                    placeholder="Confirm your password"
                    onChange={(e) => signUpStore.setField('confirmPassword', e.target.value)}
                    {...inputStyles}
                />
            </FormControl>
            <Button
                width="100%"
                isLoading={signUpStore.signUpLoading}
                bg="blue.500"
                color="white"
                _hover={{ bg: "blue.600" }}
                borderRadius="full"
                onClick={() => signUpStore.submitSignUp()}
            >
                Sign Up
            </Button>
        </Stack>
    );
});

export default UserDetailsStep;
