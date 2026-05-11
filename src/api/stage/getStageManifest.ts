import { Manifest } from "@/types/manifest";
import { request } from "@/api/client";


export async function getStageManifest(stageId: string): Promise<Manifest> {
  return request<Manifest>({
    method: 'GET',
    path: `/stage/${encodeURIComponent(stageId)}/manifest`,
  });
}
