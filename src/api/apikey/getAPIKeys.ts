import { request } from "@/api/client";

export interface APIKeySummary {
    api_key_id: string;
    org_id: string;
    token_hint: string;
    valid: boolean;
    created_at: number;
}

export interface GetAPIKeysResponse {
    api_keys: APIKeySummary[];
}

export async function getAPIKeys(org_id?: string): Promise<GetAPIKeysResponse> {
  return request<GetAPIKeysResponse>({
    method: 'GET',
    path: '/api-keys',
    query: { org_id },
  });
}
