'use client';

import React from 'react';
import { Stack, FormControl, FormLabel, Input, Button, Heading } from '@chakra-ui/react';
import { observer } from 'mobx-react-lite';
import { signUpStore } from '@/store/SignUpStore';
import { InlineError } from '@/app/components/InlineError';

const UserDetailsStep = observer(() => {
    return (
        <Stack
            spacing={4}
            width="100%"
            justifyContent="center"
            alignItems="center"
            px={4}
        >
            <Heading as="h1" size="lg" textAlign="center">
                Sign Up
            </Heading>
            <FormControl isRequired>
                <FormLabel>First Name</FormLabel>
                <Input value={signUpStore.firstName} placeholder='Thomas' onChange={(e) => signUpStore.setField('firstName', e.target.value)} />
            </FormControl>
            <FormControl isRequired>
                <FormLabel>Last Name</FormLabel>
                <Input value={signUpStore.lastName} placeholder='Anderson' onChange={(e) => signUpStore.setField('lastName', e.target.value)} />
            </FormControl>
            <FormControl isRequired>
                <FormLabel>Email</FormLabel>
                <Input type="email" value={signUpStore.email} placeholder='neo@matrix.ai' onChange={(e) => signUpStore.setField('email', e.target.value)} />
            </FormControl>
            <FormControl isRequired>
                <FormLabel>Password</FormLabel>
                <Input type="password" value={signUpStore.password} placeholder='Enter your password' onChange={(e) => signUpStore.setField('password', e.target.value)} />
            </FormControl>
            <FormControl isRequired>
                <FormLabel>Confirm Password</FormLabel>
                <Input
                    type="password"
                    value={signUpStore.confirmPassword}
                    placeholder='Confirm your password'
                    onChange={(e) => signUpStore.setField('confirmPassword', e.target.value)}
                />
            </FormControl>
            {signUpStore.signUpError && (
                <InlineError message={signUpStore.signUpError} />
            )}
            <Button width="100%" isLoading={signUpStore.signUpLoading} onClick={() => signUpStore.submitSignUp()}>
                Sign Up
            </Button>
        </Stack>
    );
});

export default UserDetailsStep;
