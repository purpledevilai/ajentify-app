import { request } from "@/api/client";
import { ChatPageData } from "@/types/chatpagedata";

export async function updateChatPage(chatPage: ChatPageData): Promise<ChatPageData> {
  return request<ChatPageData>({
    method: 'POST',
    path: `/chat-page/${chatPage.chat_page_id}`,
    body: chatPage,
  });
}
