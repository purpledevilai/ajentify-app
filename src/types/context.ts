export interface Message {
    sender: "ai" | "human";
    message: string;
}

export interface Context {
    context_id: string;
    agent_id: string;
    messages: Message[];
}