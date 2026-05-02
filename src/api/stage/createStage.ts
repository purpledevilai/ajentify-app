import { Stage } from "@/types/stage";
import { authStore } from "@/store/AuthStore";
import { checkResponseAndGetJson } from "@/utils/api/checkResponseAndParseJson";

export interface CreateStagePayload {
    name: string;
    description?: string | null;
    /** Org to create the stage in. Defaults to the user's first org server-side. */
    org_id?: string;
}


export async function createStage(payload: CreateStagePayload): Promise<Stage> {
    try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/stage`, {
            method: 'POST',
            headers: {
                'Authorization': await authStore.getAccessToken() || '',
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(payload),
        });
        return await checkResponseAndGetJson(response) as unknown as Stage;
    } catch (error) {
        const errorMessage = (error as Error).message || 'An unknown error occurred creating the stage';
        throw Error(errorMessage);
    }
}
