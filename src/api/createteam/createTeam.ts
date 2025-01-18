import { authStore } from "@/store/AuthStore";
import { checkResponseAndGetJson } from "@/utils/api/checkResponseAndParseJson";

export interface CreateTeamPayload {
    business_name: string;
    business_description: string;
    link_data: { link: string, data: string }[];
    selected_members: string[];
}

export interface CreateTeamResponse {
    job_id: string;
}

export async function createTeam(payload: CreateTeamPayload): Promise<CreateTeamResponse> {
  try {
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/organization`, {
        method: 'POST',
        headers: {
            'Authorization': await authStore.getAccessToken() || '',
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
    });
    return await checkResponseAndGetJson(response) as unknown as CreateTeamResponse;
  } catch (error) {
    const errorMessage = (error as Error).message || 'An unknown error occurred creating the team';
    throw Error(errorMessage);
  }
}