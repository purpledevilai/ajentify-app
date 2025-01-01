import { authStore } from "@/store/AuthStore";
import { checkResponseAndGetJson } from "@/utils/api/checkResponseAndParseJson";
import { ChatPageData } from "@/types/chatpagedata";

export async function createChatPage(chatPage: ChatPageData): Promise<ChatPageData> {
  try {
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/chat-page`, {
        method: 'POST',
        headers: {
            'Authorization': await authStore.getAccessToken() || '',
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(chatPage),
    });
    return await checkResponseAndGetJson(response) as unknown as ChatPageData;
  } catch (error) {
    const errorMessage = (error as Error).message || 'An unknown error occurred creating the chat page';
    throw Error(errorMessage);
  }
}