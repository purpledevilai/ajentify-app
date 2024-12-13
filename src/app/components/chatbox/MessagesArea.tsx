import React, {useEffect, useRef} from "react"
import { Box } from "@chakra-ui/react"
import { MessageView } from "./MessageView"
import { Message } from "@/types/context"
import { TypingIndicator } from "./TypingIndicator"

interface MessageAreaProps {
    messages: Message[]
    responseLoading: boolean
}

export const MessagesArea = ({ messages, responseLoading }: MessageAreaProps) => {
    const messagesRef = useRef<HTMLDivElement>(null);

    const scrollToBottom = () => {
        if (messagesRef.current) {
            messagesRef.current.scrollTo({
                top: messagesRef.current.scrollHeight,
                behavior: "smooth"
            });
        }
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages, responseLoading]);

    return (
        <Box
            ref={messagesRef}
            position="absolute"
            top="0"
            bottom="0"
            width="100%"
            overflowY="auto"
            bg="gray.900"
            p={4}
            pb="160px"
            borderStyle="solid"
            borderColor="white"
            borderWidth={2}
            borderRadius={15}
        >
            {messages.map((message, idx) => (
                <div key={idx}>
                    <MessageView message={message} />
                </div>
            ))}
            {responseLoading && (
                <TypingIndicator />
            )}
        </Box>
    )
}