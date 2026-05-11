import { Tool } from "@/types/tools";
import { request } from "@/api/client";

interface CreateToolPayload {
    name?: string;
    description?: string;
    pd_id?: string | null;
    code?: string;
    pass_context?: boolean;
    is_async?: boolean;
    is_client_side_tool?: boolean;
}

export async function createTool(payload: CreateToolPayload): Promise<Tool> {
  return request<Tool>({
    method: 'POST',
    path: '/tool',
    body: payload,
  });
}
