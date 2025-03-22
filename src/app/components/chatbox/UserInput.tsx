import { Button, Flex, Textarea } from "@chakra-ui/react"
import { useEffect, useRef, useState } from "react";
import { ChatBoxStyle } from "@/types/chatboxstyle";

interface UserInputProps {
    onMessage: (message: string) => void;
    style: ChatBoxStyle;
    isConnecting: boolean;
}

export const UserInput = ({onMessage, style, isConnecting}: UserInputProps) => {
    const [inputValue, setInputValue] = useState("");
    const textareaRef = useRef<HTMLTextAreaElement>(null);

    useEffect(() => {
        adjustTextareaHeight();
    }, [inputValue]);

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
            bg={style.user_input_background_color}
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
                placeholder={style.user_input_textarea_placeholder_text}
                _placeholder={{color: style.user_input_textarea_placeholder_color}}
                bg={style.user_input_textarea_background_color}
                color={style.user_input_textarea_text_color}
                focusBorderColor={style.user_input_textarea_focus_color}
                fontSize="large"
                size="sm"
                resize="none"
                flex="1"
                borderRadius={10}
                minHeight="40px"
                maxHeight="120px"
            />
            <Button
                onClick={handleSendClick}
                bg={style.user_input_send_button_color}
                _hover={{bg: style.user_input_send_button_hover_color}}
                color={style.user_input_send_button_text_color}
                ml={2}
                height="40px"
                isLoading={isConnecting}
            >
                Send
            </Button>
        </Flex >
    )
}