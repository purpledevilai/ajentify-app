import { authStore } from "@/store/AuthStore";
import { checkResponseAndGetJson } from "@/utils/api/checkResponseAndParseJson";
import { Job } from "@/types/job";

export async function getJob(jobId: string): Promise<Job> {
  try {
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/job/${jobId}`, {
        method: 'GET',
        headers: {
            'Authorization': await authStore.getAccessToken() || '',
            'Content-Type': 'application/json'
        },
    });
    return await checkResponseAndGetJson(response) as unknown as Job;
  } catch (error) {
    const errorMessage = (error as Error).message || 'An unknown error occurred getting the job';
    throw Error(errorMessage);
  }
}