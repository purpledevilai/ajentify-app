import { Integration } from "@/types/integration";
import { request } from "@/api/client";

export async function exchangeGmailCode(code: string, orgId?: string): Promise<Integration> {
  return request<Integration>({
    method: 'POST',
    path: '/gmail/auth',
    query: { org_id: orgId },
    body: { code },
  });
}
