import { StructuredResponseEndpoint } from "@/types/structuredresponseendpoint";
import { request } from "@/api/client";

interface CreateSREPayload {
    name: string;
    description?: string;
    pd_id: string;
    is_public?: boolean;
    prompt_template?: string;
    variable_names?: string[];
    model_id?: string | null;
}

export async function createSRE(payload: CreateSREPayload): Promise<StructuredResponseEndpoint> {
  return request<StructuredResponseEndpoint>({
    method: 'POST',
    path: '/sre',
    body: payload,
  });
}
