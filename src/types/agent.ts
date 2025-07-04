export interface Agent {
    agent_id: string;
    agent_name: string;
    agent_description: string;
    is_public: boolean;
    agent_speaks_first: boolean;
    voice_id?: string;
    uses_prompt_args?: boolean;
    initialize_tool_id?: string | null;
    prompt: string;
    tools?:  string[];
}