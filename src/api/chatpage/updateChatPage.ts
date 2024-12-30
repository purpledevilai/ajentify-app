import { authStore } from "@/store/AuthStore";
import { checkResponseAndGetJson } from "@/utils/api/checkResponseAndParseJson";
import { ChatBoxStyle } from "@/types/chatboxstyle";
import { ChatPageData } from "@/types/chatpagedata";


interface UpdateChatPagePayload {
    agent_id: string;
    org_id?: string;
    heading: string;
    description?: string;
    chat_page_style: {
        background_color: string;
        text_color: string;
        heading_color: string;
        description_color: string;
        button_background_color: string;
        button_text_color: string;
        button_hover_background_color: string;
        button_hover_text_color: string;
    };
    chat_box_style: ChatBoxStyle;
    buttons?: { label: string; link: string }[];
}

export async function updateChatPage(payload: UpdateChatPagePayload): Promise<ChatPageData> {
  try {
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/agent/${payload.agent_id}`, {
        method: 'POST',
        headers: {
            'Authorization': await authStore.getAccessToken() || '',
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload),
    });
    return await checkResponseAndGetJson(response) as unknown as ChatPageData;
  } catch (error) {
    const errorMessage = (error as Error).message || 'An unknown error occurred updating the chat page';
    throw Error(errorMessage);
  }
}