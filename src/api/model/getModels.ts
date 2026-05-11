import { Model } from "@/types/model";
import { request } from "@/api/client";

export async function getModels(): Promise<Model[]> {
  const { models } = await request<{ models: Model[] }>({
    method: 'GET',
    path: '/models',
  });
  return models;
}
