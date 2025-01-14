import { SimpleUser } from "@/types/simpleuser";
import { authStore } from "@/store/AuthStore";
import { checkResponseAndGetJson } from "@/utils/api/checkResponseAndParseJson";


export async function createUser(): Promise<SimpleUser> {
  try {
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/user`, {
        method: 'POST',
        headers: {
            'Authorization': await authStore.getAccessToken() || '',
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({})
    });
    return await checkResponseAndGetJson(response) as unknown as SimpleUser;
  } catch (error) {
    const errorMessage = (error as Error).message || 'An unknown error occurred creating the user';
    throw Error(errorMessage);
  }
}