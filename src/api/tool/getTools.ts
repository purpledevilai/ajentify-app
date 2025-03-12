import { Tool } from "@/types/tools";
import { authStore } from "@/store/AuthStore";
import { checkResponseAndGetJson } from "@/utils/api/checkResponseAndParseJson";


export async function getTools(): Promise<Tool[]> {
  try {
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/tools`, {
        headers: {
            'Authorization': await authStore.getAccessToken() || '',
            'Content-Type': 'application/json'
        },
    });
    const toolObj = await checkResponseAndGetJson(response);
    return toolObj["tools"] as Tool[];
  } catch (error) {
    const errorMessage = (error as Error).message || 'An unknown error occurred getting the tools';
    throw Error(errorMessage);
  }
}