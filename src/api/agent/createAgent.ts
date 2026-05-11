import { Agent } from "@/types/agent";
import { request } from "@/api/client";

interface CreateAgentPayload {
    agent_name: string;
    agent_description: string;
    is_public: boolean;
    prompt: string;
    agent_speaks_first: boolean;
    voice_id?: string;
    tools?: string[];
    uses_prompt_args?: boolean;
    prompt_arg_names?: string[];
    initialize_tool_id?: string | null;
    model_id?: string | null;
}

export async function createAgent(payload: CreateAgentPayload): Promise<Agent> {
  return request<Agent>({
    method: 'POST',
    path: '/agent',
    body: payload,
  });
}
