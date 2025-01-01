import { checkResponseAndGetJson } from "@/utils/api/checkResponseAndParseJson";
import { ChatPageData } from "@/types/chatpagedata";

export async function getChatPage(chatPageId: string): Promise<ChatPageData> {
  try {
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/chat-page/${chatPageId}`, {
        method: 'GET'
    });
    return await checkResponseAndGetJson(response) as unknown as ChatPageData;
  } catch (error) {
    const errorMessage = (error as Error).message || 'An unknown error occurred getting chat page data';
    throw Error(errorMessage);
  }
}