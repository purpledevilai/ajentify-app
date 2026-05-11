import { Integration } from "@/types/integration";
import { request } from "@/api/client";

export async function exchangeGoogleCalendarCode(code: string, orgId?: string): Promise<Integration> {
  return request<Integration>({
    method: 'POST',
    path: '/google-calendar/auth',
    query: { org_id: orgId },
    body: { code },
  });
}
