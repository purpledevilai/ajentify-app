import { request } from "@/api/client";

export async function deleteSRE(sreId: string): Promise<void> {
  await request<void>({
    method: 'DELETE',
    path: `/sre/${sreId}`,
  });
}
