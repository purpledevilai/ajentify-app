import { request } from "@/api/client";

export async function getGoogleCalendarAuthUrl(orgId?: string): Promise<string> {
  const data = await request<{ auth_url: string }>({
    method: 'GET',
    path: '/google-calendar/auth-url',
    query: { org_id: orgId },
  });
  return data.auth_url;
}
