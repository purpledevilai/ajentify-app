import { Agent } from "@/types/agent";
import { authStore } from "@/store/AuthStore";
import { checkResponseAndGetJson } from "@/utils/api/checkResponseAndParseJson";


interface GetAgentsOptions {
    /** Stage name (e.g. "frontend-staging") to scope the listing to deploy-managed agents. */
    stage?: string;
}

export async function getAgents(options: GetAgentsOptions = {}): Promise<Agent[]> {
  try {
    const params = new URLSearchParams();
    if (options.stage) params.set('stage', options.stage);
    const qs = params.toString();
    const url = `${process.env.NEXT_PUBLIC_API_BASE_URL}/agents${qs ? `?${qs}` : ''}`;
    const response = await fetch(url, {
        headers: {
            'Authorization': await authStore.getAccessToken() || '',
            'Content-Type': 'application/json'
        },
    });
    const agentsObj = await checkResponseAndGetJson(response);
    return agentsObj["agents"] as Agent[];
  } catch (error) {
    const errorMessage = (error as Error).message || 'An unknown error occurred getting the agents';
    throw Error(errorMessage);
  }
}