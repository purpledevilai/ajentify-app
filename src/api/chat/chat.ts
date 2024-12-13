import { authStore } from "@/store/AuthStore";
import { checkResponseAndGetJson } from "@/utils/api/checkResponseAndParseJson";
import { ChatResponse } from "@/types/chatresponse";

export interface ChatPayload {
    context_id: string;
    message: string;
}

export async function chat(payload: ChatPayload): Promise<ChatResponse> {
  try {
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/chat`, {
        method: 'POST',
        headers: {
            'Authorization': await authStore.getAccessToken() || '',
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
    });
    return await checkResponseAndGetJson(response) as unknown as ChatResponse;
  } catch (error) {
    const errorMessage = (error as Error).message || 'An unknown error occurred durring chat call';
    throw Error(errorMessage);
  }
}