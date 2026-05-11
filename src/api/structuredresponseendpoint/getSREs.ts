import { StructuredResponseEndpoint } from "@/types/structuredresponseendpoint";
import { request } from "@/api/client";

interface GetSREsOptions {
    /** Stage name (e.g. "frontend-staging") to scope the listing to deploy-managed SREs. */
    stage?: string;
}

export async function getSREs(orgId?: string, options: GetSREsOptions = {}): Promise<StructuredResponseEndpoint[]> {
  const { sres } = await request<{ sres: StructuredResponseEndpoint[] }>({
    method: 'GET',
    path: '/sres',
    query: { org_id: orgId, stage: options.stage },
  });
  return sres;
}
