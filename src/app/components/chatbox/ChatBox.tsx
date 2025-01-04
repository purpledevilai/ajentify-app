'use client';

import React, { useState } from "react";
import { Box } from "@chakra-ui/react";
import { MessagesArea } from "./MessagesArea";
import { UserInput } from "./UserInput";
import { Context, Message } from "@/types/context";
import { chat } from "@/api/chat/chat";
import { ChatEvent } from "@/types/chatresponse";
import { useAlert } from "../AlertProvider";
import { ChatBoxStyle } from "@/types/chatboxstyle";

export const defaultChatBoxStyle: ChatBoxStyle = {
    background_color: "gray.50",
    border_color: "gray.300",
    ai_message_background_color: "gray.500",
    ai_message_text_color: "gray.50",
    user_message_background_color: "gray.200",
    user_message_text_color: "gray.700",
    user_input_background_color: "gray.200",
    user_input_textarea_focus_color: "gray.300",
    user_input_textarea_background_color: "gray.50",
    user_input_textarea_text_color: "gray.800",
    user_input_textarea_placeholder_text: "Type a message...",
    user_input_textarea_placeholder_color: "gray.500",
    user_input_send_button_color: "gray.500",
    user_input_send_button_hover_color: "gray.600",
    user_input_send_button_text_color: "gray.50",
    typing_indicator_background_color: "gray.600",
    typing_indicator_dot_color: "gray.50"
}

export const defaultDarkChatBoxStyle: ChatBoxStyle = {
    background_color: "gray.800",
    border_color: "gray.500",
    ai_message_background_color: "gray.700",
    ai_message_text_color: "gray.50",
    user_message_background_color: "gray.600",
    user_message_text_color: "gray.50",
    user_input_background_color: "gray.600",
    user_input_textarea_focus_color: "gray.500",
    user_input_textarea_background_color: "gray.700",
    user_input_textarea_text_color: "gray.50",
    user_input_textarea_placeholder_text: "Type a message...",
    user_input_textarea_placeholder_color: "gray.400",
    user_input_send_button_color: "gray.500",
    user_input_send_button_hover_color: "gray.400",
    user_input_send_button_text_color: "gray.50",
    typing_indicator_background_color: "gray.700",
    typing_indicator_dot_color: "gray.50"
}

interface ChatBoxProps {
    context: Context;
    onEvents?: (chatEvents: ChatEvent[]) => void
    style?: ChatBoxStyle;
}

export const ChatBox = ({ context, onEvents, style = defaultChatBoxStyle }: ChatBoxProps) => {

    const [responseLoading, setResponseLoading] = useState<boolean>(false);
    const [messages, setMessages] = useState<Message[]>(context.messages)
    const { showAlert } = useAlert();

    const sendMessage = async (message: string) => {
        try {
            addMessage(message, "human");
            setResponseLoading(true);
            const response = await chat({context_id: context.context_id, message});
            addMessage(response.response, "ai");
            if (response.events && onEvents) {
                onEvents(response.events);
            }
        } catch(error) {
            showAlert({title: "Whoops", message: (error as Error).message})
        } finally {
            setResponseLoading(false);
        }
    }

    const addMessage = (message: string, sender: "ai" | "human") => {
        setMessages((prevMessages) => [
            ...prevMessages,
            { message, sender }
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
