'use client';

import React, { useEffect, useState, useCallback } from 'react';
import { observer } from 'mobx-react-lite';
import {
    Box,
    Flex,
    Heading,
    Text,
    Button,
    Spinner,
    Table,
    Thead,
    Tbody,
    Tr,
    Th,
    Td,
    Badge,
    useColorModeValue,
    Modal,
    ModalOverlay,
    ModalContent,
    ModalHeader,
    ModalBody,
    ModalFooter,
    ModalCloseButton,
    useDisclosure,
    Input,
    InputGroup,
    InputRightElement,
    IconButton,
    useClipboard,
} from '@chakra-ui/react';
import { CopyIcon, CheckIcon } from '@chakra-ui/icons';
import { authStore } from '@/store/AuthStore';
import { getAPIKeys, APIKeySummary } from '@/api/apikey/getAPIKeys';
import { generateAPIKey } from '@/api/apikey/generateAPIKey';
import { revokeAPIKey } from '@/api/apikey/revokeAPIKey';
import { useAlert } from '@/app/components/AlertProvider';

const APIKeysPage = observer(() => {
    const [apiKeys, setApiKeys] = useState<APIKeySummary[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [creating, setCreating] = useState(false);
    const [newToken, setNewToken] = useState<string | null>(null);

    const { isOpen, onOpen, onClose } = useDisclosure();
    const { onCopy, hasCopied } = useClipboard(newToken || '');
    const { showAlert } = useAlert();

    const cardBg = useColorModeValue('white', 'gray.800');

    const fetchKeys = useCallback(async () => {
        if (!authStore.signedIn) return;
        setLoading(true);
        setError(null);
        try {
            const data = await getAPIKeys();
            setApiKeys(data.api_keys);
        } catch (err) {
            setError((err as Error).message);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchKeys();
    }, [fetchKeys]);

    const handleCreate = async () => {
        if (!authStore.user || authStore.user.organizations.length === 0) return;
        setCreating(true);
        try {
            const orgId = authStore.user.organizations[0].id;
            const result = await generateAPIKey(orgId);
            setNewToken(result.token);
            onOpen();
            await fetchKeys();
        } catch (err) {
            showAlert({
                title: 'Error',
                message: (err as Error).message || 'Failed to create API key.',
            });
        } finally {
            setCreating(false);
        }
    };

    const handleRevoke = (apiKeyId: string) => {
        showAlert({
            title: 'Revoke API Key',
            message: 'Are you sure you want to revoke this API key? This action cannot be undone and any integrations using this key will stop working.',
            actions: [
                { label: 'Cancel', onClick: () => {} },
                {
                    label: 'Revoke',
                    onClick: async () => {
                        try {
                            await revokeAPIKey(apiKeyId);
                            await fetchKeys();
                        } catch (err) {
                            showAlert({
                                title: 'Error',
                                message: (err as Error).message || 'Failed to revoke API key.',
                            });
                        }
                    },
                },
            ],
        });
    };

    const handleModalClose = () => {
        setNewToken(null);
        onClose();
    };

    const formatDate = (timestamp: number) => {
        return new Date(timestamp * 1000).toLocaleDateString(undefined, {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
        });
    };

    return (
        <Box p={6} maxW="1100px" mx="auto" overflowY="auto" h="100%">
            <Flex justify="space-between" align="center" mb={6}>
                <Heading as="h1" size="xl">
                    API Keys
                </Heading>
                <Button
                    colorScheme="brand"
                    onClick={handleCreate}
                    isLoading={creating}
                    loadingText="Creating..."
                >
                    Create API Key
                </Button>
            </Flex>

            {loading && (
                <Flex justify="center" py={12}>
                    <Spinner size="lg" />
                </Flex>
            )}

            {error && (
                <Box p={4} mb={6} bg="red.50" _dark={{ bg: 'red.900' }} borderRadius="md">
                    <Text color="red.500">{error}</Text>
                </Box>
            )}

            {!loading && !error && apiKeys.length === 0 && (
                <Box bg={cardBg} p={8} borderRadius="lg" shadow="sm" textAlign="center">
                    <Text color="gray.500" mb={4}>
                        No API keys yet. Create one to get started with the Ajentify API.
                    </Text>
                </Box>
            )}

            {!loading && apiKeys.length > 0 && (
                <Box bg={cardBg} borderRadius="lg" shadow="sm" overflowX="auto">
                    <Table variant="simple" size="sm">
                        <Thead>
                            <Tr>
                                <Th>Key</Th>
                                <Th>Created</Th>
                                <Th>Status</Th>
                                <Th isNumeric>Actions</Th>
                            </Tr>
                        </Thead>
                        <Tbody>
                            {apiKeys.map((key) => (
                                <Tr key={key.api_key_id}>
                                    <Td fontFamily="mono" fontSize="sm">
                                        {key.token_hint}
                                    </Td>
                                    <Td>{formatDate(key.created_at)}</Td>
                                    <Td>
                                        <Badge colorScheme={key.valid ? 'green' : 'red'}>
                                            {key.valid ? 'Active' : 'Revoked'}
                                        </Badge>
                                    </Td>
                                    <Td isNumeric>
                                        {key.valid && (
                                            <Button
                                                size="xs"
                                                colorScheme="red"
                                                variant="outline"
                                                onClick={() => handleRevoke(key.api_key_id)}
                                            >
                                                Revoke
                                            </Button>
                                        )}
                                    </Td>
                                </Tr>
                            ))}
                        </Tbody>
                    </Table>
                </Box>
            )}

            {/* New Token Modal - shown once after creation */}
            <Modal isOpen={isOpen} onClose={handleModalClose} size="lg">
                <ModalOverlay />
                <ModalContent>
                    <ModalHeader>API Key Created</ModalHeader>
                    <ModalCloseButton />
                    <ModalBody>
                        <Text mb={4}>
                            Your new API key has been created. Copy it now — you will not be able to see it again.
                        </Text>
                        <InputGroup>
                            <Input
                                value={newToken || ''}
                                isReadOnly
                                fontFamily="mono"
                                fontSize="sm"
                                pr="3rem"
                            />
                            <InputRightElement>
                                <IconButton
                                    aria-label="Copy API key"
                                    icon={hasCopied ? <CheckIcon /> : <CopyIcon />}
                                    size="sm"
                                    variant="ghost"
                                    onClick={onCopy}
                                />
                            </InputRightElement>
                        </InputGroup>
                    </ModalBody>
                    <ModalFooter>
                        <Button onClick={handleModalClose}>Done</Button>
                    </ModalFooter>
                </ModalContent>
            </Modal>
        </Box>
    );
});

export default APIKeysPage;
