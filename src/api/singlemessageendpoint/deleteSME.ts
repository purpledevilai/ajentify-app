import { authStore } from "@/store/AuthStore";
import { checkResponseAndGetJson } from "@/utils/api/checkResponseAndParseJson";

export async function deleteSME(smeId: string): Promise<void> {
  try {
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/sme/${smeId}`, {
        method: 'DELETE',
        headers: {
            'Authorization': await authStore.getAccessToken() || '',
            'Content-Type': 'application/json',
        },
    });

    await checkResponseAndGetJson(response);
  } catch (error) {
    const errorMessage = (error as Error).message || 'An unknown error occurred deleting the SingleMessageEndpoint';
    throw Error(errorMessage);
  }
}
