'use client';

import React, { useEffect, useRef } from 'react';
import { observer } from 'mobx-react-lite';
import { createTeamStore } from '@/store/CreateTeamStore';
import { Flex, Box } from '@chakra-ui/react';
import { useAlert } from '@/app/components/AlertProvider';
import { BusinessInformationStep } from './components/BusinessInformationStep';
import { SelectMembersStep } from './components/SelectMembersStep';
import { CreatingTeamLoadingStep } from './components/CreateingTeamLoadingStep';
import { SuccessStep } from './components/SuccessStep';
import { reaction } from 'mobx';

const CreateTeamPage = observer(() => {
    const { showAlert } = useAlert();
    createTeamStore.setShowAlert(showAlert);
    const containerRef = useRef<HTMLDivElement | null>(null);

    useEffect(() => {
        return () => {
            createTeamStore.reset();
        };
    }, []);

    useEffect(() => {
        const disposer = reaction(
            () => createTeamStore.step,
            (step) => {
                if (containerRef.current) {
                    const currentIndex = createTeamStore.steps.indexOf(step);
                    const containerWidth = containerRef.current.offsetWidth;

                    // Scroll to the desired position with a custom scroll speed
                    customScrollTo(containerRef.current, currentIndex * containerWidth, 150); // Adjust duration here
                }
            }
        );

        return () => {
            disposer();
        };
    });

    const customScrollTo = (element: HTMLElement, target: number, duration: number) => {
        const start = element.scrollLeft;
        const change = target - start;
        const startTime = performance.now();

        const scroll = (currentTime: number) => {
            const elapsed = currentTime - startTime;
            const progress = Math.min(elapsed / duration, 1); // Clamp progress to [0, 1]
            const easeInOutQuad = progress < 0.5
                ? 2 * progress * progress
                : 1 - Math.pow(-2 * progress + 2, 2) / 2; // Ease-in-out effect

            element.scrollLeft = start + change * easeInOutQuad;

            if (elapsed < duration) {
                requestAnimationFrame(scroll);
            }
        };

        requestAnimationFrame(scroll);
    };

    const getAllSteps = () => [
        <BusinessInformationStep key="business-information" />,
        <SelectMembersStep key="select-members" />,
        <CreatingTeamLoadingStep key="creating-agents" />,
        <SuccessStep key="success" />,
    ];

    return (
        <Flex
            align="center"
            justify="center"
            height="100%"
            bg="gray.50"
            _dark={{ bg: 'gray.900' }}
            overflow="hidden"
        >
            <Box
                ref={containerRef}
                display="flex"
                width="100%"
                height="100%"
                overflow="hidden"
            >
                {getAllSteps().map((step, index) => (
                    <Box
                        key={index}
                        flex="none"
                        width="100%"
                        height="100%"
                        display="flex"
                        alignItems="center"
                        justifyContent="center"
                    >
                        {step}
                    </Box>
                ))}
            </Box>
        </Flex>
    );
});

export default CreateTeamPage;
