import { JsonDocument } from "@/types/jsondocument";
import { request } from "@/api/client";

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
  return request<JsonDocument>({
    method: 'POST',
    path: `/json-document/${payload.document_id}`,
    body: payload,
  });
}
