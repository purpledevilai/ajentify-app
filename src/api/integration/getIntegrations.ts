import { Integration } from "@/types/integration";
import { request } from "@/api/client";

export async function getIntegrations(): Promise<Integration[]> {
  const { integrations } = await request<{ integrations: Integration[] }>({
    method: 'GET',
    path: '/integrations',
  });
  return integrations;
}
