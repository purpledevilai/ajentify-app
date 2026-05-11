import { ParameterDefinition } from "@/types/parameterdefinition";
import { request } from "@/api/client";


interface GetParameterDefinitionsOptions {
    /** Stage name (e.g. "frontend-staging") to scope the listing to deploy-managed PDs. */
    stage?: string;
}

export async function getParameterDefinitions(
    options: GetParameterDefinitionsOptions = {},
): Promise<ParameterDefinition[]> {
  const { parameter_definitions } = await request<{ parameter_definitions: ParameterDefinition[] }>({
    method: 'GET',
    path: '/parameter-definitions',
    query: { stage: options.stage },
  });
  return parameter_definitions;
}
