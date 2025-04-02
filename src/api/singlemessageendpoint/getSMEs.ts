import { SingleMessageEndpoint } from "@/types/singlemessageendpoint";
import { authStore } from "@/store/AuthStore";
import { checkResponseAndGetJson } from "@/utils/api/checkResponseAndParseJson";

export async function getSMEs(orgId?: string): Promise<SingleMessageEndpoint[]> {
  try {
    const query = orgId ? `?org_id=${orgId}` : '';
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/smes${query}`, {
        headers: {
            'Authorization': await authStore.getAccessToken() || '',
            'Content-Type': 'application/json',
        },
    });
    const smeObj = await checkResponseAndGetJson(response);
    return smeObj["smes"] as SingleMessageEndpoint[];
  } catch (error) {
    const errorMessage = (error as Error).message || 'An unknown error occurred getting the SingleMessageEndpoints';
    throw Error(errorMessage);
  }
}
