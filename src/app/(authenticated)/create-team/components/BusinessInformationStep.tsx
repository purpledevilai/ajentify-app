import React from 'react';
import { observer } from 'mobx-react-lite';
import { Stack, Button, Heading, Text, Input, Textarea } from '@chakra-ui/react';
import { CloseIcon } from "@chakra-ui/icons";
import { createTeamStore } from '@/store/CreateTeamStore';
import { useAlert } from '@/app/components/AlertProvider';

export const BusinessInformationStep = observer(() => {

    const { showAlert } = useAlert();

    const handleNext = () => {
        // Check if the business name and description are not empty
        if (!createTeamStore.businessName || !createTeamStore.businessDescription) {
            showAlert({
                title: 'Error',
                message: 'Please fill in the business name and description.',
            });
            return;
        }

        // Get links data if any
        if (createTeamStore.linkData.some((link) => link.link)) {
            createTeamStore.getLinkData();
        }

        createTeamStore.stepForward();
    }

    return (
        <Stack
            spacing={4}
            overflow="scroll"
            width="100%" // Ensure full width
            maxWidth="600px" // Prevent restricting width
            px={4} // Add padding for better spacing
        >
            <Heading as="h1" size="lg">
                Business Information
            </Heading>
            <Text>
                Let's get started by entering your business information.
            </Text>
            <Text>
                What's your business's name?
            </Text>
            <Input
                placeholder="Business Name"
                value={createTeamStore.businessName}
                onChange={(e) => createTeamStore.setBusinessName(e.target.value)}
                minH="40px"
                mb={4}
            />
            <Text>
                In your own words, describe your business.
            </Text>
            <Textarea
                placeholder="Business Description"
                value={createTeamStore.businessDescription}
                onChange={(e) => createTeamStore.setBusinessDescription(e.target.value)}
                mb={4}
            />
            <Text>
                Add any links with information about your business.
            </Text>
            {createTeamStore.linkData.map((link, index) => (
                <Stack
                    key={index}
                    direction="row"
                    spacing={2}
                    align="center"
                >
                    <Input
                        placeholder={link.placeholder}
                        value={link.link}
                        onChange={(e) => createTeamStore.setLink(index, e.target.value)}
                        minH="40px"
                        width="100%" // Ensure the input respects the available width
                    />
                    {link.link && (
                        <CloseIcon
                            color="gray.500"
                            _hover={{ color: "gray.400" }}
                            onClick={() => createTeamStore.removeLink(index)}
                            cursor="pointer"
                        />
                    )}
                </Stack>
            ))}
            <Button
                bg="gray.500"
                _hover={{ bg: "gray.300" }}
                onClick={() => createTeamStore.addLink()}
                minH="40px"
                mb={6}
                width="100%" // Button stretches to container width
            >
                Add Link
            </Button>

            <Button
                bg="brand.500"
                _hover={{ bg: "brand.300" }}
                onClick={handleNext}
                minH="40px"
                width="100%" // Button stretches to container width
            >
                Next
            </Button>
        </Stack>
    );
});
