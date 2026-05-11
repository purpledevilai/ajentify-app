'use client';

import React, { useRef, useState } from 'react';
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
    AlertDialog,
    AlertDialogBody,
    AlertDialogContent,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogOverlay,
    useDisclosure,
} from '@chakra-ui/react';
import { EditIcon, CheckIcon, CloseIcon } from '@chakra-ui/icons';
import { User } from '@/types/user';
import { InlineError } from '@/app/components/InlineError';

const ProfilePage = observer(() => {

    const [isEditing, setIsEditing] = useState(false);
    const [editedUser, setEditedUser] = useState<User | undefined>(authStore.user);
    const [deleteError, setDeleteError] = useState<string | null>(null);
    const [isDeleting, setIsDeleting] = useState(false);
    const { isOpen: isDeleteOpen, onOpen: onDeleteOpen, onClose: onDeleteClose } = useDisclosure();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const cancelRef = useRef<any>(null);

    const handleEdit = () => {
        if (!authStore.user) return;
        setEditedUser({ ...authStore.user });
        setIsEditing(true);
    };

    const handleCancel = () => {
        if (!authStore.user) return;
        setIsEditing(false);
        setEditedUser({ ...authStore.user });
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

    const handleConfirmDeleteAccount = async () => {
        if (!authStore.user) return;
        setDeleteError(null);
        setIsDeleting(true);
        try {
            await authStore.deleteAccount();
        } catch (error) {
            console.error('Failed to delete account:', error);
            setDeleteError('There was an error deleting your account. Please try again later.');
        } finally {
            setIsDeleting(false);
            onDeleteClose();
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

                {deleteError && <InlineError message={deleteError} />}

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
                        onClick={onDeleteOpen}
                    >
                        Delete Account
                    </Button>
                )}

                <AlertDialog isOpen={isDeleteOpen} leastDestructiveRef={cancelRef} onClose={onDeleteClose} isCentered>
                    <AlertDialogOverlay />
                    <AlertDialogContent>
                        <AlertDialogHeader fontSize="lg" fontWeight="bold">Delete Account</AlertDialogHeader>
                        <AlertDialogBody>
                            Are you sure you want to delete your account? This action is irreversible.
                        </AlertDialogBody>
                        <AlertDialogFooter gap={3}>
                            <Button ref={cancelRef} onClick={onDeleteClose} isDisabled={isDeleting}>Cancel</Button>
                            <Button colorScheme="red" onClick={handleConfirmDeleteAccount} isLoading={isDeleting} loadingText="Deleting…">
                                Delete Account
                            </Button>
                        </AlertDialogFooter>
                    </AlertDialogContent>
                </AlertDialog>
            </Flex>
        )
    );
});

export default ProfilePage;
