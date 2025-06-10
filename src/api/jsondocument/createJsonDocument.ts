import { JsonDocument } from "@/types/jsondocument";
import { authStore } from "@/store/AuthStore";
import { checkResponseAndGetJson } from "@/utils/api/checkResponseAndParseJson";

interface CreateJsonDocumentPayload {
    name: string;
    data: Record<string, unknown>;
}

export async function createJsonDocument(payload: CreateJsonDocumentPayload): Promise<JsonDocument> {
    try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/json-document`, {
            method: 'POST',
            headers: {
                'Authorization': await authStore.getAccessToken() || '',
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(payload),
        });
        return await checkResponseAndGetJson(response) as unknown as JsonDocument;
    } catch (error) {
        const errorMessage = (error as Error).message || 'An unknown error occurred creating the document';
        throw Error(errorMessage);
    }
}
