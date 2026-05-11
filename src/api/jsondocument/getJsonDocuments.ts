import { JsonDocument } from "@/types/jsondocument";
import { request } from "@/api/client";

interface GetJsonDocumentsOptions {
    /** Stage name (e.g. "frontend-staging") to scope the listing to deploy-managed documents. */
    stage?: string;
}

export async function getJsonDocuments(
    options: GetJsonDocumentsOptions = {},
): Promise<JsonDocument[]> {
  const { json_documents } = await request<{ json_documents: JsonDocument[] }>({
    method: 'GET',
    path: '/json-documents',
    query: { stage: options.stage },
  });
  return json_documents;
}
