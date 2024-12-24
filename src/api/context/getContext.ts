import { authStore } from "@/store/AuthStore";
import { checkResponseAndGetJson } from "@/utils/api/checkResponseAndParseJson";
import { Context } from "@/types/context";

export interface GetContextPayload {
    context_id: string;
}

export async function getContext({context_id}: GetContextPayload): Promise<Context> {
  try {
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/context/${context_id}`, {
        method: 'GET',
        headers: {
            'Authorization': await authStore.getAccessToken() || '',
            'Content-Type': 'application/json'
        },
    });
    return await checkResponseAndGetJson(response) as unknown as Context;
  } catch (error) {
    const errorMessage = (error as Error).message || 'An unknown error occurred creating the context';
    throw Error(errorMessage);
  }
}