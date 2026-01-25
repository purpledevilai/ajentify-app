import { authStore } from "@/store/AuthStore";
import { checkResponseAndGetJson } from "@/utils/api/checkResponseAndParseJson";

export async function getGoogleCalendarAuthUrl(orgId?: string): Promise<string> {
  try {
    const params = new URLSearchParams();
    if (orgId) {
      params.append('org_id', orgId);
    }
    
    const url = `${process.env.NEXT_PUBLIC_API_BASE_URL}/google-calendar/auth-url${params.toString() ? `?${params}` : ''}`;
    
    const response = await fetch(url, {
      headers: {
        'Authorization': await authStore.getAccessToken() || '',
        'Content-Type': 'application/json'
      },
    });
    const data = await checkResponseAndGetJson(response);
    return data.auth_url as string;
  } catch (error) {
    const errorMessage = (error as Error).message || 'An unknown error occurred getting Google Calendar auth URL';
    throw Error(errorMessage);
  }
}

