import { request } from "@/api/client";

export async function deleteChatPage(chatPageId: string): Promise<void> {
  await request<void>({
    method: 'DELETE',
    path: `/chat-page/${chatPageId}`,
  });
}
