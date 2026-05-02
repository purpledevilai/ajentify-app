import { StructuredResponseEndpoint } from "@/types/structuredresponseendpoint";
import { authStore } from "@/store/AuthStore";
import { checkResponseAndGetJson } from "@/utils/api/checkResponseAndParseJson";

interface GetSREsOptions {
    /** Stage name (e.g. "frontend-staging") to scope the listing to deploy-managed SREs. */
    stage?: string;
}

export async function getSREs(orgId?: string, options: GetSREsOptions = {}): Promise<StructuredResponseEndpoint[]> {
  try {
    const params = new URLSearchParams();
    if (orgId) params.set('org_id', orgId);
    if (options.stage) params.set('stage', options.stage);
    const qs = params.toString();
    const url = `${process.env.NEXT_PUBLIC_API_BASE_URL}/sres${qs ? `?${qs}` : ''}`;
    const response = await fetch(url, {
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
