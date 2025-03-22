'use client';

import React, { useEffect, useRef, useState } from "react";
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
    const websocketRef = useRef<WebSocket | null>(null);
    const [isConnected, setIsConnected] = useState<boolean>(false);
    const [isConnecting, setIsConnecting] = useState<boolean>(false);
    const startNewAIMessageRef = useRef<boolean>(true);

    useEffect(() => {
        if (for_display) {
            return;
        }

        // Create WebSocket connection
        const webSocketUrl = process.env.NEXT_PUBLIC_LIVE_AGENT_URL || "wss://live-agent-service.prod.live-agent.ajentify.com/ws";
        const ws = new WebSocket(webSocketUrl);
        websocketRef.current = ws;

        ws.onopen = () => {
            console.log("Connected to WebSocket server");
            connectToContext();
        };

        ws.onmessage = (event) => {
            const eventMessage = JSON.parse(event.data);
            switch (eventMessage.type) {
                case "error":
                    showAlert({ title: "Whoops", message: eventMessage.error });
                    break;
                case "context_connected":
                    if (!eventMessage.success) {
                        showAlert({ title: "Whoops", message: "Failed to connect to context" });
                        setIsConnected(false);
                        setIsConnecting(false);
                        return;
                    }
                    setIsConnected(true);
                    setIsConnecting(false);
                    setResponseLoading(eventMessage.agent_speaks_first);
                    break;
                case "message":
                    if (startNewAIMessageRef.current) {
                        startNewAIMessageRef.current = false;
                        setResponseLoading(false);
                        addMessage("", "ai");
                    }
                    appendLastAIMessageWithToken(eventMessage.message);
                    break;
                case "events":
                    if (onEvents) {
                        onEvents(eventMessage.events);
                    }
                    break;
            }
        };

        // For some reason it has error on every connection - just leave it for now
        // ws.onerror = (error) => {
        //     console.error("WebSocket Error:", error);
        // };

        ws.onclose = () => {
            console.log("WebSocket connection closed");
            setIsConnected(false);
        };

        // Cleanup on component unmount
        return () => {
            ws.close();
        };
    }, []);

    const connectToContext = async () => {
        setIsConnecting(true);
        websocketRef.current?.send(JSON.stringify({
            type: "connect_to_context",
            context_id: context.context_id,
            access_token: await authStore.getAccessToken() || ''
        }));
    }

    const sendMessage = async (message: string) => {
        if (!isConnected) {
            showAlert({ 
                title: "Whoops",
                message: "Not connected to context",
                actions: [
                    { label: "close", onClick: undefined },
                    { label: "Reconnect", onClick: connectToContext }
                ]
            });
            return;
        }
        try {
            addMessage(message, "human");
            startNewAIMessageRef.current = true;
            setResponseLoading(true);
            websocketRef.current?.send(JSON.stringify({ type: "message", message }));
        } catch (error) {
            showAlert({ title: "Whoops", message: (error as Error).message })
        } finally {
            
        }
    }

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
