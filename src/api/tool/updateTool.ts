import { Tool } from "@/types/tools";
import { authStore } from "@/store/AuthStore";
import { checkResponseAndGetJson } from "@/utils/api/checkResponseAndParseJson";

interface UpdateToolPayload {
    tool_id: string;
    name?: string;
    description?: string;
    pd_id?: string;
    code?: string;
    pass_context?: boolean;
}

export async function updateTool(payload: UpdateToolPayload): Promise<Tool> {
  try {
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/tool/${payload.tool_id}`, {
        method: 'POST',
        headers: {
            'Authorization': await authStore.getAccessToken() || '',
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload),
    });
    return await checkResponseAndGetJson(response) as unknown as Tool;
  } catch (error) {
    const errorMessage = (error as Error).message || 'An unknown error occurred updating the tool';
    throw Error(errorMessage);
  }
}