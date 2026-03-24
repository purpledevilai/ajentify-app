import { authStore } from "@/store/AuthStore";
import { checkResponseAndGetJson } from "@/utils/api/checkResponseAndParseJson";

export interface APIKeySummary {
    api_key_id: string;
    org_id: string;
    token_hint: string;
    valid: boolean;
    created_at: number;
}

export interface GetAPIKeysResponse {
    api_keys: APIKeySummary[];
}

export async function getAPIKeys(org_id?: string): Promise<GetAPIKeysResponse> {
    try {
        const searchParams = new URLSearchParams();
        if (org_id) searchParams.set('org_id', org_id);

        const url = searchParams.toString()
            ? `${process.env.NEXT_PUBLIC_API_BASE_URL}/api-keys?${searchParams.toString()}`
            : `${process.env.NEXT_PUBLIC_API_BASE_URL}/api-keys`;

        const response = await fetch(url, {
            headers: {
                'Authorization': await authStore.getAccessToken() || '',
                'Content-Type': 'application/json',
            },
        });
        return await checkResponseAndGetJson(response) as unknown as GetAPIKeysResponse;
    } catch (error) {
        const errorMessage = (error as Error).message || 'An unknown error occurred fetching API keys';
        throw Error(errorMessage);
    }
}
