import { Stage } from "@/types/stage";
import { authStore } from "@/store/AuthStore";
import { checkResponseAndGetJson } from "@/utils/api/checkResponseAndParseJson";

export interface UpdateStagePayload {
    /** New name for the stage. Optional — omit to leave unchanged. */
    name?: string;
    description?: string | null;
}


export async function updateStage(stageId: string, payload: UpdateStagePayload): Promise<Stage> {
    try {
        const response = await fetch(
            `${process.env.NEXT_PUBLIC_API_BASE_URL}/stage/${encodeURIComponent(stageId)}`,
            {
                method: 'POST',
                headers: {
                    'Authorization': await authStore.getAccessToken() || '',
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(payload),
            },
        );
        return await checkResponseAndGetJson(response) as unknown as Stage;
    } catch (error) {
        const errorMessage = (error as Error).message || 'An unknown error occurred updating the stage';
        throw Error(errorMessage);
    }
}
