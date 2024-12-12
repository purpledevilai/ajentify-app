import React, { useState, useEffect, useRef } from "react";
import { Box, Flex, Textarea, Button } from "@chakra-ui/react";
import { MessageView } from "./MessageView";

export interface Message {
    from: "ai" | "user";
    message: string;
}

export interface Context {
    messages: Message[];
}

interface ChatBoxProps {
    context: Context;
}

export const ChatBox = ({ context }: ChatBoxProps) => {
    const [inputValue, setInputValue] = useState("");
    const textareaRef = useRef<HTMLTextAreaElement>(null);

    useEffect(() => {
        adjustTextareaHeight();
    }, [])

    const onSendMessage = (message: string) => {
        console.log(message)
    }

    const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
        if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault();
            if (inputValue.trim()) {
                onSendMessage(inputValue);
                setInputValue(""); // Clear the input after sending
            }
        }
    };

    const handleSendClick = () => {
        if (inputValue.trim()) {
            onSendMessage(inputValue);
            setInputValue(""); // Clear the input after sending
        }
    };

    const handleInput = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
        setInputValue(e.target.value);
        adjustTextareaHeight();
    };

    const adjustTextareaHeight = () => {
        if (textareaRef.current) {
            textareaRef.current.style.height = "auto"; // Reset height to recalculate
            textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 120)}px`; // Grow up to 5 lines
        }
    };

    return (
        <Box width="100%" height="100%" position="relative">
            {/* Messages View */}
            <Box
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
                {context.messages.map((message, idx) => (
                    <div key={idx}>
                        <MessageView message={message} />
                    </div>
                ))}
            </Box>

            {/* Input Section */}
            <Flex
                position="absolute"
                bottom="2px"
                right="2px"
                left="2px"
                bg="gray.400"
                p={4}
                alignItems="center"
                borderRadius={15}
                borderBottomRadius={13}
                boxShadow="0 -2px 5px rgba(0, 0, 0, 0.2)"
            >
                <Textarea
                    ref={textareaRef}
                    value={inputValue}
                    onChange={handleInput}
                    onKeyDown={handleKeyDown}
                    placeholder="Type your message..."
                    color="gray.900"
                    size="sm"
                    resize="none"
                    bg="white"
                    flex="1"
                    borderRadius={10}
                    minHeight="40px"
                    maxHeight="120px"
                />
                <Button
                    onClick={handleSendClick}
                    colorScheme="blue"
                    ml={2}
                    height="40px"
                >
                    Send
                </Button>
            </Flex>
        </Box>
    );
};

export default ChatBox;
