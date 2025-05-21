'use client';

import React, { useEffect, useRef, useState } from "react";
import { TokenStreamingService } from "@/api/tokenstreamingservice/TokenStreamingService";
import { Box } from "@chakra-ui/react";
import { MessagesArea } from "./MessagesArea";
import { UserInput } from "./UserInput";
import { Context, Message } from "@/types/context";
import { ChatEvent } from "@/types/chatresponse";
import { useAlert } from "../AlertProvider";
import { ChatBoxStyle } from "@/types/chatboxstyle";
import { authStore } from "@/store/AuthStore";


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
    for_display?: boolean;
}

export const ChatBox = ({ context, onEvents, style = defaultChatBoxStyle, for_display = false }: ChatBoxProps) => {
    const [responseLoading, setResponseLoading] = useState<boolean>(false);
    const [messages, setMessages] = useState<Message[]>(context.messages)
    const { showAlert } = useAlert();
    const [isConnected, setIsConnected] = useState<boolean>(false);
    const [isConnecting, setIsConnecting] = useState<boolean>(false);
    const startNewAIMessageRef = useRef<boolean>(true);
    const tokenStreamingServiceRef = useRef<TokenStreamingService | null>(null);

    const hasInitialized = useRef(false);
    useEffect(() => {
        if (hasInitialized.current) return;
        hasInitialized.current = true;
        
        if (for_display) return;

        const init = async () => {
            setIsConnecting(true);
            try {
                const service = new TokenStreamingService(
                    process.env.NEXT_PUBLIC_LIVE_AGENT_URL || "",
                    context.context_id,
                    await authStore.getAccessToken() || ''
                );

                tokenStreamingServiceRef.current = service;

                service.setOnToken((token: string) => {
                    if (startNewAIMessageRef.current) {
                        startNewAIMessageRef.current = false;
                        setResponseLoading(false);
                        addMessage("", "ai");
                    }
                    appendLastAIMessageWithToken(token);
                });

                service.setOnToolCall((id, name, input) => {
                    console.log("Tool call:", id, name, input);
                });

                service.setOnToolResponse((id, name, output) => {
                    console.log("Tool response:", id, name, output);
                });

                // eslint-disable-next-line @typescript-eslint/no-unused-vars
                service.setOnEvents((events, responseId) => {
                    console.log("Received events:", events);
                    if (onEvents) {
                        onEvents(events);
                    }
                });

                await service.connect();
                setIsConnected(true);
            } catch (err) {
                showAlert({ title: "Whoops", message: "Failed to connect to context." });
                console.error("Failed to connect to context:", err);
                setIsConnected(false);
            } finally {
                setIsConnecting(false);
            }
        };

        init();

        return () => {
            tokenStreamingServiceRef.current?.close();
        };
    }, []);


    const sendMessage = async (message: string) => {
        if (!isConnected) {
            showAlert({ 
                title: "Whoops",
                message: "Not connected to context",
                actions: [
                    { label: "close", onClick: undefined },
                    { label: "Reconnect", onClick: () => tokenStreamingServiceRef.current?.connect() }
                ]
            });
            return;
        }

        try {
            addMessage(message, "human");
            startNewAIMessageRef.current = true;
            setResponseLoading(true);
            await tokenStreamingServiceRef.current?.addMessage(message);
        } catch (error) {
            showAlert({ title: "Whoops", message: (error as Error).message });
        }
    };

    const addMessage = (message: string, sender: "ai" | "human") => {
        setMessages((prevMessages) => [
            ...prevMessages,
            { message, sender }
        ])
    }

    const appendLastAIMessageWithToken = (token: string) => {
        setMessages((prevMessages) => {
            return prevMessages.map((msg, index) =>
                index === prevMessages.length - 1 && msg.sender === "ai"
                    ? { ...msg, message: msg.message + token }
                    : msg
            );
        });
    };

    return (
        <Box width="100%" height="100%" position="relative">
            <MessagesArea messages={messages} responseLoading={responseLoading} style={style} />
            <UserInput onMessage={sendMessage} style={style} isConnecting={isConnecting} />
        </Box>
    );
};

export default ChatBox;
