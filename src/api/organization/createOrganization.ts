import { Organization } from "@/types/organization";
import { getAuthToken } from "@/utils/api/getAuthToken";
import { checkResponseAndGetJson } from "@/utils/api/checkResponseAndParseJson";

export interface CreateOrganizationPayload {
    name: string;
}

export async function createOrganization(payload: CreateOrganizationPayload): Promise<Organization> {
  try {
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/organization`, {
        method: 'POST',
        headers: {
            'Authorization': await getAuthToken(),
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
    });
    return await checkResponseAndGetJson(response) as unknown as Organization;
  } catch (error) {
    const errorMessage = (error as Error).message || 'An unknown error occurred creating the organization';
    throw Error(errorMessage);
  }
}