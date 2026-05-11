import { request } from "@/api/client";
import { ContextHistory } from "@/types/contexthistory";


export async function getContextHistory(): Promise<ContextHistory[]> {
  const { contexts } = await request<{ contexts: ContextHistory[] }>({
    method: 'GET',
    path: '/context-history',
  });
  return contexts;
}
