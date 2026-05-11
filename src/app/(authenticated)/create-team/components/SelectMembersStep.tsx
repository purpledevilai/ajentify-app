import React, { useState } from 'react';
import { observer } from 'mobx-react-lite';
import { Stack, Button, Heading, Text, Grid, useColorModeValue, GridItem, Box } from '@chakra-ui/react';
import Card from '@/app/components/Card';
import { teamMemberTemplates } from '@/store/CreateTeamStore';
import { useStores } from '@/store/StoreContext';
import { InlineError } from '@/app/components/InlineError';

export const SelectMembersStep = observer(() => {
    const { createTeam: createTeamStore } = useStores();

    const cardBg = useColorModeValue("gray.100", "gray.800");
    const [validationError, setValidationError] = useState<string | null>(null);

    const handleNext = () => {

        if (createTeamStore.gettingLinkData) {
            setValidationError('Still fetching data for the links you provided. Should be just a moment!');
            return;
        }
        if (createTeamStore.selectedMembers.length === 0) {
            setValidationError('Please select at least one team member.');
            return;
        }

        setValidationError(null);
        createTeamStore.submitCreateTeam()
        createTeamStore.stepForward();
    };

    return (
        <Stack
            spacing={4}
            overflow="auto"
            width="100%"
            maxWidth="600px"
            px={4}
        >
            <Heading as="h1">
                Select Team Members
            </Heading>
            <Text>
                Select the team members you want to add to your team.
            </Text>
            <Grid
                templateColumns={{
                    base: "repeat(1, 1fr)",
                    md: "repeat(2, 1fr)",
                }}
                gap={4}
                width="100%"
                maxWidth="100%"
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
                            width="100%"
                        >
                            <Heading as="h2" size="md">
                                {template.name}
                            </Heading>
                        </Card>
                    </GridItem>
                ))}
            </Grid>
            {validationError && <InlineError message={validationError} />}
            {createTeamStore.submitCreateTeamError && (
                <InlineError message={createTeamStore.submitCreateTeamError} />
            )}
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
