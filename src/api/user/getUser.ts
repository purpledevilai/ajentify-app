import { User } from "@/types/user";
import { request } from "@/api/client";


export async function getUser(): Promise<User> {
  return request<User>({
    method: 'GET',
    path: '/user',
  });
}
