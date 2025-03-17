import { ParameterDefinition, Parameter } from "@/types/parameterdefinition";
import { authStore } from "@/store/AuthStore";
import { checkResponseAndGetJson } from "@/utils/api/checkResponseAndParseJson";

interface CreateParameterDefinitionPayload {
    parameters: Parameter[];
}

export async function createParameterDefinition(payload: CreateParameterDefinitionPayload): Promise<ParameterDefinition> {
    try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/parameter-definition`, {
            method: 'POST',
            headers: {
                'Authorization': await authStore.getAccessToken() || '',
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(payload),
        });
        return await checkResponseAndGetJson(response) as unknown as ParameterDefinition;
    } catch (error) {
        const errorMessage = (error as Error).message || 'An unknown error occurred getting the parameter definitions';
        throw Error(errorMessage);
    }
}
