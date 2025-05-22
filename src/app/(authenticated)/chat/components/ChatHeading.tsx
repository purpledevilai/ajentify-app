import { useState, useEffect } from "react";
import { HamburgerIcon, CopyIcon, CheckIcon } from "@chakra-ui/icons";
import {
    Flex,
    Heading,
    Button,
    useBreakpointValue,
    Text,
    HStack,
    useClipboard,
    Modal,
    ModalOverlay,
    ModalContent,
    ModalHeader,
    ModalBody,
    ModalCloseButton,
    useDisclosure,
    Spinner,
    Box
} from "@chakra-ui/react";
import { getContext } from '@/api/context/getContext';
import { Message } from "@/types/context";


interface ChatHeadingProps {
    onMobileChatDrawerOpen: () => void;
    context_id?: string;
}

export const ChatHeading = ({ onMobileChatDrawerOpen, context_id }: ChatHeadingProps) => {
    const isMobile = useBreakpointValue({ base: true, lg: false });
    const { hasCopied, onCopy } = useClipboard(context_id || "");
    const { isOpen, onOpen, onClose } = useDisclosure();
    const [loading, setLoading] = useState(false);
    const [contextData, setContextData] = useState<any>(null);

    const handleOpenModal = async () => {
        if (!context_id) return;
        setLoading(true);
        onOpen();
        try {
            const data = await getContext({ context_id, with_tool_calls: true });
            setContextData(data);
        } catch (err) {
            console.error("Failed to fetch context", err);
        } finally {
            setLoading(false);
        }
    };

    return (
        <Flex mb={2} align="center" justify="space-between">
            <Heading flex="1" as="h1" size="xl">
                Chat
                {context_id && (
                    <HStack spacing={2} mt={1}>
                        <Text fontSize="xs" color="gray.500">{context_id}</Text>
                        <Button
                            size="xs"
                            onClick={onCopy}
                            leftIcon={hasCopied ? <CheckIcon /> : <CopyIcon />}
                            colorScheme={hasCopied ? 'green' : 'blue'}
                            variant="ghost"
                        >
                            {hasCopied ? 'Copied' : 'Copy'}
                        </Button>
                        <Button variant={"outline"} size="sm" onClick={handleOpenModal} ml={4}>
                            All Messages
                        </Button>
                    </HStack>
                )}
            </Heading>
            {isMobile && (
                <Button
                    aria-label={'Open Chat Menu'}
                    leftIcon={<HamburgerIcon />}
                    variant="ghost"
                    onClick={onMobileChatDrawerOpen}
                />
            )}
            <Modal isOpen={isOpen} onClose={onClose} size="xl">
                <ModalOverlay />
                <ModalContent>
                    <ModalHeader>All Messages</ModalHeader>
                    <ModalCloseButton />
                    <ModalBody maxH="60vh" overflowY="auto" pt={2}>
                        {loading ? (
                            <Flex justify="center" py={10}>
                                <Spinner size="xl" />
                            </Flex>
                        ) : (
                            contextData?.messages?.map((msg: Message, idx: number) => {
                                let label = "";
                                let bg = "";
                                let borderColor = "";
                            
                                if ("sender" in msg) {
                                    label = msg.sender === "ai" ? "AI" : "Human";
                                    bg = msg.sender === "ai" ? "gray.700" : "gray.600";
                                    borderColor = msg.sender === "ai" ? "gray.400" : "gray.500";
                                } else if (msg.type === "tool_call") {
                                    label = `Tool Call (${msg.tool_name})`;
                                    bg = "blue.500";
                                    borderColor = "blue.300";
                                } else if (msg.type === "tool_response") {
                                    label = `Tool Response`;
                                    bg = "green.700";
                                    borderColor = "blue.400";
                                }
                            
                                return (
                                    <Box
                                        key={idx}
                                        borderWidth="1px"
                                        borderRadius="md"
                                        borderColor={borderColor}
                                        bg={bg}
                                        p={4}
                                        mb={3}
                                    >
                                        <Text fontWeight="bold" mb={2}>{label}</Text>
                            
                                        {"sender" in msg && (
                                            <Text whiteSpace="pre-wrap">{msg.message}</Text>
                                        )}
                            
                                        {"type" in msg && msg.type === "tool_call" && (
                                            <>
                                                <Text mb={1}>ID: {msg.tool_call_id}</Text>
                                                <Text mb={1}>Input:</Text>
                                                <Box
                                                    as="pre"
                                                    p={3}
                                                    bg="gray.900"
                                                    borderRadius="md"
                                                    overflowX="auto"
                                                    fontSize="sm"
                                                    fontFamily="mono"
                                                >
                                                    {JSON.stringify(msg.tool_input, null, 2)}
                                                </Box>
                                            </>
                                        )}
                            
                                        {"type" in msg && msg.type === "tool_response" && (
                                            <>
                                                <Text mb={1}>ID: {msg.tool_call_id}</Text>
                                                <Text mb={1}>Output:</Text>
                                                <Box
                                                    as="pre"
                                                    p={3}
                                                    bg="gray.900"
                                                    borderRadius="md"
                                                    overflowX="auto"
                                                    fontSize="sm"
                                                    fontFamily="mono"
                                                >
                                                    {JSON.stringify(msg.tool_output, null, 2)}
                                                </Box>
                                            </>
                                        )}
                                    </Box>
                                );
                            })
                        )}
                    </ModalBody>
                </ModalContent>
            </Modal>
        </Flex>
    );
};
