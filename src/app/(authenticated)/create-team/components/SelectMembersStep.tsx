import React from 'react';
import { observer } from 'mobx-react-lite';
import { Stack, Button, Heading, Text, Grid, useColorModeValue, GridItem, Box } from '@chakra-ui/react';
import Card from '@/app/components/Card';
import { createTeamStore, teamMemberTemplates } from '@/store/CreateTeamStore';
import { useAlert } from '@/app/components/AlertProvider';

export const SelectMembersStep = observer(() => {

    const cardBg = useColorModeValue("gray.100", "gray.800");

    const { showAlert } = useAlert();

    const handleNext = () => {

        if (createTeamStore.gettingLinkData) {
            showAlert({
                title: 'Whoops!',
                message: 'Still fetching data for the links you provided. Should be just a moment!',
            });
            return;
        }
        if (createTeamStore.selectedMembers.length === 0) {
            showAlert({
                title: 'Error',
                message: 'Please select at least one team member.',
            });
            return;
        }

        createTeamStore.submitCreateTeam()
        createTeamStore.stepForward();
    };

    return (
        <Stack
            spacing={4}
            overflow="auto" // Ensure the content scrolls if it overflows vertically
            width="100%" // Ensure Stack doesn't overflow horizontally
            maxWidth="600px" // Prevent horizontal overflow on mobile
            px={4} // Add horizontal padding for better mobile spacing
        >
            <Heading as="h1">
                Select Team Members
            </Heading>
            <Text>
                Select the team members you want to add to your team.
            </Text>
            <Grid
                templateColumns={{
                    base: "repeat(1, 1fr)", // 1 column for small screens
                    md: "repeat(2, 1fr)",   // 2 columns for medium screens
                }}
                gap={4}
                width="100%"
                maxWidth="100%" // Prevent horizontal overflow
                mb={4}
            >
                {teamMemberTemplates.map((template) => (
                    <GridItem key={template.id}>
                        <Card
                            shadow="md"
                            _hover={{ shadow: 'lg' }}
                            bg={createTeamStore.selectedMembers.includes(template.id) ? 'brand.300' : cardBg}
                            _dark={{ bg: createTeamStore.selectedMembers.includes(template.id) ? 'brand.600' : 'gray.700' }}
                            cursor="pointer"
                            onClick={() => createTeamStore.toggleMember(template.id)}
                            minHeight="150px"
                            width="100%" // Ensure Card fills its parent container
                        >
                            <Heading as="h2" size="md">
                                {template.name}
                            </Heading>
                        </Card>
                    </GridItem>
                ))}
            </Grid>
            <Box display="flex" justifyContent="space-between" gap={4}>
                <Button
                    variant={'outline'}
                    onClick={() => createTeamStore.stepBack()}
                    flex={1}
                >
                    Back
                </Button>
                <Button
                    onClick={handleNext}
                    flex={1}
                >
                    Next
                </Button>
            </Box>
        </Stack>
    );
});
