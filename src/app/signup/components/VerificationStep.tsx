'use client';

import React from 'react';
import { Stack, FormControl, FormLabel, Input, Button, Heading } from '@chakra-ui/react';
import { observer } from 'mobx-react-lite';
import { signUpStore } from '@/store/SignUpStore';

const VerificationStep = observer(() => {
    return (
        <Stack spacing={4}>
            <Heading as="h1" size="lg" textAlign="center">
                Verify Your Email
            </Heading>
            <FormControl isRequired>
                <FormLabel>Verification Code</FormLabel>
                <Input value={signUpStore.confirmCode} onChange={(e) => signUpStore.setField('confirmCode', e.target.value)} />
            </FormControl>
            <Button colorScheme="blue" isLoading={signUpStore.confirmSignInLoading} onClick={() => signUpStore.confirmSignInCode()}>
                Submit
            </Button>
        </Stack>
    );
});

export default VerificationStep;
