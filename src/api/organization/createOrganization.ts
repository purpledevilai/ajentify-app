import { Organization } from "@/types/organization";
import { request } from "@/api/client";

export interface CreateOrganizationPayload {
    name: string;
}

export async function createOrganization(payload: CreateOrganizationPayload): Promise<Organization> {
  return request<Organization>({
    method: 'POST',
    path: '/organization',
    body: payload,
  });
}
