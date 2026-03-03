import { Model } from "@/types/model";
import { authStore } from "@/store/AuthStore";
import { checkResponseAndGetJson } from "@/utils/api/checkResponseAndParseJson";

export async function getModels(): Promise<Model[]> {
    try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/models`, {
            method: 'GET',
            headers: {
                'Authorization': await authStore.getAccessToken() || '',
                'Content-Type': 'application/json',
            },
        });
        const modelsObj = await checkResponseAndGetJson(response);
        return modelsObj["models"] as Model[];
    } catch (error) {
        const errorMessage = (error as Error).message || 'An unknown error occurred fetching models';
        throw Error(errorMessage);
    }
}
