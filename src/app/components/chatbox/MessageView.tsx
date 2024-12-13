import { Message } from "@/types/context"
import { Flex } from "@chakra-ui/react";

interface MessageViewProps {
    message: Message,
}

export const MessageView = ({ message }: MessageViewProps) => {
    const isAI = message.from === "ai"
    const messageColor = isAI ? "gray.200" : "gray.500"
    const messageTextColor = isAI ? "gray.900" : "gray.200"
    const maxWidth = "400px";
    return (
        <Flex
            justifyContent={isAI ? "start" : "end"}
        >
            <Flex
                bg={messageColor}
                color={messageTextColor}
                mb={2}
                p={2}
                align="center"
                justify="center"
                borderRadius="md"
                maxWidth={maxWidth}
            >
                {message.message}
            </Flex>
        </Flex>

    )
}