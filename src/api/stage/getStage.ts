import { Stage } from "@/types/stage";
import { request } from "@/api/client";


export async function getStage(stageId: string): Promise<Stage> {
  return request<Stage>({
    method: 'GET',
    path: `/stage/${encodeURIComponent(stageId)}`,
  });
}
