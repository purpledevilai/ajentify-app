export interface Message {
    from: "ai" | "user";
    message: string;
}

export interface Context {
    context_id: string;
    agent_id: string;
    messages: Message[];
}