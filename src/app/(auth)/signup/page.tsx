'use client';

import React, { useEffect } from 'react';
import { observer } from 'mobx-react-lite';
import { Flex, Box, Button } from '@chakra-ui/react';
import { ArrowBackIcon } from '@chakra-ui/icons';
import { signUpStore } from '@/store/SignUpStore';
import UserDetailsStep from './components/UserDetailsStep';
import VerificationStep from './components/VerificationStep';
import CreateOrganizationStep from './components/CreateOrganizationStep';
import SuccessStep from './components/SuccessStep';
import { motion, AnimatePresence } from 'framer-motion';
import { useRouter } from 'next/navigation';


const SignUpPage = observer(() => {
    const router = useRouter();


    useEffect(() => {
        return () => {
            signUpStore.reset();
        };
    }, []);

    const getCurrentStepComponent = () => {
        switch (signUpStore.step) {
            case 'userDetails':
                return <UserDetailsStep />;
            case 'verification':
                return <VerificationStep />;
            case 'createOrganization':
                return <CreateOrganizationStep />;
            case 'success':
                return <SuccessStep />;
            default:
                return null;
        }
    };

    return (
        <Flex
            align="center"
            justify="center"
            height="100vh"
            bg="gray.50"
            _dark={{ bg: 'gray.900' }}
            overflow="hidden"
        >
            {/* Back Button */}
            <Button
                leftIcon={<ArrowBackIcon />}
                variant="link"
                position="absolute"
                top="4"
                left="4"
                zIndex="10"
                onClick={() => {
                    router.back();
                }}
            >
                Back
            </Button>

            <Box
                width="full"
                maxWidth="lg"
                position="relative"
                overflow="hidden"
                height="100%"
            >
                <AnimatePresence mode="wait">
                    <motion.div
                        key={signUpStore.step}
                        initial={{ x: '100%', opacity: 0 }}
                        animate={{ x: 0, opacity: 1 }}
                        exit={{ x: '-100%', opacity: 0 }}
                        transition={{ duration: 0.25 }}
                        style={{
                            position: 'absolute',
                            width: '100%',
                            height: '100%',
                            top: 0,
                            left: 0,
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                            justifyContent: 'center',
                        }}
                    >
                        {getCurrentStepComponent()}
                    </motion.div>
                </AnimatePresence>
            </Box>
        </Flex>
    );
});

export default SignUpPage;
