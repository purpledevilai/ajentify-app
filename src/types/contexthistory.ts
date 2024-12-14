export interface ContextHistoryAgent {
    agent_id: string;
    agent_name: string;
    agent_description: string;
}

export interface ContextHistory {
    context_id: string;
    user_id: string;
    last_message: string;
    time_stamp: number;
    agent: ContextHistoryAgent;
}