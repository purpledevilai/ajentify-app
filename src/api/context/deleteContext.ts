import { authStore } from "@/store/AuthStore";
import { checkResponseAndGetJson } from "@/utils/api/checkResponseAndParseJson";
import { createUrlParams } from "@/utils/api/createURLParams";
import { Context } from "@/types/context";

export interface DeleteContextPayload {
    context_id: string;
}

export async function deleteContext({context_id}: DeleteContextPayload): Promise<void> {
  try {
    const urlParams = createUrlParams({context_id})
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/context${urlParams}`, {
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