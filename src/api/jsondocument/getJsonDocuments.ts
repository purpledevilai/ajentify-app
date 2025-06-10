import { JsonDocument } from "@/types/jsondocument";
import { authStore } from "@/store/AuthStore";
import { checkResponseAndGetJson } from "@/utils/api/checkResponseAndParseJson";

export async function getJsonDocuments(): Promise<JsonDocument[]> {
    try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/json-documents`, {
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
