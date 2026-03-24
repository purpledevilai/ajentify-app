import { authStore } from "@/store/AuthStore";
import { checkResponseAndGetJson } from "@/utils/api/checkResponseAndParseJson";
import { APIKeySummary } from "./getAPIKeys";

export async function revokeAPIKey(api_key_id: string): Promise<APIKeySummary> {
    try {
        const response = await fetch(
            `${process.env.NEXT_PUBLIC_API_BASE_URL}/revoke-api-key`,
            {
                method: 'POST',
                headers: {
                    'Authorization': await authStore.getAccessToken() || '',
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ api_key_id }),
            }
        );
        return await checkResponseAndGetJson(response) as unknown as APIKeySummary;
    } catch (error) {
        const errorMessage = (error as Error).message || 'An unknown error occurred revoking API key';
        throw Error(errorMessage);
    }
}
