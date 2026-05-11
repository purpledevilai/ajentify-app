import { request } from "@/api/client";

export async function deleteParameterDefinition(pdId: string): Promise<void> {
  await request<void>({
    method: 'DELETE',
    path: `/parameter-definition/${pdId}`,
  });
}
