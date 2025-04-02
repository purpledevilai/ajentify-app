import { authStore } from "@/store/AuthStore";
import { checkResponseAndGetJson } from "@/utils/api/checkResponseAndParseJson";
import { AnyType } from "@/types/tools";


export interface RunSMEPayload {
    sme_id: string;
    message: string;
}

export async function runSME(payload: RunSMEPayload): Promise<AnyType> {
  try {
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/run-sme/${payload.sme_id}`, {
        method: 'POST',
        headers: {
            'Authorization': await authStore.getAccessToken() || '',
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
    });
    return await checkResponseAndGetJson(response) as unknown as AnyType;
  } catch (error) {
    const errorMessage = (error as Error).message || 'An unknown error occurred running the SingleMessageEndpoint';
    throw Error(errorMessage);
  }
}