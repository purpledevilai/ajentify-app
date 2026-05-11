import { Integration } from "@/types/integration";
import { request } from "@/api/client";

export async function exchangeOutlookCode(code: string, orgId?: string): Promise<Integration> {
  return request<Integration>({
    method: 'POST',
    path: '/outlook/auth',
    query: { org_id: orgId },
    body: { code },
  });
}
