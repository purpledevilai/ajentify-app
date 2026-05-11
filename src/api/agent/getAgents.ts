import { Agent } from "@/types/agent";
import { request } from "@/api/client";


interface GetAgentsOptions {
    /** Stage name (e.g. "frontend-staging") to scope the listing to deploy-managed agents. */
    stage?: string;
}

export async function getAgents(options: GetAgentsOptions = {}): Promise<Agent[]> {
  const { agents } = await request<{ agents: Agent[] }>({
    method: 'GET',
    path: '/agents',
    query: { stage: options.stage },
  });
  return agents;
}
