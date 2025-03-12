import { ParameterDefinition } from "@/types/parameterdefinition";
import { authStore } from "@/store/AuthStore";
import { checkResponseAndGetJson } from "@/utils/api/checkResponseAndParseJson";


export async function getParameterDefinitions(): Promise<ParameterDefinition[]> {
  try {
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/parameter-definitions`, {
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