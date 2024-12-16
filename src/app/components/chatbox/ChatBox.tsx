import React, { useState } from "react";
import { Box } from "@chakra-ui/react";
import { MessagesArea } from "./MessagesArea";
import { UserInput } from "./UserInput";
import { Context, Message } from "@/types/context";
import { chat } from "@/api/chat/chat";
import { UIUpdate } from "@/types/chatresponse";
import { useAlert } from "../AlertProvider";


export interface ChatBoxStyle {
    backgroundColor: string;
    borderColor: string;
    aiMessageBackgroundColor: string;
    aiMessageTextColor: string;
    userMessageBackgroundColor: string;
    userMessageTextColor: string;
    userInputBackgroundColor: string;
    userInputTextareaBackgroundColor: string;
    userInputTextareaTextColor: string;
    userInputTextareaFocusColor: string;
    userInputTextareaPlaceholderText: string;
    userInputTextareaPlaceholderColor: string;
    userInputSendButtonColor: string;
    userInputSendButtonHoverColor: string;
    userInputSendButtonTextColor: string;
    typingIndicatorBackgroundColor: string;
    typingIndicatorDotColor: string;
}

export const defaultChatBoxStyle: ChatBoxStyle = {
    backgroundColor: "gray.50",
    borderColor: "gray.300",
    aiMessageBackgroundColor: "gray.500",
    aiMessageTextColor: "gray.50",
    userMessageBackgroundColor: "gray.200",
    userMessageTextColor: "gray.700",
    userInputBackgroundColor: "gray.200",
    userInputTextareaFocusColor: "gray.300",
    userInputTextareaBackgroundColor: "gray.50",
    userInputTextareaTextColor: "gray.800",
    userInputTextareaPlaceholderText: "Type a message...",
    userInputTextareaPlaceholderColor: "gray.500",
    userInputSendButtonColor: "gray.500",
    userInputSendButtonHoverColor: "gray.600",
    userInputSendButtonTextColor: "gray.50",
    typingIndicatorBackgroundColor: "gray.600",
    typingIndicatorDotColor: "gray.50"
}

export const defaultDarkChatBoxStyle: ChatBoxStyle = {
    backgroundColor: "gray.800",
    borderColor: "gray.500",
    aiMessageBackgroundColor: "gray.700",
    aiMessageTextColor: "gray.50",
    userMessageBackgroundColor: "gray.600",
    userMessageTextColor: "gray.50",
    userInputBackgroundColor: "gray.600",
    userInputTextareaFocusColor: "gray.500",
    userInputTextareaBackgroundColor: "gray.700",
    userInputTextareaTextColor: "gray.50",
    userInputTextareaPlaceholderText: "Type a message...",
    userInputTextareaPlaceholderColor: "gray.400",
    userInputSendButtonColor: "gray.500",
    userInputSendButtonHoverColor: "gray.400",
    userInputSendButtonTextColor: "gray.50",
    typingIndicatorBackgroundColor: "gray.700",
    typingIndicatorDotColor: "gray.50"
}

interface ChatBoxProps {
    context: Context;
    onUIUpdates?: (uiUpdates: UIUpdate[]) => void
    style?: ChatBoxStyle;
}

export const ChatBox = ({ context, onUIUpdates, style = defaultChatBoxStyle }: ChatBoxProps) => {

    const [responseLoading, setResponseLoading] = useState<boolean>(false);
    const [messages, setMessages] = useState<Message[]>(context.messages)
    const { showAlert } = useAlert();

    const sendMessage = async (message: string) => {
        try {
            addMessage(message, "user");
            setResponseLoading(true);
            const response = await chat({context_id: context.context_id, message});
            addMessage(response.response, "ai");
            if (response.ui_updates && onUIUpdates) {
                console.log("Got UI updates!")
                onUIUpdates(response.ui_updates);
            }
        } catch(error) {
            showAlert({title: "Whoops", message: (error as Error).message})
        } finally {
            setResponseLoading(false);
        }
    }

    const addMessage = (message: string, from: "ai" | "user") => {
        setMessages((prevMessages) => [
            ...prevMessages,
            { message, from }
        ])
    }

    return (
        <Box width="100%" height="100%" position="relative">
            <MessagesArea messages={messages} responseLoading={responseLoading} style={style}/>
            <UserInput onMessage={sendMessage} style={style}/>
        </Box>
    );
};

export default ChatBox;
