import { request } from "@/api/client";
import { Job } from "@/types/job";

export async function getJob(jobId: string): Promise<Job> {
  return request<Job>({
    method: 'GET',
    path: `/job/${jobId}`,
  });
}
