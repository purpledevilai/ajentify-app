import { ChatPageData } from "@/types/chatpagedata";
import { authStore } from "@/store/AuthStore";
import { checkResponseAndGetJson } from "@/utils/api/checkResponseAndParseJson";


export async function getChatPages(): Promise<ChatPageData[]> {
  try {
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/chat-pages`, {
        headers: {
            'Authorization': await authStore.getAccessToken() || '',
            'Content-Type': 'application/json'
        },
    });
    const chatPagesObj = await checkResponseAndGetJson(response);
    return chatPagesObj["chat_pages"] as ChatPageData[];
  } catch (error) {
    const errorMessage = (error as Error).message || 'An unknown error occurred getting the chat pages';
    throw Error(errorMessage);
  }
}