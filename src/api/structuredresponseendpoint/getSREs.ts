import { StructuredResponseEndpoint } from "@/types/structuredresponseendpoint";
import { authStore } from "@/store/AuthStore";
import { checkResponseAndGetJson } from "@/utils/api/checkResponseAndParseJson";

export async function getSREs(orgId?: string): Promise<StructuredResponseEndpoint[]> {
  try {
    const query = orgId ? `?org_id=${orgId}` : '';
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/sres${query}`, {
        headers: {
            'Authorization': await authStore.getAccessToken() || '',
            'Content-Type': 'application/json',
        },
    });
    const sreObj = await checkResponseAndGetJson(response);
    return sreObj["sres"] as StructuredResponseEndpoint[];
  } catch (error) {
    const errorMessage = (error as Error).message || 'An unknown error occurred getting the StructuredResponseEndpoints';
    throw Error(errorMessage);
  }
}
