'use client';

import React from 'react';
import { observer } from 'mobx-react-lite';
import { Modal, ModalOverlay, ModalContent, ModalHeader, ModalCloseButton, ModalBody, ModalFooter, Button, Input, FormControl, FormLabel, Text } from '@chakra-ui/react';
import { useAuthFlowStores } from '@/store/AuthFlowStoreContext';

interface ForgotPasswordModalProps {
    isOpen: boolean;
    onClose: () => void;
}

const ForgotPasswordModal = observer(({ isOpen, onClose }: ForgotPasswordModalProps) => {
    const { auth } = useAuthFlowStores();
    const handleForgotPassword = async () => {
        await auth.submitForgotPassword();
    };

    const handleResetPassword = async () => {
        await auth.submitResetPassword();
    };

    const resetFlow = () => {
        auth.resetForgotPasswordFlow();
        onClose();
    };

    return (
        <Modal isOpen={isOpen} onClose={resetFlow} isCentered>
            <ModalOverlay />
            <ModalContent>
                <ModalHeader>Forgot Password</ModalHeader>
                <ModalCloseButton />
                <ModalBody>
                    {auth.forgotPasswordStep === 'email' && (
                        <FormControl isRequired>
                            <FormLabel>Email</FormLabel>
                            <Input
                                type="email"
                                value={auth.email}
                                onChange={(e) => auth.setField('email', e.target.value)}
                                placeholder="Enter your email"
                            />
                            {auth.forgotPasswordError && (
                                <Text color="red.500">{auth.forgotPasswordError}</Text>
                            )}
                        </FormControl>
                    )}

                    {auth.forgotPasswordStep === 'code' && (
                        <>
                            <FormControl isRequired>
                                <FormLabel>Verification Code</FormLabel>
                                <Input
                                    type="text"
                                    value={auth.resetPasswordCode}
                                    onChange={(e) => auth.setField('resetPasswordCode', e.target.value)}
                                />
                            </FormControl>
                            <FormControl isRequired mt={4}>
                                <FormLabel>New Password</FormLabel>
                                <Input
                                    type="password"
                                    value={auth.newPassword}
                                    onChange={(e) => auth.setField('newPassword', e.target.value)}
                                />
                            </FormControl>
                            {auth.forgotPasswordError && (
                                <Text color="red.500">{auth.forgotPasswordError}</Text>
                            )}
                        </>
                    )}

                    {auth.forgotPasswordStep === 'completed' && (
                        <Text>Password reset successfully! Please log in with your new password.</Text>
                    )}
                </ModalBody>
                <ModalFooter>
                    {auth.forgotPasswordStep === 'email' && (
                        <Button onClick={handleForgotPassword} isLoading={auth.forgotPasswordLoading}>
                            Send Verification Code
                        </Button>
                    )}
                    {auth.forgotPasswordStep === 'code' && (
                        <Button onClick={handleResetPassword} isLoading={auth.forgotPasswordLoading}>
                            Reset Password
                        </Button>
                    )}
                    {auth.forgotPasswordStep === 'completed' && (
                        <Button onClick={resetFlow}>Close</Button>
                    )}
                </ModalFooter>
            </ModalContent>
        </Modal>
    );
});

export default ForgotPasswordModal;
