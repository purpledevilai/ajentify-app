import { request } from "@/api/client";

export async function deleteAgent(agentId: string): Promise<void> {
  await request<void>({
    method: 'DELETE',
    path: `/agent/${agentId}`,
  });
}
