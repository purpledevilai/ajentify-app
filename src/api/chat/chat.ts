import { request } from "@/api/client";
import { ChatResponse } from "@/types/chatresponse";

export interface ChatPayload {
    context_id: string;
    message: string;
}

export async function chat(payload: ChatPayload): Promise<ChatResponse> {
  return request<ChatResponse>({
    method: 'POST',
    path: '/chat',
    body: payload,
  });
}
