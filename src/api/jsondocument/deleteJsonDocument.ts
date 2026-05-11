import { request } from "@/api/client";

export async function deleteJsonDocument(documentId: string): Promise<void> {
  await request<void>({
    method: 'DELETE',
    path: `/json-document/${documentId}`,
  });
}
