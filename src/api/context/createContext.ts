import { authStore } from "@/store/AuthStore";
import { checkResponseAndGetJson } from "@/utils/api/checkResponseAndParseJson";
import { createUrlParams } from "@/utils/api/createURLParams";
import { Context } from "@/types/context";

export interface CreateContextPayload {
    agent_id: string;
    invoke_agent_message?: boolean
}

export async function createContext({agent_id, invoke_agent_message = false}: CreateContextPayload): Promise<Context> {
  try {
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/context`, {
        method: 'POST',
        headers: {
            'Authorization': await authStore.getAccessToken() || '',
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({agent_id, invoke_agent_message}),
    });
    return await checkResponseAndGetJson(response) as unknown as Context;
  } catch (error) {
    const errorMessage = (error as Error).message || 'An unknown error occurred creating the context';
    throw Error(errorMessage);
  }
}