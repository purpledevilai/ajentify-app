'use client';

import React from 'react';
import { Stack, FormControl, FormLabel, Input, Button, Heading } from '@chakra-ui/react';
import { observer } from 'mobx-react-lite';
import { signUpStore } from '@/store/SignUpStore';

const UserDetailsStep = observer(() => {
    return (
        <Stack spacing={4}>
            <Heading as="h1" size="lg" textAlign="center">
                Sign Up
            </Heading>
            <FormControl isRequired>
                <FormLabel>First Name</FormLabel>
                <Input value={signUpStore.firstName} onChange={(e) => signUpStore.setField('firstName', e.target.value)} />
            </FormControl>
            <FormControl isRequired>
                <FormLabel>Last Name</FormLabel>
                <Input value={signUpStore.lastName} onChange={(e) => signUpStore.setField('lastName', e.target.value)} />
            </FormControl>
            <FormControl isRequired>
                <FormLabel>Email</FormLabel>
                <Input type="email" value={signUpStore.email} onChange={(e) => signUpStore.setField('email', e.target.value)} />
            </FormControl>
            <FormControl isRequired>
                <FormLabel>Password</FormLabel>
                <Input type="password" value={signUpStore.password} onChange={(e) => signUpStore.setField('password', e.target.value)} />
            </FormControl>
            <FormControl isRequired>
                <FormLabel>Confirm Password</FormLabel>
                <Input
                    type="password"
                    value={signUpStore.confirmPassword}
                    onChange={(e) => signUpStore.setField('confirmPassword', e.target.value)}
                />
            </FormControl>
            <Button colorScheme="blue" isLoading={signUpStore.signUpLoading} onClick={() => signUpStore.submitSignUp()}>
                Sign Up
            </Button>
        </Stack>
    );
});

export default UserDetailsStep;
