import { JsonDocument } from "@/types/jsondocument";
import { authStore } from "@/store/AuthStore";
import { checkResponseAndGetJson } from "@/utils/api/checkResponseAndParseJson";

interface GetJsonDocumentsOptions {
    /** Stage name (e.g. "frontend-staging") to scope the listing to deploy-managed documents. */
    stage?: string;
}

export async function getJsonDocuments(
    options: GetJsonDocumentsOptions = {},
): Promise<JsonDocument[]> {
    try {
        const params = new URLSearchParams();
        if (options.stage) params.set('stage', options.stage);
        const qs = params.toString();
        const url = `${process.env.NEXT_PUBLIC_API_BASE_URL}/json-documents${qs ? `?${qs}` : ''}`;
        const response = await fetch(url, {
            headers: {
                'Authorization': await authStore.getAccessToken() || '',
                'Content-Type': 'application/json'
            },
        });
        const obj = await checkResponseAndGetJson(response);
        return obj["json_documents"] as JsonDocument[];
    } catch (error) {
        const errorMessage = (error as Error).message || 'An unknown error occurred getting the documents';
        throw Error(errorMessage);
    }
}
