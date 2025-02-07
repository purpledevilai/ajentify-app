'use client';

import React from 'react';
import { observer } from 'mobx-react-lite';
import { Flex, Box, Button } from '@chakra-ui/react';
import { ArrowBackIcon } from '@chakra-ui/icons';
import { signUpStore } from '@/store/SignUpStore';
import UserDetailsStep from './components/UserDetailsStep';
import VerificationStep from './components/VerificationStep';
import CreateOrganizationStep from './components/CreateOrganizationStep';
import SuccessStep from './components/SuccessStep';
import Alert from '@/app/components/Alert';
import { motion, AnimatePresence } from 'framer-motion';
import { useRouter } from 'next/navigation';
import Header from '../landing/components/Header';


const SignUpPage = observer(() => {
    const router = useRouter();

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
            height="100vh"
            width="100vw"
            backgroundImage="/Img/cyberbg.jpg"
            backgroundSize="cover"
            backgroundPosition="center"
            backgroundRepeat="no-repeat"
            flexDirection="column"
            alignItems="center"
            justifyContent="center"
            position="relative"
            color="white"
            fontFamily="Montserrat"
        >
            
            
            {/* Back Button */}
            <Button
                leftIcon={<ArrowBackIcon />}
                variant="link"
                position="absolute"
                top="4"
                left="4"
                zIndex="10" // Ensure it's above other elements
                onClick={() => {
                    router.back();
                }}
            >
                Back
            </Button>

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
                borderRadius="xl"
                boxShadow="xl"
                p={10}
                width="100%"
                height="55%"
                maxWidth="500px"
                textAlign="center"
            >

                <Box
                    width="full"
                    maxWidth="lg"
                    position="relative"
                    overflow="hidden"
                    height="100%"
                >
                    <AnimatePresence mode="wait">
                        <motion.div
                            key={signUpStore.step} // Unique key for each step
                            initial={{ x: '100%', opacity: 0 }} // Start offscreen to the right
                            animate={{ x: 0, opacity: 1 }} // Slide in
                            exit={{ x: '-100%', opacity: 0 }} // Slide out to the left
                            transition={{ duration: 0.25 }} // Animation duration
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
                            {getCurrentStepComponent()} {/* Render the current step dynamically */}
                        </motion.div>
                    </AnimatePresence>
                </Box>
            </Box>

            {signUpStore.showAlertFlag && (
                <Alert
                    title={signUpStore.alertTitle}
                    message={signUpStore.alertMessage}
                    actions={signUpStore.alertActions}
                    onClose={() => signUpStore.clearAlert()}
                />
            )}
        </Flex>
    );
});

export default SignUpPage;
