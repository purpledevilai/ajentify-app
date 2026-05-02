import { Stage } from "@/types/stage";
import { authStore } from "@/store/AuthStore";
import { checkResponseAndGetJson } from "@/utils/api/checkResponseAndParseJson";


export async function getStage(stageId: string): Promise<Stage> {
    try {
        const response = await fetch(
            `${process.env.NEXT_PUBLIC_API_BASE_URL}/stage/${encodeURIComponent(stageId)}`,
            {
                headers: {
                    'Authorization': await authStore.getAccessToken() || '',
                    'Content-Type': 'application/json'
                },
            },
        );
        return await checkResponseAndGetJson(response) as unknown as Stage;
    } catch (error) {
        const errorMessage = (error as Error).message || 'An unknown error occurred getting the stage';
        throw Error(errorMessage);
    }
}
