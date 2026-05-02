import { Manifest } from "@/types/manifest";
import { authStore } from "@/store/AuthStore";
import { checkResponseAndGetJson } from "@/utils/api/checkResponseAndParseJson";


export async function getStageManifest(stageId: string): Promise<Manifest> {
    try {
        const response = await fetch(
            `${process.env.NEXT_PUBLIC_API_BASE_URL}/stage/${encodeURIComponent(stageId)}/manifest`,
            {
                headers: {
                    'Authorization': await authStore.getAccessToken() || '',
                    'Content-Type': 'application/json'
                },
            },
        );
        return await checkResponseAndGetJson(response) as unknown as Manifest;
    } catch (error) {
        const errorMessage = (error as Error).message || 'An unknown error occurred getting the stage manifest';
        throw Error(errorMessage);
    }
}
