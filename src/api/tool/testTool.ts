import { authStore } from "@/store/AuthStore";
import { checkResponseAndGetJson } from "@/utils/api/checkResponseAndParseJson";
import { AnyType } from "@/types/tools";


export interface TestToolPayload {
    function_name: string;
    params: Record<string, AnyType>;
    code: string;
}

export async function testTool(payload: TestToolPayload): Promise<string> {
  try {
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/test-tool`, {
        method: 'POST',
        headers: {
            'Authorization': await authStore.getAccessToken() || '',
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
    });
    return (await checkResponseAndGetJson(response) as {result: string}).result;
  } catch (error) {
    const errorMessage = (error as Error).message || 'An unknown error occurred creating the team';
    throw Error(errorMessage);
  }
}