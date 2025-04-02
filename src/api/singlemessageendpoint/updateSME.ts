import { SingleMessageEndpoint } from "@/types/singlemessageendpoint";
import { authStore } from "@/store/AuthStore";
import { checkResponseAndGetJson } from "@/utils/api/checkResponseAndParseJson";

interface UpdateSMEPayload {
    sme_id: string;
    name?: string;
    description?: string;
    is_public?: boolean;
}

export async function updateSME(payload: UpdateSMEPayload): Promise<SingleMessageEndpoint> {
  try {
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/sme/${payload.sme_id}`, {
        method: 'POST',
        headers: {
            'Authorization': await authStore.getAccessToken() || '',
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
    });

    return await checkResponseAndGetJson(response) as unknown as SingleMessageEndpoint;
  } catch (error) {
    const errorMessage = (error as Error).message || 'An unknown error occurred updating the SingleMessageEndpoint';
    throw Error(errorMessage);
  }
}
