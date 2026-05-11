import { request } from "@/api/client";

export async function deleteIntegration(integrationId: string): Promise<void> {
  await request<void>({
    method: 'DELETE',
    path: `/integration/${integrationId}`,
  });
}
