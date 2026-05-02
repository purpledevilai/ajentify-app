import { ParameterDefinition } from "@/types/parameterdefinition";
import { authStore } from "@/store/AuthStore";
import { checkResponseAndGetJson } from "@/utils/api/checkResponseAndParseJson";


interface GetParameterDefinitionsOptions {
    /** Stage name (e.g. "frontend-staging") to scope the listing to deploy-managed PDs. */
    stage?: string;
}

export async function getParameterDefinitions(
    options: GetParameterDefinitionsOptions = {},
): Promise<ParameterDefinition[]> {
  try {
    const params = new URLSearchParams();
    if (options.stage) params.set('stage', options.stage);
    const qs = params.toString();
    const url = `${process.env.NEXT_PUBLIC_API_BASE_URL}/parameter-definitions${qs ? `?${qs}` : ''}`;
    const response = await fetch(url, {
        headers: {
            'Authorization': await authStore.getAccessToken() || '',
            'Content-Type': 'application/json'
        },
    });
    const pdObj = await checkResponseAndGetJson(response);
    return pdObj["parameter_definitions"] as ParameterDefinition[];
  } catch (error) {
    const errorMessage = (error as Error).message || 'An unknown error occurred getting the parameter definitions';
    throw Error(errorMessage);
  }
}