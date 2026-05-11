import { request } from "@/api/client";

export async function deleteTool(toolId: string): Promise<void> {
  await request<void>({
    method: 'DELETE',
    path: `/tool/${toolId}`,
  });
}
