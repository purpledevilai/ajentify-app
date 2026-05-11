import { SimpleUser } from "@/types/simpleuser";
import { request } from "@/api/client";


export async function createUser(): Promise<SimpleUser> {
  return request<SimpleUser>({
    method: 'POST',
    path: '/user',
    body: {},
  });
}
