import { JsonDocument } from "@/types/jsondocument";
import { authStore } from "@/store/AuthStore";
import { checkResponseAndGetJson } from "@/utils/api/checkResponseAndParseJson";

interface UpdateJsonDocumentPayload {
    document_id: string;
    name?: string;
    data?: Record<string, unknown>;
    is_public?: boolean;
    /** Pair with `logical_name` to attach this document to a stage. Pass both as null to detach. Omit both to leave the binding unchanged. */
    stage_id?: string | null;
    logical_name?: string | null;
}

export async function updateJsonDocument(payload: UpdateJsonDocumentPayload): Promise<JsonDocument> {
    try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/json-document/${payload.document_id}`, {
            method: 'POST',
            headers: {
                'Authorization': await authStore.getAccessToken() || '',
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(payload),
        });
        return await checkResponseAndGetJson(response) as unknown as JsonDocument;
    } catch (error) {
        const errorMessage = (error as Error).message || 'An unknown error occurred updating the document';
        throw Error(errorMessage);
    }
}
