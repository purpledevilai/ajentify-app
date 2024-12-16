export interface Agent {
    agent_id: string;
    is_public: boolean;
    agent_speaks_first: boolean;
    agent_name: string;
    prompt: string;
    agent_description: string;
}