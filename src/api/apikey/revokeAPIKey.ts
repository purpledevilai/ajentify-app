import { request } from "@/api/client";
import { APIKeySummary } from "./getAPIKeys";

export async function revokeAPIKey(api_key_id: string): Promise<APIKeySummary> {
  return request<APIKeySummary>({
    method: 'POST',
    path: '/revoke-api-key',
    body: { api_key_id },
  });
}
