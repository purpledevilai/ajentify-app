import { ChatPageData } from "@/types/chatpagedata";
import { request } from "@/api/client";

export async function getChatPages(): Promise<ChatPageData[]> {
  const result = await request<{ chat_pages: ChatPageData[] }>({
    method: 'GET',
    path: '/chat-pages',
  });
  return result.chat_pages;
}
