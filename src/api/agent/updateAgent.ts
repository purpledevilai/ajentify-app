import { Agent } from "@/types/agent";
import { request } from "@/api/client";

interface UpdateAgentPayload {
    agent_id: string;
    agent_name?: string;
    agent_description?: string;
    is_public?: boolean;
    prompt?: string;
    agent_speaks_first?: boolean;
    voice_id?: string;
    tools?: string[];
    uses_prompt_args?: boolean;
    prompt_arg_names?: string[];
    initialize_tool_id?: string | null;
    model_id?: string | null;
    /** Pair with `logical_name` to attach this agent to a stage. Pass both as null to detach. Omit both to leave the binding unchanged. */
    stage_id?: string | null;
    logical_name?: string | null;
}

export async function updateAgent(payload: UpdateAgentPayload): Promise<Agent> {
  return request<Agent>({
    method: 'POST',
    path: `/agent/${payload.agent_id}`,
    body: payload,
  });
}
