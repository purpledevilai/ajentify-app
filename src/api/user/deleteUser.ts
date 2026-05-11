import { request } from "@/api/client";


export async function deleteUser(): Promise<void> {
  await request<void>({
    method: 'DELETE',
    path: '/user',
  });
}
