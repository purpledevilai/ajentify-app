import { ParameterDefinition } from "@/types/parameterdefinition";
import { request } from "@/api/client";

export async function getParameterDefinition(pdId: string): Promise<ParameterDefinition> {
  return request<ParameterDefinition>({
    method: 'GET',
    path: `/parameter-definition/${pdId}`,
  });
}
