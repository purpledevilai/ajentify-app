import { ParameterDefinition, Parameter } from "@/types/parameterdefinition";
import { authStore } from "@/store/AuthStore";
import { checkResponseAndGetJson } from "@/utils/api/checkResponseAndParseJson";

interface UpdateParameterDefinitionPayload {
    pd_id: string;
    parameters: Parameter[];
}

export async function updateParameterDefinition(payload: UpdateParameterDefinitionPayload): Promise<ParameterDefinition> {
  try {
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/parameter-definition/${payload.pd_id}`, {
        method: 'POST',
        headers: {
            'Authorization': await authStore.getAccessToken() || '',
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload),
    });
    return await checkResponseAndGetJson(response) as unknown as ParameterDefinition;
  } catch (error) {
    const errorMessage = (error as Error).message || 'An unknown error occurred updating the parameter definition';
    throw Error(errorMessage);
  }
}