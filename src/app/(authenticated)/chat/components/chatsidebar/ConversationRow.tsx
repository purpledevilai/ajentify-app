import { chatPageStore } from "@/store/ChatPageStore";
import { ContextHistory } from "@/types/contexthistory";
import { formatTimestamp } from "@/utils/formattimestamp";
import { CloseIcon } from "@chakra-ui/icons";
import { Flex, Box, IconButton, Text, useColorModeValue } from "@chakra-ui/react";
import { observer } from "mobx-react-lite";

interface ConversationRowProps {
    contextHistory: ContextHistory;
}

export const ConversationRow = observer(({ contextHistory }: ConversationRowProps) => {

    const hoverBgColor = useColorModeValue("gray.200", "gray.700");
    const textColor = useColorModeValue("gray.800", "whiteAlpha.900");
    const deleteButtonColor = useColorModeValue("gray.500", "gray.400");
    const deleteButtonHoverColor = useColorModeValue("gray.600", "gray.500");

    return (
        <Flex
            role="group"
            _hover={{ bg: hoverBgColor, cursor: "pointer" }}
            p={2}
            borderRadius="md"
            mb={4}
            align="center"
            justify="space-between"
            onClick={() => chatPageStore.selectContext(contextHistory.context_id, contextHistory.agent.agent_name)}
        >
            <Box flex="1">
                <Flex direction="row" justify="space-between" align="center" mb={1}>
                    <Text fontWeight="semibold" fontSize="xs" color={textColor}>
                        {contextHistory.agent.agent_name}
                    </Text>
                    <Text fontSize="xs" color={textColor}>
                        {formatTimestamp(contextHistory.time_stamp)}
                    </Text>
                </Flex>
                <Text
                    fontSize="xs"
                    color={textColor}
                    noOfLines={2} // Ensures fixed height and ellipsis for long text
                    overflow="hidden"
                    textOverflow="ellipsis"
                >
                    {contextHistory.last_message}
                </Text>
            </Box>

            {/* Delete Button (Visible on Hover) */}
            <IconButton
                aria-label="Delete conversation"
                icon={<CloseIcon />}
                size="xs"
                variant="ghost"
                color={deleteButtonColor}
                opacity="0"
                _groupHover={{ opacity: 1 }}
                _hover={{ bg: "transparent", color: deleteButtonHoverColor }}
                onClick={(e) => {
                    e.stopPropagation();
                    chatPageStore.deleteContext(contextHistory.context_id);
                }}
            />
        </Flex>
    )
});