import { Integration } from "@/types/integration";
import { authStore } from "@/store/AuthStore";
import { checkResponseAndGetJson } from "@/utils/api/checkResponseAndParseJson";

export async function getIntegrations(): Promise<Integration[]> {
    try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/integrations`, {
            headers: {
                'Authorization': await authStore.getAccessToken() || '',
                'Content-Type': 'application/json'
            },
        });
        const integrationsObj = await checkResponseAndGetJson(response);
        return integrationsObj["integrations"] as Integration[];
    } catch (error) {
        const errorMessage = (error as Error).message || 'An unknown error occurred getting the integrations';
        throw Error(errorMessage);
    }
}
