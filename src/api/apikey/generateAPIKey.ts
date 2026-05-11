import { request } from "@/api/client";

export interface GenerateAPIKeyResponse {
    api_key_id: string;
    org_id: string;
    token: string;
    valid: boolean;
    type: string;
    user_id: string;
    created_at: number;
    updated_at: number;
}

export async function generateAPIKey(org_id: string): Promise<GenerateAPIKeyResponse> {
  return request<GenerateAPIKeyResponse>({
    method: 'POST',
    path: '/generate-api-key',
    body: { org_id, type: 'org' },
  });
}
