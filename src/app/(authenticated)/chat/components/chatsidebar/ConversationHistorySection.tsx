import { chatPageStore } from "@/store/ChatPageStore";
import { Box, Flex, Spinner, Text, useColorModeValue } from "@chakra-ui/react";
import { observer } from "mobx-react-lite";
import { ConversationRow } from "./ConversationRow";

export const ConversationHistorySection = observer(() => {

    const bgColor = useColorModeValue("gray.100", "gray.800");
    const dividerColor = useColorModeValue("gray.300", "gray.600");
    const textColor = useColorModeValue("gray.800", "whiteAlpha.900");

    return (
        <Box
            bg={bgColor}
            p={2}
            borderRadius="md"
            flex="1"
            boxShadow="md"
            borderWidth="1px"
            borderColor={dividerColor}
            overflow="hidden"
        >
            <Text fontSize="sm" fontWeight="bold" mb={3} color={textColor}>
                Conversation History
            </Text>
            {chatPageStore.contextHistoryLoading ? (
                <Flex justify="center" align="center" height="100%">
                    <Spinner size="sm" />
                </Flex>
            ) : chatPageStore.contextHistory && chatPageStore.contextHistory.length > 0 ? (
                <Box
                    width="100%"
                    height="100%"
                    position="relative"
                >
                    <Box
                        position="absolute"
                        top="0"
                        bottom="0"
                        width="100%"
                        pb="20px"
                        overflowY="auto"
                    >
                        {chatPageStore.contextHistory.map((contextHistory) => (
                            <div key={contextHistory.context_id}>
                                <ConversationRow contextHistory={contextHistory} />
                            </div>
                        ))}
                    </Box>
                </Box>
            ) : (
                <Text fontSize="xs" color={textColor} textAlign="center" mt={4}>
                    No history available.
                </Text>
            )}
        </Box>
    )
});