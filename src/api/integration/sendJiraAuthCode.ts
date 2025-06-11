import { authStore } from "@/store/AuthStore";
import { checkResponseAndGetJson } from "@/utils/api/checkResponseAndParseJson";

export async function sendJiraAuthCode(code: string): Promise<void> {
    try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/jira-auth-code?code=${encodeURIComponent(code)}`, {
            method: 'GET',
            headers: {
                'Authorization': await authStore.getAccessToken() || '',
            },
        });
        await checkResponseAndGetJson(response);
    } catch (error) {
        const errorMessage = (error as Error).message || 'An unknown error occurred sending the jira auth code';
        throw Error(errorMessage);
    }
}
