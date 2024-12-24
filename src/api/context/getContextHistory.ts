import { authStore } from "@/store/AuthStore";
import { checkResponseAndGetJson } from "@/utils/api/checkResponseAndParseJson";
import { ContextHistory } from "@/types/contexthistory";


export async function getContextHistory(): Promise<ContextHistory[]> {
  try {
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/context-history`, {
        method: 'GET',
        headers: {
            'Authorization': await authStore.getAccessToken() || '',
            'Content-Type': 'application/json'
        },
    });
    const contextHistoryObj = await checkResponseAndGetJson(response);
    return contextHistoryObj["contexts"] as ContextHistory[];
  } catch (error) {
    const errorMessage = (error as Error).message || 'An unknown error occurred getting the context history';
    throw Error(errorMessage);
  }
}