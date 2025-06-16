import { Agent } from "@/types/agent";
import { authStore } from "@/store/AuthStore";
import { checkResponseAndGetJson } from "@/utils/api/checkResponseAndParseJson";

interface UpdateAgentPayload {
    agent_id: string;
    agent_name: string;
    agent_description: string;
    is_public: boolean;
    prompt: string;
    agent_speaks_first: boolean;
    voice_id?: string;
    tools?: string[];
    uses_prompt_args?: boolean;
}

export async function updateAgent(payload: UpdateAgentPayload): Promise<Agent> {
  try {
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/agent/${payload.agent_id}`, {
        method: 'POST',
        headers: {
            'Authorization': await authStore.getAccessToken() || '',
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload),
    });
    return await checkResponseAndGetJson(response) as unknown as Agent;
  } catch (error) {
    const errorMessage = (error as Error).message || 'An unknown error occurred getting the agents';
    throw Error(errorMessage);
  }
}