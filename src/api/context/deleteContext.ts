import { authStore } from "@/store/AuthStore";
import { checkResponseAndGetJson } from "@/utils/api/checkResponseAndParseJson";

export interface DeleteContextPayload {
    context_id: string;
}

export async function deleteContext({context_id}: DeleteContextPayload): Promise<void> {
  try {
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/context/${context_id}`, {
        method: 'DELETE',
        headers: {
            'Authorization': await authStore.getAccessToken() || '',
            'Content-Type': 'application/json'
        },
    });
    await checkResponseAndGetJson(response);
  } catch (error) {
    const errorMessage = (error as Error).message || 'An unknown error occurred deleting the context';
    throw Error(errorMessage);
  }
}