'use client';

import React from 'react';
import { Stack, FormControl, FormLabel, Input, Button, Heading } from '@chakra-ui/react';
import { observer } from 'mobx-react-lite';
import { signUpStore } from '@/store/SignUpStore';

const CreateOrganizationStep = observer(() => {
    return (
        <Stack spacing={4}>
            <Heading as="h1" size="lg" textAlign="center">
                Create Your Organization
            </Heading>
            <FormControl isRequired>
                <FormLabel>Organization Name</FormLabel>
                <Input value={signUpStore.organizationName} onChange={(e) => signUpStore.setField('organizationName', e.target.value)} />
            </FormControl>
            <Button  isLoading={signUpStore.createOrgLoading} onClick={() => signUpStore.createOrganization()}>
                Create Organization
            </Button>
        </Stack>
    );
});

export default CreateOrganizationStep;
