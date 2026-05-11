import { ParameterDefinition, JsonSchema } from "@/types/parameterdefinition";
import { request } from "@/api/client";

interface CreateParameterDefinitionPayload {
    schema: JsonSchema;
}

export async function createParameterDefinition(payload: CreateParameterDefinitionPayload): Promise<ParameterDefinition> {
  return request<ParameterDefinition>({
    method: 'POST',
    path: '/parameter-definition',
    body: payload,
  });
}
