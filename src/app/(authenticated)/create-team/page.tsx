'use client';

import React, { useEffect } from 'react';
import { observer } from 'mobx-react-lite';
import { createTeamStore }  from '@/store/CreateTeamStore';
import { Flex, Box, Button, Text } from '@chakra-ui/react';
import { ArrowBackIcon } from '@chakra-ui/icons';
import { motion, AnimatePresence } from 'framer-motion';
import { useAlert } from '@/app/components/AlertProvider';
import { BusinessInformationStep } from './components/BusinessInformationStep';


const CreateTeamPage = observer(() => {

    const { showAlert } = useAlert();

    useEffect(() => {
        createTeamStore.setShowAlert(showAlert);

        return () => {
            createTeamStore.reset();
        };
    }, []);

    const getCurrentStepComponent = () => {
        switch (createTeamStore.step) {
            case 'busines-information':
                return <BusinessInformationStep />;
            case 'select-members':
                return <Text>Members</Text>;
            case 'creating-agents':
                return <Text>Creating Agents</Text>;
            case 'success':
                return <Text>Success</Text>;
            default:
                return null;
        }
    };

    return (
        <Flex
            align="center"
            justify="center"
            height="100%"
            bg="gray.50"
            _dark={{ bg: 'gray.900' }}
            overflow-y="auto"
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
                        key={createTeamStore.step} // Unique key for each step
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
        </Flex>
    );
});

export default CreateTeamPage;
