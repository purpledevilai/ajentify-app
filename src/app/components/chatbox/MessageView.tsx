import { Message } from "@/types/context"
import { Flex } from "@chakra-ui/react";
import { ChatBoxStyle } from "@/types/chatboxstyle";

interface MessageViewProps {
    message: Message,
    style: ChatBoxStyle
}

export const MessageView = ({ message, style }: MessageViewProps) => {
    const isAI = message.sender === "ai"
    const messageColor = isAI ? style.ai_message_background_color : style.user_message_background_color
    const messageTextColor = isAI ? style.ai_message_text_color : style.user_message_text_color
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
                fontSize="lg"
            >
                {message.message}
            </Flex>
        </Flex>

    )
}