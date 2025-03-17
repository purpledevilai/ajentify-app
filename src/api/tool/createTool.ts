import { Tool } from "@/types/tools";
import { authStore } from "@/store/AuthStore";
import { checkResponseAndGetJson } from "@/utils/api/checkResponseAndParseJson";

interface CreateToolPayload {
    name?: string;
    description?: string;
    pd_id?: string;
    code?: string;
}

export async function createTool(payload: CreateToolPayload): Promise<Tool> {
    try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/tool`, {
            method: 'POST',
            headers: {
                'Authorization': await authStore.getAccessToken() || '',
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(payload),
        });
        return await checkResponseAndGetJson(response) as unknown as Tool;
    } catch (error) {
        const errorMessage = (error as Error).message || 'An unknown error occurred creating the tool';
        throw Error(errorMessage);
    }
}
