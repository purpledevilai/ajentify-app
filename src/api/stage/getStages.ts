import { Stage } from "@/types/stage";
import { authStore } from "@/store/AuthStore";
import { checkResponseAndGetJson } from "@/utils/api/checkResponseAndParseJson";


export async function getStages(): Promise<Stage[]> {
    try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/stages`, {
            headers: {
                'Authorization': await authStore.getAccessToken() || '',
                'Content-Type': 'application/json'
            },
        });
        const body = await checkResponseAndGetJson(response);
        return body["stages"] as Stage[];
    } catch (error) {
        const errorMessage = (error as Error).message || 'An unknown error occurred getting the stages';
        throw Error(errorMessage);
    }
}
