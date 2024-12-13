import { Button, Flex, Textarea } from "@chakra-ui/react"
import { useEffect, useRef, useState } from "react";

interface UserInputProps {
    onMessage: (message: string) => void;
}

export const UserInput = ({onMessage}: UserInputProps) => {
    const [inputValue, setInputValue] = useState("");
    const textareaRef = useRef<HTMLTextAreaElement>(null);

    useEffect(() => {
        adjustTextareaHeight();
    }, [])

    const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
        if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault();
            if (inputValue.trim()) {
                onMessage(inputValue);
                setInputValue(""); // Clear the input after sending
            }
        }
    };

    const handleSendClick = () => {
        if (inputValue.trim()) {
            onMessage(inputValue);
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
        < Flex
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
        </Flex >
    )
}