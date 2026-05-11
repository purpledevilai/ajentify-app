import { request } from "@/api/client";
import { Context } from "@/types/context";

export interface GetContextPayload {
    context_id: string;
    with_tool_calls?: boolean;
}

export async function getContext({context_id, with_tool_calls}: GetContextPayload): Promise<Context> {
  return request<Context>({
    method: 'GET',
    path: `/context/${context_id}`,
    query: { with_tool_calls: with_tool_calls || undefined },
  });
}
