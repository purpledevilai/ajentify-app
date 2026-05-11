import { ParameterDefinition, JsonSchema } from "@/types/parameterdefinition";
import { request } from "@/api/client";

interface UpdateParameterDefinitionPayload {
    pd_id: string;
    schema: JsonSchema;
}

export async function updateParameterDefinition(payload: UpdateParameterDefinitionPayload): Promise<ParameterDefinition> {
  return request<ParameterDefinition>({
    method: 'POST',
    path: `/parameter-definition/${payload.pd_id}`,
    body: { schema: payload.schema },
  });
}
