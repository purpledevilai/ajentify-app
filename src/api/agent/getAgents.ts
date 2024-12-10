import { Agent } from "@/types/agent";
import { authStore } from "@/store/AuthStore";
import { checkResponseAndGetJson } from "@/utils/api/checkResponseAndParseJson";


export async function getAgents(): Promise<Agent[]> {
  try {
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/agents`, {
        headers: {
            'Authorization': await authStore.getAccessToken() || '',
            'Content-Type': 'application/json'
        },
    });
    return await checkResponseAndGetJson(response) as unknown as Agent[];
  } catch (error) {
    const errorMessage = (error as Error).message || 'An unknown error occurred getting the agents';
    throw Error(errorMessage);
  }
}