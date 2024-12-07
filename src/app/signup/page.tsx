'use client';

import React from 'react';
import { observer } from 'mobx-react-lite';
import { Flex, Box } from '@chakra-ui/react';
import { signUpStore } from '@/store/SignUpStore';
import UserDetailsStep from './components/UserDetailsStep';
import VerificationStep from './components/VerificationStep';
import CreateOrganizationStep from './components/CreateOrganizationStep';
import SuccessStep from './components/SuccessStep';
import Alert from '@/components/Alert';

const SignUpPage = observer(() => {
  return (
    <Flex align="center" justify="center" height="100vh" bg="gray.50" _dark={{ bg: 'gray.900' }}>
      <Box width="full" maxWidth="sm">
        {signUpStore.step === 'userDetails' && <UserDetailsStep />}
        {signUpStore.step === 'verification' && <VerificationStep />}
        {signUpStore.step === 'createOrganization' && <CreateOrganizationStep />}
        {signUpStore.step === 'success' && <SuccessStep />}
      </Box>

      {signUpStore.showAlertFlag && (
        <Alert title={signUpStore.alertTitle} message={signUpStore.alertMessage} actions={signUpStore.alertActions} onClose={() => signUpStore.clearAlert()} />
      )}
    </Flex>
  );
});

export default SignUpPage;
