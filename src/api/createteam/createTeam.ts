import { request } from "@/api/client";
import { Job } from "@/types/job";

export interface CreateTeamPayload {
    business_name: string;
    business_description: string;
    link_data: { link: string, data: string }[];
    selected_members: string[];
}

export async function createTeam(payload: CreateTeamPayload): Promise<Job> {
  return request<Job>({
    method: 'POST',
    path: '/create-team',
    body: payload,
  });
}
