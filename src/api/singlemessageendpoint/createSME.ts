import { SingleMessageEndpoint } from "@/types/singlemessageendpoint";
import { authStore } from "@/store/AuthStore";
import { checkResponseAndGetJson } from "@/utils/api/checkResponseAndParseJson";

interface CreateSMEPayload {
    name: string;
    description?: string;
    pd_id: string;
    is_public?: boolean;
}

export async function createSME(payload: CreateSMEPayload): Promise<SingleMessageEndpoint> {
    try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/sme`, {
            method: 'POST',
            headers: {
                'Authorization': await authStore.getAccessToken() || '',
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(payload),
        });

        return await checkResponseAndGetJson(response) as unknown as SingleMessageEndpoint;
    } catch (error) {
        const errorMessage = (error as Error).message || 'An unknown error occurred creating the SingleMessageEndpoint';
        throw Error(errorMessage);
    }
}
