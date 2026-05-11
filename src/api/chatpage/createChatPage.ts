import { request } from "@/api/client";
import { ChatPageData } from "@/types/chatpagedata";

export async function createChatPage(chatPage: ChatPageData): Promise<ChatPageData> {
  return request<ChatPageData>({
    method: 'POST',
    path: '/chat-page',
    body: chatPage,
  });
}
