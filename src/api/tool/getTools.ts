import { Tool } from "@/types/tools";
import { request } from "@/api/client";


interface GetToolsOptions {
    /** Stage name (e.g. "frontend-staging") to scope the listing to deploy-managed tools. Mutually exclusive with `agentId` server-side. */
    stage?: string;
}

export async function getTools(agentId?: string, options: GetToolsOptions = {}): Promise<Tool[]> {
  const { tools } = await request<{ tools: Tool[] }>({
    method: 'GET',
    path: '/tools',
    query: { agent_id: agentId, stage: options.stage },
  });
  return tools;
}
