'use client';

import React, { useState } from 'react';
import { observer } from 'mobx-react-lite';
import { authStore } from '@/store/AuthStore';
import {
    Button,
    FormControl,
    FormLabel,
    Input,
    Text,
    Heading,
    Flex,
    Stack,
    IconButton,
    List,
    ListItem,
    Spacer,
} from '@chakra-ui/react';
import { EditIcon, CheckIcon, CloseIcon } from '@chakra-ui/icons';
import { User } from '@/types/user';
import { useAlert } from '@/app/components/AlertProvider';

const ProfilePage = observer(() => {

    const [isEditing, setIsEditing] = useState(false);
    const [editedUser, setEditedUser] = useState<User | undefined>(authStore.user);
    const { showAlert } = useAlert();

    const handleEdit = () => {
        if (!authStore.user) return;
        setEditedUser({ ...authStore.user }); // Create a copy of the current user
        setIsEditing(true);
    };

    const handleCancel = () => {
        if (!authStore.user) return;
        setIsEditing(false);
        setEditedUser({ ...authStore.user }); // Reset to original user state
    };

    const handleSave = async () => {
        try {
            await authStore.updateUserDetails(editedUser!);
            setIsEditing(false);
        } catch (error) {
            console.error('Failed to save user updates:', error);
        }
    };

    const handleChange = (field: "first_name" | "last_name", value: string) => {
        setEditedUser((prev: User | undefined) => {
            if (!prev) return prev;
            return { ...prev, [field]: value }
        });
    };

    const handleDeleteAccount = () => {
        showAlert({
            title: "Delete Account",
            message: "Are you sure you want to delete your account? This action is irreversible.",
            actions: [
                {
                    label: "Cancel",
                    onClick: () => { },
                },
                {
                    label: "Delete Account",
                    onClick: handleConfirmDeleteAccount,
                }
            ]
        });
    }

    const handleConfirmDeleteAccount = async () => {
        if (!authStore.user) return;
        try {
            await authStore.deleteAccount();
        } catch (error) {
            console.error('Failed to delete account:', error);
            showAlert({
                title: "Whoops",
                message: "There was an error deleting your account. Please try again later.",
            })
        }
    }

    return (
        (!authStore.user) ? (
            <Flex justify="center" align="center" h="100vh">
                <Text>Loading...</Text>
            </Flex>
        ) : (
            <Flex maxW="600px" direction="column" mx="auto" mt={10} p={6}>
                <Flex align="center" mb={4}>
                    <Heading as="h2" size="lg">User Profile</Heading>
                    <Spacer />
                    {!isEditing ? (
                        <IconButton
                            aria-label="Edit Profile"
                            icon={<EditIcon />}
                            onClick={handleEdit}
                            variant="ghost"
                        />
                    ) : (
                        <>
                            <IconButton
                                aria-label="Save Profile"
                                icon={<CheckIcon />}
                                onClick={handleSave}
                                variant="ghost"
                                colorScheme="green"
                                mr={2}
                            />
                            <IconButton
                                aria-label="Cancel Edit"
                                icon={<CloseIcon />}
                                onClick={handleCancel}
                                variant="ghost"
                                colorScheme="red"
                            />
                        </>
                    )}
                </Flex>

                <Stack spacing={4}>
                    {/* User ID */}
                    <FormControl>
                        <FormLabel>ID:</FormLabel>
                        <Text>{authStore.user.id}</Text>
                    </FormControl>

                    {/* Email */}
                    <FormControl>
                        <FormLabel>Email:</FormLabel>
                        <Text>{authStore.user.email}</Text>
                    </FormControl>

                    {/* First Name */}
                    <FormControl>
                        <FormLabel>First Name:</FormLabel>
                        {isEditing ? (
                            <Input
                                value={editedUser?.first_name || ''}
                                onChange={(e) => handleChange('first_name', e.target.value)}
                            />
                        ) : (
                            <Text>{authStore.user.first_name}</Text>
                        )}
                    </FormControl>

                    {/* Last Name */}
                    <FormControl>
                        <FormLabel>Last Name:</FormLabel>
                        {isEditing ? (
                            <Input
                                value={editedUser?.last_name || ''}
                                onChange={(e) => handleChange('last_name', e.target.value)}
                            />
                        ) : (
                            <Text>{authStore.user.last_name}</Text>
                        )}
                    </FormControl>

                    {/* Organizations */}
                    <FormControl>
                        <FormLabel>Organizations:</FormLabel>
                        <List spacing={2}>
                            {authStore.user.organizations.map((org) => (
                                <ListItem key={org.id}>
                                    <Text>- {org.name}</Text>
                                </ListItem>
                            ))}
                        </List>
                    </FormControl>
                </Stack>

                {/* Save and Cancel Buttons for Mobile */}
                {isEditing ? (
                    <Flex mt={6} justify="flex-end">
                        <Button colorScheme="green" mr={2} onClick={handleSave}>
                            Save
                        </Button>
                        <Button colorScheme="red" onClick={handleCancel}>
                            Cancel
                        </Button>
                    </Flex>
                ) : (
                    <Button 
                        mt={6}
                        variant="outline"
                        color="red.300"
                        borderColor="red.300"
                        _hover={{bg: "red.300", color: "white"}}
                        onClick={handleDeleteAccount}
                    >
                        Delete Account
                    </Button>
                )}
            </Flex>
        )
    );
});

export default ProfilePage;
