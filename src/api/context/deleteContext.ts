import { request } from "@/api/client";

export interface DeleteContextPayload {
    context_id: string;
}

export async function deleteContext({context_id}: DeleteContextPayload): Promise<void> {
  await request<void>({
    method: 'DELETE',
    path: `/context/${context_id}`,
  });
}
