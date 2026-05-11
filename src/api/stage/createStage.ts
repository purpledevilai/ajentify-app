import { Stage } from "@/types/stage";
import { request } from "@/api/client";

export interface CreateStagePayload {
    name: string;
    description?: string | null;
    /** Org to create the stage in. Defaults to the user's first org server-side. */
    org_id?: string;
}


export async function createStage(payload: CreateStagePayload): Promise<Stage> {
  return request<Stage>({
    method: 'POST',
    path: '/stage',
    body: payload,
  });
}
