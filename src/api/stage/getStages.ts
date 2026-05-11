import { Stage } from "@/types/stage";
import { request } from "@/api/client";


export async function getStages(): Promise<Stage[]> {
  const { stages } = await request<{ stages: Stage[] }>({
    method: 'GET',
    path: '/stages',
  });
  return stages;
}
