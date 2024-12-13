import { Button, Flex, Textarea } from "@chakra-ui/react"
import { useEffect, useRef, useState } from "react";
import { ChatBoxStyle } from "./ChatBox";

interface UserInputProps {
    onMessage: (message: string) => void;
    style: ChatBoxStyle;
}

export const UserInput = ({onMessage, style}: UserInputProps) => {
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
            bottom="1.5px"
            right="1.5px"
            left="1.5px"
            bg={style.userInputBackgroundColor}
            p={4}
            alignItems="center"
            borderRadius={12}
            boxShadow="0 -2px 5px rgba(0, 0, 0, 0.2)"
        >
            <Textarea
                ref={textareaRef}
                value={inputValue}
                onChange={handleInput}
                onKeyDown={handleKeyDown}
                placeholder={style.userInputTextareaPlaceholderText}
                _placeholder={{color: style.userInputTextareaPlaceholderColor}}
                bg={style.userInputTextareaBackgroundColor}
                color={style.userInputTextareaTextColor}
                focusBorderColor={style.userInputTextareaFocusColor}
                size="sm"
                resize="none"
                flex="1"
                borderRadius={10}
                minHeight="40px"
                maxHeight="120px"
            />
            <Button
                onClick={handleSendClick}
                bg={style.userInputSendButtonColor}
                _hover={{bg: style.userInputSendButtonHoverColor}}
                color={style.userInputSendButtonTextColor}
                ml={2}
                height="40px"
            >
                Send
            </Button>
        </Flex >
    )
}