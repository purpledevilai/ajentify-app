import { authStore } from "@/store/AuthStore";
import { checkResponseAndGetJson } from "@/utils/api/checkResponseAndParseJson";
import { AnyType } from "@/types/tools";

export interface RunSREPayload {
    sre_id: string;
    prompt_args?: Record<string, string>;
}

export async function runSRE(payload: RunSREPayload): Promise<AnyType> {
  try {
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/run-sre/${payload.sre_id}`, {
        method: 'POST',
        headers: {
            'Authorization': await authStore.getAccessToken() || '',
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload.prompt_args || {})
    });
    return await checkResponseAndGetJson(response) as unknown as AnyType;
  } catch (error) {
    const errorMessage = (error as Error).message || 'An unknown error occurred running the StructuredResponseEndpoint';
    throw Error(errorMessage);
  }
}