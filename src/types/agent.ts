export interface Agent {
    agent_id: string;
    agent_name: string;
    agent_description: string;
    is_public: boolean;
    agent_speaks_first: boolean;
    voice_id?: string;
    uses_prompt_args?: boolean;
    prompt_arg_names?: string[];
    initialize_tool_id?: string | null;
    model_id?: string | null;
    prompt: string;
    tools?: string[];
    /** Stage that owns this agent (when deploy-managed via AjDK). null for dashboard-created agents. */
    stage_id?: string | null;
    /** Stable logical name within the stage (the manifest key). null for dashboard-created agents. */
    logical_name?: string | null;
    created_at?: number;
    updated_at?: number;
}