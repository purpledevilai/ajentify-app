import { request } from "@/api/client";
import { AnyType } from "@/types/tools";

export interface RunSREPayload {
    sre_id: string;
    prompt_args?: Record<string, string>;
}

export async function runSRE(payload: RunSREPayload): Promise<AnyType> {
  return request<AnyType>({
    method: 'POST',
    path: `/run-sre/${payload.sre_id}`,
    body: payload.prompt_args || {},
  });
}
