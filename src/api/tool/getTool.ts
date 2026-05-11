import { request } from "@/api/client";
import { Tool } from "@/types/tools";

export async function getTool(toolId: string): Promise<Tool> {
  return request<Tool>({
    method: 'GET',
    path: `/tool/${toolId}`,
  });
}
