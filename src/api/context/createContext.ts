import { request } from "@/api/client";
import { Context } from "@/types/context";

export interface CreateContextPayload {
    agent_id: string;
    invoke_agent_message?: boolean
    prompt_args?: Record<string, string>;
}

export async function createContext({agent_id, invoke_agent_message = false, prompt_args = {}}: CreateContextPayload): Promise<Context> {
  return request<Context>({
    method: 'POST',
    path: '/context',
    body: { agent_id, invoke_agent_message, prompt_args },
  });
}
