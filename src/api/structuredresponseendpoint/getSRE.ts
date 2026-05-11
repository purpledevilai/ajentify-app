import { request } from "@/api/client";
import { StructuredResponseEndpoint } from "@/types/structuredresponseendpoint";

export async function getSRE(sreId: string): Promise<StructuredResponseEndpoint> {
  return request<StructuredResponseEndpoint>({
    method: 'GET',
    path: `/sre/${sreId}`,
  });
}
