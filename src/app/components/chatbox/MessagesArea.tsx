import React, { useEffect, useRef } from "react"
import { Box } from "@chakra-ui/react"
import { MessageView } from "./MessageView"
import { Message } from "@/types/context"
import { TypingIndicator } from "./TypingIndicator"
import { ChatBoxStyle } from "@/types/chatboxstyle"
import { ToolCallIndicator } from "./ToolCallIndicator"

interface MessageAreaProps {
    messages: Message[];
    responseLoading: boolean;
    style: ChatBoxStyle;
    activeToolCall: { name: string, input: string } | null;
}

export const MessagesArea = ({ messages, responseLoading, style, activeToolCall }: MessageAreaProps) => {
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
            bg={style.background_color}
            p={4}
            pb="160px"
            borderStyle="solid"
            borderColor={style.border_color}
            borderWidth="2px"
            borderRadius="15px"
        >
            {messages.map((message, idx) => (
                <div key={idx}>
                    <MessageView message={message} style={style} />
                </div>
            ))}
            {responseLoading && (
                <>
                    <TypingIndicator style={style} />
                    <ToolCallIndicator toolCall={activeToolCall} />
                </>
            )}
        </Box>
    )
}