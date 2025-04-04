import { StructuredResponseEndpoint } from "@/types/structuredresponseendpoint";
import { authStore } from "@/store/AuthStore";
import { checkResponseAndGetJson } from "@/utils/api/checkResponseAndParseJson";

interface UpdateSREPayload {
    sre_id: string;
    name?: string;
    description?: string;
    is_public?: boolean;
}

export async function updateSRE(payload: UpdateSREPayload): Promise<StructuredResponseEndpoint> {
  try {
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/sre/${payload.sre_id}`, {
        method: 'POST',
        headers: {
            'Authorization': await authStore.getAccessToken() || '',
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
    });

    return await checkResponseAndGetJson(response) as unknown as StructuredResponseEndpoint;
  } catch (error) {
    const errorMessage = (error as Error).message || 'An unknown error occurred updating the StructuredResponseEndpoint';
    throw Error(errorMessage);
  }
}
