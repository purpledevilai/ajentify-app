import { authStore } from "@/store/AuthStore";
import { checkResponseAndGetJson } from "@/utils/api/checkResponseAndParseJson";

export interface GenerateAPIKeyResponse {
    api_key_id: string;
    org_id: string;
    token: string;
    valid: boolean;
    type: string;
    user_id: string;
    created_at: number;
    updated_at: number;
}

export async function generateAPIKey(org_id: string): Promise<GenerateAPIKeyResponse> {
    try {
        const response = await fetch(
            `${process.env.NEXT_PUBLIC_API_BASE_URL}/generate-api-key`,
            {
                method: 'POST',
                headers: {
                    'Authorization': await authStore.getAccessToken() || '',
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ org_id, type: 'org' }),
            }
        );
        return await checkResponseAndGetJson(response) as unknown as GenerateAPIKeyResponse;
    } catch (error) {
        const errorMessage = (error as Error).message || 'An unknown error occurred generating API key';
        throw Error(errorMessage);
    }
}
