import React, { useState } from "react";
import { Box } from "@chakra-ui/react";
import { MessagesArea } from "./MessagesArea";
import { UserInput } from "./UserInput";
import { Context, Message } from "@/types/context";
import { chat } from "@/api/chat/chat";
import { UIUpdate } from "@/types/chatresponse";
import { useAlert } from "../AlertProvider";


interface ChatBoxProps {
    context: Context;
    onUIUpdates?: (uiUpdates: UIUpdate[]) => void
}

export const ChatBox = ({ context, onUIUpdates }: ChatBoxProps) => {

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
                onUIUpdates(response.ui_updates);
            }
        } catch(error) {
            showAlert("Whoops", (error as Error).message)
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
            <MessagesArea messages={messages} responseLoading={responseLoading}/>
            <UserInput onMessage={sendMessage}/>
        </Box>
    );
};

export default ChatBox;
