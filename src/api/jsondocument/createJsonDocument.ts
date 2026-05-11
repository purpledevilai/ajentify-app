import { JsonDocument } from "@/types/jsondocument";
import { request } from "@/api/client";

interface CreateJsonDocumentPayload {
    name: string;
    data: Record<string, unknown>;
}

export async function createJsonDocument(payload: CreateJsonDocumentPayload): Promise<JsonDocument> {
  return request<JsonDocument>({
    method: 'POST',
    path: '/json-document',
    body: payload,
  });
}
