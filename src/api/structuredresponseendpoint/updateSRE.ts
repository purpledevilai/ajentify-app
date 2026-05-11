import { StructuredResponseEndpoint } from "@/types/structuredresponseendpoint";
import { request } from "@/api/client";

interface UpdateSREPayload {
    sre_id: string;
    name?: string;
    description?: string;
    pd_id?: string;
    is_public?: boolean;
    prompt_template?: string;
    variable_names?: string[] | null;
    model_id?: string | null;
    /** Pair with `logical_name` to attach this SRE to a stage. Pass both as null to detach. Omit both to leave the binding unchanged. */
    stage_id?: string | null;
    logical_name?: string | null;
}

export async function updateSRE(payload: UpdateSREPayload): Promise<StructuredResponseEndpoint> {
  return request<StructuredResponseEndpoint>({
    method: 'POST',
    path: `/sre/${payload.sre_id}`,
    body: payload,
  });
}
