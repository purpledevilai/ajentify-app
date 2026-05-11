import { Tool } from "@/types/tools";
import { request } from "@/api/client";

interface UpdateToolPayload {
    tool_id: string;
    name?: string;
    description?: string;
    pd_id?: string | null;
    code?: string;
    pass_context?: boolean;
    is_async?: boolean;
    is_client_side_tool?: boolean;
    /** Pair with `logical_name` to attach this tool to a stage. Pass both as null to detach. Omit both to leave the binding unchanged. */
    stage_id?: string | null;
    logical_name?: string | null;
}

export async function updateTool(payload: UpdateToolPayload): Promise<Tool> {
  return request<Tool>({
    method: 'POST',
    path: `/tool/${payload.tool_id}`,
    body: payload,
  });
}
