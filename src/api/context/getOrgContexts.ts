import { request } from "@/api/client";
import { GetOrgContextsResponse } from "@/types/context";

export interface GetOrgContextsParams {
    org_id?: string;
    agent_id?: string;
    client_id?: string;
    limit?: number;
    cursor?: string;
}

export async function getOrgContexts(params: GetOrgContextsParams = {}): Promise<GetOrgContextsResponse> {
  return request<GetOrgContextsResponse>({
    method: 'GET',
    path: '/org-contexts',
    query: {
      org_id: params.org_id,
      agent_id: params.agent_id,
      client_id: params.client_id,
      limit: params.limit,
      cursor: params.cursor,
    },
  });
}
