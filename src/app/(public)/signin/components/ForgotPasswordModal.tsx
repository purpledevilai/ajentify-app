'use client';

import React from 'react';
import { observer } from 'mobx-react-lite';
import { Modal, ModalOverlay, ModalContent, ModalHeader, ModalCloseButton, ModalBody, ModalFooter, Button, Input, FormControl, FormLabel, Text } from '@chakra-ui/react';
import { authStore } from '@/store/AuthStore';

interface ForgotPasswordModalProps {
    isOpen: boolean;
    onClose: () => void;
}

const ForgotPasswordModal = observer(({ isOpen, onClose }: ForgotPasswordModalProps) => {
    const handleForgotPassword = async () => {
        await authStore.submitForgotPassword();
    };

    const handleResetPassword = async () => {
        await authStore.submitResetPassword();
    };

    const resetFlow = () => {
        authStore.resetForgotPasswordFlow();
        onClose();
    };

    return (
        <Modal isOpen={isOpen} onClose={resetFlow} isCentered>
            <ModalOverlay />
            <ModalContent>
                <ModalHeader>Forgot Password</ModalHeader>
                <ModalCloseButton />
                <ModalBody>
                    {authStore.forgotPasswordStep === 'email' && (
                        <FormControl isRequired>
                            <FormLabel>Email</FormLabel>
                            <Input
                                type="email"
                                value={authStore.email}
                                onChange={(e) => authStore.setField('email', e.target.value)}
                                placeholder="Enter your email"
                            />
                            {authStore.forgotPasswordError && (
                                <Text color="red.500">{authStore.forgotPasswordError}</Text>
                            )}
                        </FormControl>
                    )}

                    {authStore.forgotPasswordStep === 'code' && (
                        <>
                            <FormControl isRequired>
                                <FormLabel>Verification Code</FormLabel>
                                <Input
                                    type="text"
                                    value={authStore.resetPasswordCode}
                                    onChange={(e) => authStore.setField('resetPasswordCode', e.target.value)}
                                />
                            </FormControl>
                            <FormControl isRequired mt={4}>
                                <FormLabel>New Password</FormLabel>
                                <Input
                                    type="password"
                                    value={authStore.newPassword}
                                    onChange={(e) => authStore.setField('newPassword', e.target.value)}
                                />
                            </FormControl>
                            {authStore.forgotPasswordError && (
                                <Text color="red.500">{authStore.forgotPasswordError}</Text>
                            )}
                        </>
                    )}

                    {authStore.forgotPasswordStep === 'completed' && (
                        <Text>Password reset successfully! Please log in with your new password.</Text>
                    )}
                </ModalBody>
                <ModalFooter>
                    {authStore.forgotPasswordStep === 'email' && (
                        <Button onClick={handleForgotPassword} isLoading={authStore.forgotPasswordLoading}>
                            Send Verification Code
                        </Button>
                    )}
                    {authStore.forgotPasswordStep === 'code' && (
                        <Button onClick={handleResetPassword} isLoading={authStore.forgotPasswordLoading}>
                            Reset Password
                        </Button>
                    )}
                    {authStore.forgotPasswordStep === 'completed' && (
                        <Button onClick={resetFlow}>Close</Button>
                    )}
                </ModalFooter>
            </ModalContent>
        </Modal>
    );
});

export default ForgotPasswordModal;
