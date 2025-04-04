import { StructuredResponseEndpoint } from "@/types/structuredresponseendpoint";
import { authStore } from "@/store/AuthStore";
import { checkResponseAndGetJson } from "@/utils/api/checkResponseAndParseJson";

interface CreateSREPayload {
    name: string;
    description?: string;
    pd_id: string;
    is_public?: boolean;
}

export async function createSRE(payload: CreateSREPayload): Promise<StructuredResponseEndpoint> {
    try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/sre`, {
            method: 'POST',
            headers: {
                'Authorization': await authStore.getAccessToken() || '',
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(payload),
        });

        return await checkResponseAndGetJson(response) as unknown as StructuredResponseEndpoint;
    } catch (error) {
        const errorMessage = (error as Error).message || 'An unknown error occurred creating the StructuredResponseEndpoint';
        throw Error(errorMessage);
    }
}
