import { Stage } from "@/types/stage";
import { request } from "@/api/client";

export interface UpdateStagePayload {
    /** New name for the stage. Optional — omit to leave unchanged. */
    name?: string;
    description?: string | null;
}


export async function updateStage(stageId: string, payload: UpdateStagePayload): Promise<Stage> {
  return request<Stage>({
    method: 'POST',
    path: `/stage/${encodeURIComponent(stageId)}`,
    body: payload,
  });
}
