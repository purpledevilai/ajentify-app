import { Tool } from "@/types/tools";
import { authStore } from "@/store/AuthStore";
import { checkResponseAndGetJson } from "@/utils/api/checkResponseAndParseJson";


interface GetToolsOptions {
    /** Stage name (e.g. "frontend-staging") to scope the listing to deploy-managed tools. Mutually exclusive with `agentId` server-side. */
    stage?: string;
}

export async function getTools(agentId?: string, options: GetToolsOptions = {}): Promise<Tool[]> {
  try {
    const params = new URLSearchParams();
    if (agentId) params.set('agent_id', agentId);
    if (options.stage) params.set('stage', options.stage);
    const qs = params.toString();
    const url = `${process.env.NEXT_PUBLIC_API_BASE_URL}/tools${qs ? `?${qs}` : ''}`;
    const response = await fetch(url, {
        headers: {
            'Authorization': await authStore.getAccessToken() || '',
            'Content-Type': 'application/json'
        },
    });
    const toolObj = await checkResponseAndGetJson(response);
    return toolObj["tools"] as Tool[];
  } catch (error) {
    const errorMessage = (error as Error).message || 'An unknown error occurred getting the tools';
    throw Error(errorMessage);
  }
}