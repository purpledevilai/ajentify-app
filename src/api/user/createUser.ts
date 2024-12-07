import { User } from "@/types/user";
import { getAuthToken } from "@/utils/api/getAuthToken";
import { checkResponseAndGetJson } from "@/utils/api/checkResponseAndParseJson";


export async function createUser(): Promise<User> {
  try {
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/user`, {
        method: 'POST',
        headers: {
            'Authorization': await getAuthToken(),
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({})
    });
    return await checkResponseAndGetJson(response) as unknown as User;
  } catch (error) {
    const errorMessage = (error as Error).message || 'An unknown error occurred creating the user';
    throw Error(errorMessage);
  }
}