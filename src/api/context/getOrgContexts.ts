import { authStore } from "@/store/AuthStore";
import { checkResponseAndGetJson } from "@/utils/api/checkResponseAndParseJson";
import { GetOrgContextsResponse } from "@/types/context";

export interface GetOrgContextsParams {
    org_id?: string;
    agent_id?: string;
    client_id?: string;
    limit?: number;
    cursor?: string;
}

export async function getOrgContexts(params: GetOrgContextsParams = {}): Promise<GetOrgContextsResponse> {
    const search = new URLSearchParams();
    if (params.org_id) search.set('org_id', params.org_id);
    if (params.agent_id) search.set('agent_id', params.agent_id);
    if (params.client_id) search.set('client_id', params.client_id);
    if (params.limit !== undefined) search.set('limit', String(params.limit));
    if (params.cursor) search.set('cursor', params.cursor);

    const qs = search.toString();
    const url = `${process.env.NEXT_PUBLIC_API_BASE_URL}/org-contexts${qs ? `?${qs}` : ''}`;

    try {
        const response = await fetch(url, {
            method: 'GET',
            headers: {
                'Authorization': await authStore.getAccessToken() || '',
                'Content-Type': 'application/json',
            },
        });
        return await checkResponseAndGetJson(response) as unknown as GetOrgContextsResponse;
    } catch (error) {
        const errorMessage = (error as Error).message || 'An unknown error occurred fetching org contexts';
        throw Error(errorMessage);
    }
}
