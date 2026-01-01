import { Integration } from "@/types/integration";
import { authStore } from "@/store/AuthStore";
import { checkResponseAndGetJson } from "@/utils/api/checkResponseAndParseJson";

export async function exchangeGmailCode(code: string, orgId?: string): Promise<Integration> {
  try {
    const params = new URLSearchParams();
    if (orgId) {
      params.append('org_id', orgId);
    }
    
    const url = `${process.env.NEXT_PUBLIC_API_BASE_URL}/gmail/auth${params.toString() ? `?${params}` : ''}`;
    
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Authorization': await authStore.getAccessToken() || '',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ code }),
    });
    const data = await checkResponseAndGetJson(response);
    return data as Integration;
  } catch (error) {
    const errorMessage = (error as Error).message || 'An unknown error occurred exchanging Gmail code';
    throw Error(errorMessage);
  }
}

